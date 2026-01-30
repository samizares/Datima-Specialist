"use server";

import { prisma } from "@/lib/prisma";

export async function searchClients(query: string) {
  const trimmed = query.trim();
  if (!trimmed) {
    return [];
  }

  return prisma.client.findMany({
    where: {
      OR: [
        { firstName: { contains: trimmed, mode: "insensitive" } },
        { lastName: { contains: trimmed, mode: "insensitive" } },
        { email: { contains: trimmed, mode: "insensitive" } },
        { telephone: { contains: trimmed, mode: "insensitive" } },
      ],
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      telephone: true,
    },
    take: 6,
  });
}
