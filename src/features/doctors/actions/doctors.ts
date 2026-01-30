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
import { adminDoctorsPath } from "@/paths";

export type DoctorInput = {
  firstName: string;
  lastName: string;
  email: string;
  clinicId?: string | null;
  attachmentId?: string | null;
};

const doctorSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Valid email is required"),
  clinicId: z.string().optional().nullable(),
  attachmentId: z.string().optional().nullable(),
});

const ensureAdminAccess = (user: Awaited<ReturnType<typeof getAuthOrRedirect>>["user"]) => {
  if (!isAdmin(user) && !isSuperAdmin(user)) {
    return toActionState("ERROR", "Not authorized");
  }
  return null;
};

export async function createDoctor(input: DoctorInput): Promise<ActionState> {
  try {
    const { user } = await getAuthOrRedirect();
    const denied = ensureAdminAccess(user);
    if (denied) return denied;

    const data = doctorSchema.parse(input);
    const doctor = await prisma.doctor.create({ data });
    revalidatePath(adminDoctorsPath());
    return toActionState("SUCCESS", "Doctor added", undefined, doctor);
  } catch (error) {
    return fromErrorToActionState(error);
  }
}

export async function updateDoctor(
  id: string,
  input: DoctorInput
): Promise<ActionState> {
  try {
    const { user } = await getAuthOrRedirect();
    const denied = ensureAdminAccess(user);
    if (denied) return denied;

    const data = doctorSchema.parse(input);
    const doctor = await prisma.doctor.update({ where: { id }, data });
    revalidatePath(adminDoctorsPath());
    return toActionState("SUCCESS", "Doctor updated", undefined, doctor);
  } catch (error) {
    return fromErrorToActionState(error);
  }
}

export async function deleteDoctor(id: string): Promise<ActionState> {
  try {
    const { user } = await getAuthOrRedirect();
    if (!isSuperAdmin(user)) {
      return toActionState("ERROR", "Not authorized");
    }

    const doctor = await prisma.doctor.delete({ where: { id } });
    revalidatePath(adminDoctorsPath());
    return toActionState("SUCCESS", "Doctor deleted", undefined, doctor);
  } catch (error) {
    return fromErrorToActionState(error);
  }
}
