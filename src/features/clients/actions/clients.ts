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
import { adminClientsPath } from "@/paths";

export type ClientInput = {
  firstName: string;
  lastName: string;
  email?: string | null;
  telephone: string;
  address: string;
  status: string;
  attachmentId?: string | null;
};

const attachmentIdSchema = z
  .union([z.string().trim().min(1), z.literal(""), z.null(), z.undefined()])
  .transform((value) =>
    typeof value === "string" && value.length > 0 ? value : null
  );

const clientSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email().optional().or(z.literal("")).transform((value) =>
    value ? value : null
  ),
  telephone: z.string().min(1, "Telephone is required"),
  address: z.string().min(1, "Address is required"),
  status: z.enum(["PROSPECT", "PATIENT"]),
  attachmentId: attachmentIdSchema,
});

const ensureAdminAccess = (user: Awaited<ReturnType<typeof getAuthOrRedirect>>["user"]) => {
  if (!isAdmin(user) && !isSuperAdmin(user)) {
    return toActionState("ERROR", "Not authorized");
  }
  return null;
};

export async function createClient(input: ClientInput): Promise<ActionState> {
  try {
    const { user } = await getAuthOrRedirect();
    const denied = ensureAdminAccess(user);
    if (denied) return denied;

    const data = clientSchema.parse(input);
    const client = await prisma.client.create({ data });
    revalidatePath(adminClientsPath());
    return toActionState("SUCCESS", "Client added", undefined, client);
  } catch (error) {
    return fromErrorToActionState(error);
  }
}

export async function updateClient(
  id: string,
  input: ClientInput
): Promise<ActionState> {
  try {
    const { user } = await getAuthOrRedirect();
    const denied = ensureAdminAccess(user);
    if (denied) return denied;

    const data = clientSchema.parse(input);
    const client = await prisma.client.update({ where: { id }, data });
    revalidatePath(adminClientsPath());
    return toActionState("SUCCESS", "Client updated", undefined, client);
  } catch (error) {
    return fromErrorToActionState(error);
  }
}

export async function deleteClient(id: string): Promise<ActionState> {
  try {
    const { user } = await getAuthOrRedirect();
    if (!isSuperAdmin(user)) {
      return toActionState("ERROR", "Not authorized");
    }

    const client = await prisma.client.delete({ where: { id } });
    revalidatePath(adminClientsPath());
    return toActionState("SUCCESS", "Client deleted", undefined, client);
  } catch (error) {
    return fromErrorToActionState(error);
  }
}
