"use server";

import { getAuthOrRedirect } from "@/features/auth/queries/get-auth-or-redirect";
import { isAdmin } from "@/features/auth/utils/is-admin";
import { isSuperAdmin } from "@/features/auth/utils/is-super-admin";
import { prisma } from "@/lib/prisma";

export async function getDoctorSchedules() {
  const { user } = await getAuthOrRedirect();
  if (!isAdmin(user) && !isSuperAdmin(user)) {
    return [];
  }

  return prisma.doctorSchedule.findMany({
    take: 6,
    orderBy: { day: "asc" },
    include: {
      doctor: { select: { firstName: true, lastName: true } },
      clinic: { select: { name: true } },
    },
  });
}
