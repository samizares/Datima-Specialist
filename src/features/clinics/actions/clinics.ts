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
import { adminClinicsPath } from "@/paths";

export type ClinicInput = {
  name: string;
  desc: string;
  attachmentId: string;
};

const clinicSchema = z.object({
  name: z.string().min(1, "Clinic name is required"),
  desc: z.string().min(1, "Description is required"),
  attachmentId: z.string().min(1, "Attachment ID is required"),
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
    const clinic = await prisma.clinic.create({ data });
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
    const clinic = await prisma.clinic.update({ where: { id }, data });
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
