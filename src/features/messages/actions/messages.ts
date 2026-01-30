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
import { adminMessagesPath } from "@/paths";

export type MessageInput = {
  content: string;
  clientId: string;
};

const messageSchema = z.object({
  content: z.string().min(1, "Message is required"),
  clientId: z.string().min(1, "Client is required"),
});

const ensureAdminAccess = (user: Awaited<ReturnType<typeof getAuthOrRedirect>>["user"]) => {
  if (!isAdmin(user) && !isSuperAdmin(user)) {
    return toActionState("ERROR", "Not authorized");
  }
  return null;
};

export async function createMessage(input: MessageInput): Promise<ActionState> {
  try {
    const { user } = await getAuthOrRedirect();
    const denied = ensureAdminAccess(user);
    if (denied) return denied;

    const data = messageSchema.parse(input);
    const message = await prisma.message.create({ data });
    revalidatePath(adminMessagesPath());
    return toActionState("SUCCESS", "Message added", undefined, message);
  } catch (error) {
    return fromErrorToActionState(error);
  }
}

export async function updateMessage(
  id: string,
  input: MessageInput
): Promise<ActionState> {
  try {
    const { user } = await getAuthOrRedirect();
    const denied = ensureAdminAccess(user);
    if (denied) return denied;

    const data = messageSchema.parse(input);
    const message = await prisma.message.update({ where: { id }, data });
    revalidatePath(adminMessagesPath());
    return toActionState("SUCCESS", "Message updated", undefined, message);
  } catch (error) {
    return fromErrorToActionState(error);
  }
}

export async function deleteMessage(id: string): Promise<ActionState> {
  try {
    const { user } = await getAuthOrRedirect();
    if (!isSuperAdmin(user)) {
      return toActionState("ERROR", "Not authorized");
    }

    const message = await prisma.message.delete({ where: { id } });
    revalidatePath(adminMessagesPath());
    return toActionState("SUCCESS", "Message deleted", undefined, message);
  } catch (error) {
    return fromErrorToActionState(error);
  }
}
