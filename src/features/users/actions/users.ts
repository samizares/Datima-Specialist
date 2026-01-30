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
import { hashPassword } from "@/features/password/utils/hash-and-verify";
import { prisma } from "@/lib/prisma";
import { adminUsersPath } from "@/paths";

export type UserInput = {
  username: string;
  email: string;
  password?: string;
  emailVerified: boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
};

const baseUserSchema = z.object({
  username: z.string().min(2, "Username is required"),
  email: z.string().email("Valid email is required"),
  emailVerified: z.boolean(),
  isAdmin: z.boolean(),
  isSuperAdmin: z.boolean(),
});

const createUserSchema = baseUserSchema.extend({
  password: z.string().min(6, "Password is required"),
});

const updateUserSchema = baseUserSchema.extend({
  password: z.string().optional(),
});

const ensureAdminAccess = (
  user: Awaited<ReturnType<typeof getAuthOrRedirect>>["user"]
) => {
  if (!isAdmin(user) && !isSuperAdmin(user)) {
    return toActionState("ERROR", "Not authorized");
  }
  return null;
};

export async function createUser(input: UserInput): Promise<ActionState> {
  try {
    const { user } = await getAuthOrRedirect();
    const denied = ensureAdminAccess(user);
    if (denied) return denied;

    const data = createUserSchema.parse(input);
    const passwordHash = await hashPassword(data.password);

    const payload = {
      username: data.username,
      email: data.email,
      emailVerified: data.emailVerified,
      ...(isSuperAdmin(user)
        ? { isAdmin: data.isAdmin, isSuperAdmin: data.isSuperAdmin }
        : {}),
      passwordHash,
    };

    const created = await prisma.user.create({ data: payload });
    revalidatePath(adminUsersPath());
    return toActionState("SUCCESS", "User added", undefined, created);
  } catch (error) {
    return fromErrorToActionState(error);
  }
}

export async function updateUser(
  id: string,
  input: UserInput
): Promise<ActionState> {
  try {
    const { user } = await getAuthOrRedirect();
    const denied = ensureAdminAccess(user);
    if (denied) return denied;

    const data = updateUserSchema.parse(input);
    const payload: {
      username: string;
      email: string;
      emailVerified: boolean;
      isAdmin?: boolean;
      isSuperAdmin?: boolean;
      passwordHash?: string;
    } = {
      username: data.username,
      email: data.email,
      emailVerified: data.emailVerified,
    };

    if (isSuperAdmin(user)) {
      payload.isAdmin = data.isAdmin;
      payload.isSuperAdmin = data.isSuperAdmin;
    }

    if (data.password) {
      payload.passwordHash = await hashPassword(data.password);
    }

    const updated = await prisma.user.update({ where: { id }, data: payload });
    revalidatePath(adminUsersPath());
    return toActionState("SUCCESS", "User updated", undefined, updated);
  } catch (error) {
    return fromErrorToActionState(error);
  }
}

export async function deleteUser(id: string): Promise<ActionState> {
  try {
    const { user } = await getAuthOrRedirect();
    if (!isSuperAdmin(user)) {
      return toActionState("ERROR", "Not authorized");
    }

    const deleted = await prisma.user.delete({ where: { id } });
    revalidatePath(adminUsersPath());
    return toActionState("SUCCESS", "User deleted", undefined, deleted);
  } catch (error) {
    return fromErrorToActionState(error);
  }
}
