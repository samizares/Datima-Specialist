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
import { timeStringToMinutes } from "@/lib/time";
import { adminClinicsPath } from "@/paths";

export type ClinicInput = {
  name: string;
  desc: string;
  attachmentId?: string | null;
  operatingTimes?: {
    openDay: OperatingDay;
    startTime: string;
    endTime: string;
  }[];
};

const attachmentIdSchema = z
  .union([z.string().trim().min(1), z.literal(""), z.null(), z.undefined()])
  .transform((value) =>
    typeof value === "string" && value.length > 0 ? value : null
  );

const operatingTimeSchema = z
  .object({
    openDay: z.nativeEnum(OperatingDay),
    startTime: z.string().min(1, "Start time is required"),
    endTime: z.string().min(1, "End time is required"),
  })
  .superRefine((value, ctx) => {
    const start = timeStringToMinutes(value.startTime);
    const end = timeStringToMinutes(value.endTime);
    if (start === null || end === null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Time format is invalid",
      });
      return;
    }
    if (start >= end) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "End time must be after start time",
        path: ["endTime"],
      });
    }
  });

const operatingTimesSchema = z.array(operatingTimeSchema).optional().default([]);

const clinicSchema = z.object({
  name: z.string().min(1, "Clinic name is required"),
  desc: z.string().min(1, "Description is required"),
  attachmentId: attachmentIdSchema,
  operatingTimes: operatingTimesSchema,
});


const ensureAdminAccess = (user: Awaited<ReturnType<typeof getAuthOrRedirect>>["user"]) => {
  if (!isAdmin(user) && !isSuperAdmin(user)) {
    return toActionState("ERROR", "Not authorized");
  }
  return null;
};

export async function createClinic(input: ClinicInput): Promise<ActionState> {
  try {
    const { user } = await getAuthOrRedirect();
    const denied = ensureAdminAccess(user);
    if (denied) return denied;

    const data = clinicSchema.parse(input);
    const { operatingTimes, ...clinicData } = data;
    const clinic = await prisma.clinic.create({ data: clinicData });

    if (operatingTimes.length) {
      await prisma.operatingTime.createMany({
        data: operatingTimes.map((time) => ({
          clinicId: clinic.id,
          openDay: time.openDay,
          startTime: time.startTime,
          endTime: time.endTime,
        })),
      });
    }
    revalidatePath(adminClinicsPath());
    return toActionState("SUCCESS", "Clinic added", undefined, clinic);
  } catch (error) {
    return fromErrorToActionState(error);
  }
}

export async function updateClinic(
  id: string,
  input: ClinicInput
): Promise<ActionState> {
  try {
    const { user } = await getAuthOrRedirect();
    const denied = ensureAdminAccess(user);
    if (denied) return denied;

    const data = clinicSchema.parse(input);
    const { operatingTimes, ...clinicData } = data;
    const clinic = await prisma.clinic.update({
      where: { id },
      data: clinicData,
    });

    await prisma.operatingTime.deleteMany({ where: { clinicId: id } });
    if (operatingTimes.length) {
      await prisma.operatingTime.createMany({
        data: operatingTimes.map((time) => ({
          clinicId: id,
          openDay: time.openDay,
          startTime: time.startTime,
          endTime: time.endTime,
        })),
      });
    }
    revalidatePath(adminClinicsPath());
    return toActionState("SUCCESS", "Clinic updated", undefined, clinic);
  } catch (error) {
    return fromErrorToActionState(error);
  }
}

export async function deleteClinic(id: string): Promise<ActionState> {
  try {
    const { user } = await getAuthOrRedirect();
    if (!isSuperAdmin(user)) {
      return toActionState("ERROR", "Not authorized");
    }

    const clinic = await prisma.clinic.delete({ where: { id } });
    revalidatePath(adminClinicsPath());
    return toActionState("SUCCESS", "Clinic deleted", undefined, clinic);
  } catch (error) {
    return fromErrorToActionState(error);
  }
}
