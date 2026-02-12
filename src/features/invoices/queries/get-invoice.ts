"use server";

import { getAuthOrRedirect } from "@/features/auth/queries/get-auth-or-redirect";
import { isAdmin } from "@/features/auth/utils/is-admin";
import { isSuperAdmin } from "@/features/auth/utils/is-super-admin";
import { prisma } from "@/lib/prisma";

export const getInvoiceById = async (invoiceId: string) => {
  const { user } = await getAuthOrRedirect();
  if (!isAdmin(user) && !isSuperAdmin(user)) {
    return null;
  }

  return prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: {
      client: true,
      items: true,
    },
  });
};
