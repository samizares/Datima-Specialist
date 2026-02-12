"use server";

import { getAuthOrRedirect } from "@/features/auth/queries/get-auth-or-redirect";
import { isAdmin } from "@/features/auth/utils/is-admin";
import { isSuperAdmin } from "@/features/auth/utils/is-super-admin";
import { prisma } from "@/lib/prisma";

export async function getClinicSchedules() {
  const { user } = await getAuthOrRedirect();
  if (!isAdmin(user) && !isSuperAdmin(user)) {
    return [];
  }

  return prisma.clinicSchedule.findMany({
    orderBy: { date: "desc" },
    include: {
      doctor: { select: { id: true, firstName: true, lastName: true } },
      clinic: { select: { id: true, name: true } },
    },
  });
}
