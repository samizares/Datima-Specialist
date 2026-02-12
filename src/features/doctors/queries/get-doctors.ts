"use server";

import { getAuthOrRedirect } from "@/features/auth/queries/get-auth-or-redirect";
import { isAdmin } from "@/features/auth/utils/is-admin";
import { isSuperAdmin } from "@/features/auth/utils/is-super-admin";
import { prisma } from "@/lib/prisma";

export async function getDoctors() {
  const { user } = await getAuthOrRedirect();
  if (!isAdmin(user) && !isSuperAdmin(user)) {
    return [];
  }

  return prisma.doctor.findMany({
    take: 6,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      attachmentId: true,
      clinics: {
        select: {
          clinicId: true,
          date: true,
          startShift: true,
          endShift: true,
          clinic: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
  });
}
