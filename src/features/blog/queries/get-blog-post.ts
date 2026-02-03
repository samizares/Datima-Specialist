"use server";

import { getAuthOrRedirect } from "@/features/auth/queries/get-auth-or-redirect";
import { isAdmin } from "@/features/auth/utils/is-admin";
import { isSuperAdmin } from "@/features/auth/utils/is-super-admin";
import { prisma } from "@/lib/prisma";

export type BlogPostDetail = {
  id: string;
  title: string;
  tags: string;
  content: string;
  attachmentId: string;
  status: "PUBLISHED" | "SCHEDULED";
  scheduledFor?: Date | null;
};

export async function getBlogPostById(id: string): Promise<BlogPostDetail | null> {
  const { user } = await getAuthOrRedirect();
  if (!isAdmin(user) && !isSuperAdmin(user)) {
    return null;
  }

  const published = await prisma.blog.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      tags: true,
      content: true,
      attachmentId: true,
    },
  });

  if (published) {
    return {
      ...published,
      status: "PUBLISHED",
      scheduledFor: null,
    };
  }

  const scheduled = await prisma.schedulePost.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      tags: true,
      content: true,
      attachmentId: true,
      scheduledFor: true,
    },
  });

  if (!scheduled) return null;

  return {
    ...scheduled,
    status: "SCHEDULED",
  };
}
