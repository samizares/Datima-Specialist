"use server";

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

const orderSchema = z.array(z.string()).min(1);

export async function saveSidebarOrder(order: string[]): Promise<ActionState> {
  try {
    const { user } = await getAuthOrRedirect();
    if (!isAdmin(user) && !isSuperAdmin(user)) {
      return toActionState("ERROR", "Not authorized");
    }

    const data = orderSchema.parse(order);

    await prisma.user.update({
      where: { id: user.id },
      data: { sidebarOrder: JSON.stringify(data) },
    });

    return toActionState("SUCCESS", "Sidebar order saved");
  } catch (error) {
    return fromErrorToActionState(error);
  }
}
