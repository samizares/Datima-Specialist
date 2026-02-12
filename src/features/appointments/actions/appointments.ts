"use server";

import { revalidatePath } from "next/cache";
import { addHours } from "date-fns";
import { z } from "zod";

import {
  ActionState,
  fromErrorToActionState,
  toActionState,
} from "@/components/form/utils/to-action-state";
import { getAuthOrRedirect } from "@/features/auth/queries/get-auth-or-redirect";
import { isAdmin } from "@/features/auth/utils/is-admin";
import { isSuperAdmin } from "@/features/auth/utils/is-super-admin";
import { getOperatingDayFromDate } from "@/lib/operating-days";
import { prisma } from "@/lib/prisma";
import {
  buildLocalDateTime,
  parseLocalDateKey,
  timeStringToMinutes,
} from "@/lib/time";
import { adminAppointmentsPath } from "@/paths";

export type AppointmentInput = {
  clientId: string;
  clinicId: string;
  doctorId?: string | null;
  setDay: string;
  setTime: string;
  status: string;
};

const appointmentSchema = z.object({
  clientId: z.string().min(1, "Client is required"),
  clinicId: z.string().min(1, "Clinic is required"),
  doctorId: z.string().optional().nullable(),
  setDay: z.string().min(1, "Appointment date is required"),
  setTime: z.string().min(1, "Appointment time is required"),
  status: z.enum([
    "BOOKED",
    "CONFIRMED",
    "ARRIVED",
    "InPROGRESS",
    "FULFILLED",
    "CANCELLED",
    "MISSED",
  ]),
});

const ensureAdminAccess = (user: Awaited<ReturnType<typeof getAuthOrRedirect>>["user"]) => {
  if (!isAdmin(user) && !isSuperAdmin(user)) {
    return toActionState("ERROR", "Not authorized");
  }
  return null;
};

export async function createAppointment(
  input: AppointmentInput
): Promise<ActionState> {
  try {
    const { user } = await getAuthOrRedirect();
    const denied = ensureAdminAccess(user);
    if (denied) return denied;

    const data = appointmentSchema.parse(input);
    const appointmentDay = parseLocalDateKey(data.setDay);
    if (Number.isNaN(appointmentDay.getTime())) {
      return toActionState("ERROR", "Appointment date is invalid");
    }

    const operatingTimes = await prisma.operatingTime.findMany({
      where: { clinicId: data.clinicId },
    });
    if (!operatingTimes.length) {
      return toActionState(
        "ERROR",
        "Clinic does not have operating times configured"
      );
    }

    const openDay = getOperatingDayFromDate(appointmentDay);
    const dayTimes = operatingTimes.filter((time) => time.openDay === openDay);
    if (!dayTimes.length) {
      return toActionState(
        "ERROR",
        "Clinic is not open on the selected date"
      );
    }

    const appointmentMinutes = timeStringToMinutes(data.setTime);
    if (appointmentMinutes === null) {
      return toActionState("ERROR", "Appointment time is invalid");
    }

    const appointmentDateTime = buildLocalDateTime(
      appointmentDay,
      data.setTime
    );
    if (!appointmentDateTime) {
      return toActionState("ERROR", "Appointment time is invalid");
    }

    const minDateTime = addHours(new Date(), 24);
    if (appointmentDateTime < minDateTime) {
      return toActionState(
        "ERROR",
        "Appointments must be scheduled at least 24 hours in advance"
      );
    }

    const withinOperatingTime = dayTimes.some((time) => {
      const start = timeStringToMinutes(time.startTime);
      const end = timeStringToMinutes(time.endTime);
      if (start === null || end === null) return false;
      return appointmentMinutes >= start && appointmentMinutes <= end;
    });

    if (!withinOperatingTime) {
      return toActionState(
        "ERROR",
        "Appointment time is outside clinic operating hours"
      );
    }

    const appointment = await prisma.appointment.create({
      data: {
        setDay: appointmentDay,
        setTime: data.setTime,
        status: data.status,
        client: { connect: { id: data.clientId } },
        clinic: { connect: { id: data.clinicId } },
        ...(data.doctorId ? { doctor: { connect: { id: data.doctorId } } } : {}),
      },
      include: {
        client: { select: { firstName: true, lastName: true } },
        clinic: { select: { name: true } },
        doctor: { select: { firstName: true, lastName: true } },
      },
    });
    revalidatePath(adminAppointmentsPath());
    return toActionState("SUCCESS", "Appointment added", undefined, appointment);
  } catch (error) {
    return fromErrorToActionState(error);
  }
}

export async function updateAppointment(
  id: string,
  input: AppointmentInput
): Promise<ActionState> {
  try {
    const { user } = await getAuthOrRedirect();
    const denied = ensureAdminAccess(user);
    if (denied) return denied;

    const data = appointmentSchema.parse(input);
    const appointmentDay = parseLocalDateKey(data.setDay);
    if (Number.isNaN(appointmentDay.getTime())) {
      return toActionState("ERROR", "Appointment date is invalid");
    }

    const operatingTimes = await prisma.operatingTime.findMany({
      where: { clinicId: data.clinicId },
    });
    if (!operatingTimes.length) {
      return toActionState(
        "ERROR",
        "Clinic does not have operating times configured"
      );
    }

    const openDay = getOperatingDayFromDate(appointmentDay);
    const dayTimes = operatingTimes.filter((time) => time.openDay === openDay);
    if (!dayTimes.length) {
      return toActionState(
        "ERROR",
        "Clinic is not open on the selected date"
      );
    }

    const appointmentMinutes = timeStringToMinutes(data.setTime);
    if (appointmentMinutes === null) {
      return toActionState("ERROR", "Appointment time is invalid");
    }

    const appointmentDateTime = buildLocalDateTime(
      appointmentDay,
      data.setTime
    );
    if (!appointmentDateTime) {
      return toActionState("ERROR", "Appointment time is invalid");
    }

    const minDateTime = addHours(new Date(), 24);
    if (appointmentDateTime < minDateTime) {
      return toActionState(
        "ERROR",
        "Appointments must be scheduled at least 24 hours in advance"
      );
    }

    const withinOperatingTime = dayTimes.some((time) => {
      const start = timeStringToMinutes(time.startTime);
      const end = timeStringToMinutes(time.endTime);
      if (start === null || end === null) return false;
      return appointmentMinutes >= start && appointmentMinutes <= end;
    });

    if (!withinOperatingTime) {
      return toActionState(
        "ERROR",
        "Appointment time is outside clinic operating hours"
      );
    }

    const appointment = await prisma.appointment.update({
      where: { id },
      data: {
        setDay: appointmentDay,
        setTime: data.setTime,
        status: data.status,
        client: { connect: { id: data.clientId } },
        clinic: { connect: { id: data.clinicId } },
        ...(data.doctorId
          ? { doctor: { connect: { id: data.doctorId } } }
          : { doctor: { disconnect: true } }),
      },
      include: {
        client: { select: { firstName: true, lastName: true } },
        clinic: { select: { name: true } },
        doctor: { select: { firstName: true, lastName: true } },
      },
    });
    revalidatePath(adminAppointmentsPath());
    return toActionState("SUCCESS", "Appointment updated", undefined, appointment);
  } catch (error) {
    return fromErrorToActionState(error);
  }
}

export async function deleteAppointment(id: string): Promise<ActionState> {
  try {
    const { user } = await getAuthOrRedirect();
    if (!isSuperAdmin(user)) {
      return toActionState("ERROR", "Not authorized");
    }

    await prisma.appointment.delete({ where: { id } });
    revalidatePath(adminAppointmentsPath());
    return toActionState("SUCCESS", "Appointment deleted");
  } catch (error) {
    return fromErrorToActionState(error);
  }
}
