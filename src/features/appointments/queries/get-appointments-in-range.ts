"use server";

import { getAuthOrRedirect } from "@/features/auth/queries/get-auth-or-redirect";
import { isAdmin } from "@/features/auth/utils/is-admin";
import { isSuperAdmin } from "@/features/auth/utils/is-super-admin";
import { prisma } from "@/lib/prisma";

export async function getAppointmentsInRange(start: string, end: string) {
  const { user } = await getAuthOrRedirect();
  if (!isAdmin(user) && !isSuperAdmin(user)) {
    return [];
  }

  const rangeStart = new Date(start);
  const rangeEnd = new Date(end);
  return prisma.appointment.findMany({
    where: {
      setDay: {
        gte: rangeStart,
        lte: rangeEnd,
      },
    },
    orderBy: [{ setDay: "asc" }, { setTime: "asc" }],
    include: {
      client: { select: { firstName: true, lastName: true } },
      clinic: { select: { name: true } },
      doctor: { select: { firstName: true, lastName: true } },
    },
  });
}
