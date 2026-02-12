"use server";

import { getAuthOrRedirect } from "@/features/auth/queries/get-auth-or-redirect";
import { isAdmin } from "@/features/auth/utils/is-admin";
import { isSuperAdmin } from "@/features/auth/utils/is-super-admin";
import { prisma } from "@/lib/prisma";

export async function getClinics() {
  const { user } = await getAuthOrRedirect();
  if (!isAdmin(user) && !isSuperAdmin(user)) {
    return [];
  }

  return prisma.clinic.findMany({
    take: 6,
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      desc: true,
      attachmentId: true,
      doctors: {
        select: {
          clinicId: true,
          doctorId: true,
          date: true,
          startShift: true,
          endShift: true,
          doctor: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      },
      operatingTimes: {
        select: {
          id: true,
          openDay: true,
          startTime: true,
          endTime: true,
        },
      },
    },
  });
}
