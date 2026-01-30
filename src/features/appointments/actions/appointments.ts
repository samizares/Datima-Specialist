"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import {
  ActionState,
  fromErrorToActionState,
  toActionState,
} from "@/components/form/utils/to-action-state";
import { getAuthOrRedirect } from "@/features/auth/queries/get-auth-or-redirect";
import { isAdmin } from "@/features/auth/utils/is-admin";
import { isSuperAdmin } from "@/features/auth/utils/is-super-admin";
import { prisma } from "@/lib/prisma";
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
  setDay: z.coerce.date(),
  setTime: z.string().min(1, "Time is required"),
  status: z.enum(["UNFILL", "FILL", "DONE"]),
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
    const appointment = await prisma.appointment.create({
      data: {
        setDay: data.setDay,
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
    const appointment = await prisma.appointment.update({
      where: { id },
      data: {
        setDay: data.setDay,
        setTime: data.setTime,
        status: data.status,
        client: { connect: { id: data.clientId } },
        clinic: { connect: { id: data.clinicId } },
        doctorId: data.doctorId ?? null,
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
