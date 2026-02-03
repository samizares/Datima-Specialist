"use server";

import { getAuthOrRedirect } from "@/features/auth/queries/get-auth-or-redirect";
import { isAdmin } from "@/features/auth/utils/is-admin";
import { isSuperAdmin } from "@/features/auth/utils/is-super-admin";
import { prisma } from "@/lib/prisma";

export async function getUsers() {
  const { user } = await getAuthOrRedirect();
  if (!isAdmin(user) && !isSuperAdmin(user)) {
    return [];
  }

  return prisma.user.findMany({
    take: 6,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      username: true,
      email: true,
      emailVerified: true,
      isAdmin: true,
      isSuperAdmin: true,
      createdAt: true,
      attachmentId: true,
    },
  });
}
