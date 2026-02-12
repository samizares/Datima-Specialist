"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { OperatingDay } from "@prisma/client";

import {
  ActionState,
  fromErrorToActionState,
  toActionState,
} from "@/components/form/utils/to-action-state";
import { getAuthOrRedirect } from "@/features/auth/queries/get-auth-or-redirect";
import { isAdmin } from "@/features/auth/utils/is-admin";
import { isSuperAdmin } from "@/features/auth/utils/is-super-admin";
import { prisma } from "@/lib/prisma";
import { adminClinicSchedulesPath } from "@/paths";
import { getOperatingDayFromDate } from "@/lib/operating-days";
import { doRangesOverlap, parseLocalDateKey, timeStringToMinutes } from "@/lib/time";
import { sendDoctorShiftScheduled } from "../emails/send-doctor-shift-scheduled";

export type ClinicScheduleInput = {
  clinicId: string;
  doctorId: string;
  openDay: OperatingDay;
  date: string;
  startShift: string;
  endShift: string;
};

const scheduleSchema = z
  .object({
    clinicId: z.string().min(1, "Clinic is required"),
    doctorId: z.string().min(1, "Doctor is required"),
    openDay: z.nativeEnum(OperatingDay),
    date: z.string().min(1, "Date is required"),
    startShift: z.string().min(1, "Start shift is required"),
    endShift: z.string().min(1, "End shift is required"),
  })
  .superRefine((value, ctx) => {
    const start = timeStringToMinutes(value.startShift);
    const end = timeStringToMinutes(value.endShift);
    if (start === null || end === null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Shift time is invalid",
      });
      return;
    }
    if (start >= end) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "End shift must be after start shift",
        path: ["endShift"],
      });
    }
  });

const ensureAdminAccess = (
  user: Awaited<ReturnType<typeof getAuthOrRedirect>>["user"]
) => {
  if (!isAdmin(user) && !isSuperAdmin(user)) {
    return toActionState("ERROR", "Not authorized");
  }
  return null;
};

export async function createClinicSchedule(
  input: ClinicScheduleInput
): Promise<
  ActionState<{
    schedule: {
      id: string;
      date: Date;
      startShift: string;
      endShift: string;
      clinicId: string;
      doctorId: string;
      clinic: { id: string; name: string };
      doctor: { id: string; firstName: string; lastName: string };
    };
  }>
> {
  try {
    const { user } = await getAuthOrRedirect();
    const denied = ensureAdminAccess(user);
    if (denied) return denied;

    const data = scheduleSchema.parse(input);
    const scheduleDate = parseLocalDateKey(data.date);
    if (Number.isNaN(scheduleDate.getTime())) {
      return toActionState("ERROR", "Schedule date is invalid");
    }

    const dayFromDate = getOperatingDayFromDate(scheduleDate);
    if (dayFromDate !== data.openDay) {
      return toActionState("ERROR", "Selected date does not match the open day");
    }

    const operatingTimes = await prisma.operatingTime.findMany({
      where: {
        clinicId: data.clinicId,
        openDay: data.openDay,
      },
    });

    if (!operatingTimes.length) {
      return toActionState(
        "ERROR",
        "Clinic has no operating time for the selected day"
      );
    }

    const startMinutes = timeStringToMinutes(data.startShift);
    const endMinutes = timeStringToMinutes(data.endShift);
    if (startMinutes === null || endMinutes === null) {
      return toActionState("ERROR", "Shift time is invalid");
    }

    const withinOperatingTime = operatingTimes.some((time) => {
      const start = timeStringToMinutes(time.startTime);
      const end = timeStringToMinutes(time.endTime);
      if (start === null || end === null) return false;
      return startMinutes >= start && endMinutes <= end;
    });

    if (!withinOperatingTime) {
      return toActionState(
        "ERROR",
        "Shift must be within the clinic operating time"
      );
    }

    const existing = await prisma.clinicSchedule.findMany({
      where: {
        clinicId: data.clinicId,
        date: scheduleDate,
      },
      select: {
        startShift: true,
        endShift: true,
      },
    });

    const hasOverlap = existing.some((schedule) => {
      const existingStart = timeStringToMinutes(schedule.startShift);
      const existingEnd = timeStringToMinutes(schedule.endShift);
      if (existingStart === null || existingEnd === null) return false;
      return doRangesOverlap(startMinutes, endMinutes, existingStart, existingEnd);
    });

    if (hasOverlap) {
      return toActionState(
        "ERROR",
        "This shift overlaps with another scheduled doctor"
      );
    }

    const created = await prisma.clinicSchedule.create({
      data: {
        clinicId: data.clinicId,
        doctorId: data.doctorId,
        date: scheduleDate,
        startShift: data.startShift,
        endShift: data.endShift,
      },
      include: {
        clinic: { select: { id: true, name: true } },
        doctor: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
    });

    if (created.doctor.email) {
      try {
        await sendDoctorShiftScheduled({
          doctorName: `${created.doctor.firstName} ${created.doctor.lastName}`,
          email: created.doctor.email,
          clinic: created.clinic.name,
          date: created.date.toDateString(),
          startShift: created.startShift,
          endShift: created.endShift,
        });
      } catch {
        // Email failures should not block schedule creation.
      }
    }

    revalidatePath(adminClinicSchedulesPath());
    return toActionState("SUCCESS", "Schedule created", undefined, {
      schedule: {
        id: created.id,
        date: created.date,
        startShift: created.startShift,
        endShift: created.endShift,
        clinicId: created.clinicId,
        doctorId: created.doctorId,
        clinic: created.clinic,
        doctor: {
          id: created.doctor.id,
          firstName: created.doctor.firstName,
          lastName: created.doctor.lastName,
        },
      },
    });
  } catch (error) {
    return fromErrorToActionState(error);
  }
}

export async function deleteClinicSchedule(id: string): Promise<ActionState> {
  try {
    const { user } = await getAuthOrRedirect();
    if (!isSuperAdmin(user)) {
      return toActionState("ERROR", "Not authorized");
    }

    const deleted = await prisma.clinicSchedule.delete({ where: { id } });
    revalidatePath(adminClinicSchedulesPath());
    return toActionState("SUCCESS", "Schedule deleted", undefined, deleted);
  } catch (error) {
    return fromErrorToActionState(error);
  }
}
