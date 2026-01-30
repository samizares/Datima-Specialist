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
import { adminDoctorSchedulesPath } from "@/paths";

export type DoctorScheduleInput = {
  doctorId: string;
  clinicId: string;
  day: string;
  startTime: string;
  endTime: string;
};

const scheduleSchema = z.object({
  doctorId: z.string().min(1, "Doctor is required"),
  clinicId: z.string().min(1, "Clinic is required"),
  day: z.string().min(1, "Day is required"),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
});

const ensureAdminAccess = (
  user: Awaited<ReturnType<typeof getAuthOrRedirect>>["user"]
) => {
  if (!isAdmin(user) && !isSuperAdmin(user)) {
    return toActionState("ERROR", "Not authorized");
  }
  return null;
};

export async function createDoctorSchedule(
  input: DoctorScheduleInput
): Promise<ActionState> {
  try {
    const { user } = await getAuthOrRedirect();
    const denied = ensureAdminAccess(user);
    if (denied) return denied;

    const data = scheduleSchema.parse(input);
    const created = await prisma.doctorSchedule.create({
      data: {
        day: data.day,
        startTime: data.startTime,
        endTime: data.endTime,
        doctor: { connect: { id: data.doctorId } },
        clinic: { connect: { id: data.clinicId } },
      },
    });
    revalidatePath(adminDoctorSchedulesPath());
    return toActionState("SUCCESS", "Schedule added", undefined, created);
  } catch (error) {
    return fromErrorToActionState(error);
  }
}

export async function updateDoctorSchedule(
  id: string,
  input: DoctorScheduleInput
): Promise<ActionState> {
  try {
    const { user } = await getAuthOrRedirect();
    const denied = ensureAdminAccess(user);
    if (denied) return denied;

    const data = scheduleSchema.parse(input);
    const updated = await prisma.doctorSchedule.update({
      where: { id },
      data: {
        day: data.day,
        startTime: data.startTime,
        endTime: data.endTime,
        doctor: { connect: { id: data.doctorId } },
        clinic: { connect: { id: data.clinicId } },
      },
    });
    revalidatePath(adminDoctorSchedulesPath());
    return toActionState("SUCCESS", "Schedule updated", undefined, updated);
  } catch (error) {
    return fromErrorToActionState(error);
  }
}

export async function deleteDoctorSchedule(id: string): Promise<ActionState> {
  try {
    const { user } = await getAuthOrRedirect();
    if (!isSuperAdmin(user)) {
      return toActionState("ERROR", "Not authorized");
    }

    const deleted = await prisma.doctorSchedule.delete({ where: { id } });
    revalidatePath(adminDoctorSchedulesPath());
    return toActionState("SUCCESS", "Schedule deleted", undefined, deleted);
  } catch (error) {
    return fromErrorToActionState(error);
  }
}
