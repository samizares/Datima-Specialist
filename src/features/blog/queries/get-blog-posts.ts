"use server";

import { getAuthOrRedirect } from "@/features/auth/queries/get-auth-or-redirect";
import { isAdmin } from "@/features/auth/utils/is-admin";
import { isSuperAdmin } from "@/features/auth/utils/is-super-admin";
import { prisma } from "@/lib/prisma";

const publishDueScheduledPosts = async () => {
  const now = new Date();
  const duePosts = await prisma.schedulePost.findMany({
    where: { scheduledFor: { lte: now } },
  });

  if (!duePosts.length) return;

  await prisma.$transaction(
    duePosts.flatMap((post) => [
      prisma.blog.create({
        data: {
          title: post.title,
          tags: post.tags,
          content: post.content,
          authorId: post.authorId,
          attachmentId: post.attachmentId,
        },
      }),
      prisma.schedulePost.delete({ where: { id: post.id } }),
    ])
  );
};

export async function getBlogPosts() {
  const { user } = await getAuthOrRedirect();
  if (!isAdmin(user) && !isSuperAdmin(user)) {
    return [];
  }

  await publishDueScheduledPosts();

  const [published, scheduled] = await Promise.all([
    prisma.blog.findMany({
      take: 20,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        tags: true,
        content: true,
        createdAt: true,
        attachmentId: true,
        author: { select: { username: true, fullName: true } },
      },
    }),
    prisma.schedulePost.findMany({
      take: 20,
      orderBy: { scheduledFor: "asc" },
      select: {
        id: true,
        title: true,
        tags: true,
        content: true,
        scheduledFor: true,
        attachmentId: true,
        author: { select: { username: true, fullName: true } },
      },
    }),
  ]);

  const publishedRows = published.map((post) => ({
    id: post.id,
    title: post.title,
    tags: post.tags,
    content: post.content,
    authorName: post.author.fullName ?? post.author.username,
    attachmentId: post.attachmentId,
    status: "PUBLISHED" as const,
    date: post.createdAt,
  }));

  const scheduledRows = scheduled.map((post) => ({
    id: post.id,
    title: post.title,
    tags: post.tags,
    content: post.content,
    authorName: post.author.fullName ?? post.author.username,
    attachmentId: post.attachmentId,
    status: "SCHEDULED" as const,
    date: post.scheduledFor,
  }));

  return [...scheduledRows, ...publishedRows].sort(
    (a, b) => b.date.getTime() - a.date.getTime()
  );
}
