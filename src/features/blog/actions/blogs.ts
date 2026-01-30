"use server";

import { revalidatePath } from "next/cache";
import { AttachmentType } from "@prisma/client";
import { z } from "zod";

import {
  ActionState,
  fromErrorToActionState,
  toActionState,
} from "@/components/form/utils/to-action-state";
import { getAuthOrRedirect } from "@/features/auth/queries/get-auth-or-redirect";
import { isAdmin } from "@/features/auth/utils/is-admin";
import { isSuperAdmin } from "@/features/auth/utils/is-super-admin";
import { prisma } from "@/lib/prisma";
import { adminBlogAllPath, adminBlogCreatePath } from "@/paths";
import { MAX_SIZE } from "@/features/attachment/constants";
import { sizeInMB } from "@/features/attachment/utils/size";
import * as attachmentService from "@/features/attachment/service";

const blogImageSchema = z
  .custom<File>((file) => file instanceof File, "Image is required")
  .refine((file) => file.size > 0, "Image is required")
  .refine((file) => sizeInMB(file.size) <= MAX_SIZE, `Maximum size is ${MAX_SIZE}MB`)
  .refine(
    (file) => ["image/png", "image/jpeg", "image/jpg"].includes(file.type),
    "Image type is not supported"
  );

const createBlogSchema = z.object({
  title: z.string().min(1, "Title is required"),
  tags: z.string().min(1, "Tags are required"),
  content: z.string().min(1, "Content is required"),
  attachmentId: z.string().min(1, "Cover image is required"),
  publishMode: z.enum(["now", "schedule"]),
  scheduledFor: z.string().optional(),
});

const updateBlogSchema = z.object({
  title: z.string().min(1, "Title is required"),
  tags: z.string().min(1, "Tags are required"),
  content: z.string().min(1, "Content is required"),
});

const updateScheduledSchema = updateBlogSchema.extend({
  scheduledFor: z.string().min(1, "Schedule time is required"),
});

const ensureAdminAccess = (
  user: Awaited<ReturnType<typeof getAuthOrRedirect>>["user"]
) => {
  if (!isAdmin(user) && !isSuperAdmin(user)) {
    return toActionState("ERROR", "Not authorized");
  }
  return null;
};

const parseSchedule = (value?: string | null) => {
  if (!value) return null;
  const scheduled = new Date(value);
  if (Number.isNaN(scheduled.getTime())) return null;
  return scheduled;
};

export async function uploadBlogImage(
  file: File
): Promise<ActionState<{ attachmentId: string }>> {
  try {
    const { user } = await getAuthOrRedirect();
    const denied = ensureAdminAccess(user);
    if (denied) return denied;

    const image = blogImageSchema.parse(file);
    const attachments = await attachmentService.createAttachments({
      attachmentType: AttachmentType.BLOG,
      files: [image],
    });

    const attachment = attachments[0];
    if (!attachment) {
      return toActionState("ERROR", "Image upload failed");
    }

    return toActionState("SUCCESS", "Image uploaded", undefined, {
      attachmentId: attachment.id,
    });
  } catch (error) {
    return fromErrorToActionState(error);
  }
}

export async function createBlog(input: {
  title: string;
  tags: string;
  content: string;
  attachmentId: string;
  publishMode: "now" | "schedule";
  scheduledFor?: string | null;
}): Promise<ActionState> {
  try {
    const { user } = await getAuthOrRedirect();
    const denied = ensureAdminAccess(user);
    if (denied) return denied;

    const data = createBlogSchema.parse(input);
    const scheduled = parseSchedule(data.scheduledFor ?? undefined);

    if (data.publishMode === "schedule") {
      if (!scheduled) {
        return toActionState("ERROR", "Schedule date and time are required");
      }

      const scheduledPost = await prisma.schedulePost.create({
        data: {
          title: data.title,
          tags: data.tags,
          content: data.content,
          scheduledFor: scheduled,
          authorId: user.id,
          attachmentId: data.attachmentId,
        },
      });
      revalidatePath(adminBlogAllPath());
      return toActionState("SUCCESS", "Post scheduled", undefined, scheduledPost);
    }

    const blog = await prisma.blog.create({
      data: {
        title: data.title,
        tags: data.tags,
        content: data.content,
        authorId: user.id,
        attachmentId: data.attachmentId,
      },
    });
    revalidatePath(adminBlogAllPath());
    revalidatePath(adminBlogCreatePath());
    return toActionState("SUCCESS", "Post published", undefined, blog);
  } catch (error) {
    return fromErrorToActionState(error);
  }
}

export async function updateBlog(
  id: string,
  input: { title: string; tags: string; content: string }
): Promise<ActionState> {
  try {
    const { user } = await getAuthOrRedirect();
    const denied = ensureAdminAccess(user);
    if (denied) return denied;

    const data = updateBlogSchema.parse(input);
    const blog = await prisma.blog.update({
      where: { id },
      data,
    });
    revalidatePath(adminBlogAllPath());
    return toActionState("SUCCESS", "Post updated", undefined, blog);
  } catch (error) {
    return fromErrorToActionState(error);
  }
}

export async function updateScheduledPost(
  id: string,
  input: { title: string; tags: string; content: string; scheduledFor: string }
): Promise<ActionState> {
  try {
    const { user } = await getAuthOrRedirect();
    const denied = ensureAdminAccess(user);
    if (denied) return denied;

    const data = updateScheduledSchema.parse(input);
    const scheduled = parseSchedule(data.scheduledFor);
    if (!scheduled) {
      return toActionState("ERROR", "Schedule date and time are required");
    }

    const scheduledPost = await prisma.schedulePost.update({
      where: { id },
      data: {
        title: data.title,
        tags: data.tags,
        content: data.content,
        scheduledFor: scheduled,
      },
    });
    revalidatePath(adminBlogAllPath());
    return toActionState("SUCCESS", "Post updated", undefined, scheduledPost);
  } catch (error) {
    return fromErrorToActionState(error);
  }
}

export async function deleteBlog(
  id: string,
  kind: "PUBLISHED" | "SCHEDULED"
): Promise<ActionState> {
  try {
    const { user } = await getAuthOrRedirect();
    if (!isSuperAdmin(user)) {
      return toActionState("ERROR", "Not authorized");
    }

    if (kind === "SCHEDULED") {
      const scheduledPost = await prisma.schedulePost.delete({ where: { id } });
      revalidatePath(adminBlogAllPath());
      return toActionState("SUCCESS", "Scheduled post deleted", undefined, scheduledPost);
    }

    const blog = await prisma.blog.delete({ where: { id } });
    revalidatePath(adminBlogAllPath());
    return toActionState("SUCCESS", "Post deleted", undefined, blog);
  } catch (error) {
    return fromErrorToActionState(error);
  }
}
