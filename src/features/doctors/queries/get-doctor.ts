"use server";

import { getAuthOrRedirect } from "@/features/auth/queries/get-auth-or-redirect";
import { isAdmin } from "@/features/auth/utils/is-admin";
import { isSuperAdmin } from "@/features/auth/utils/is-super-admin";
import { prisma } from "@/lib/prisma";

export async function getDoctor(doctorId: string) {
  const { user } = await getAuthOrRedirect();
  if (!isAdmin(user) && !isSuperAdmin(user)) {
    return null;
  }

  return prisma.doctor.findUnique({
    where: { id: doctorId },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      clinicId: true,
      attachmentId: true,
      createdAt: true,
      clinic: {
        select: { name: true },
      },
    },
  });
}
