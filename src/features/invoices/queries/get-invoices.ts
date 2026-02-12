"use server";

import { getAuthOrRedirect } from "@/features/auth/queries/get-auth-or-redirect";
import { isAdmin } from "@/features/auth/utils/is-admin";
import { isSuperAdmin } from "@/features/auth/utils/is-super-admin";
import { prisma } from "@/lib/prisma";

export const getInvoices = async () => {
  const { user } = await getAuthOrRedirect();
  if (!isAdmin(user) && !isSuperAdmin(user)) {
    return [];
  }

  return prisma.invoice.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      client: true,
      items: true,
      attachment: true,
    },
  });
};
