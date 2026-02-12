"use server";

import { revalidatePath } from "next/cache";
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
import { adminTestimonialsPath } from "@/paths";

export type TestimonialInput = {
  clientId: string;
  content: string;
};

const testimonialSchema = z.object({
  clientId: z.string().min(1, "Client is required"),
  content: z
    .string()
    .min(1, "Testimonial is required")
    .max(300, "Testimonial must be 300 characters or less"),
});

const ensureAdminAccess = (
  user: Awaited<ReturnType<typeof getAuthOrRedirect>>["user"]
) => {
  if (!isAdmin(user) && !isSuperAdmin(user)) {
    return toActionState("ERROR", "Not authorized");
  }
  return null;
};

export async function createTestimonial(
  input: TestimonialInput
): Promise<ActionState> {
  try {
    const { user } = await getAuthOrRedirect();
    const denied = ensureAdminAccess(user);
    if (denied) return denied;

    const data = testimonialSchema.parse(input);
    const created = await prisma.testimonial.create({
      data: {
        content: data.content,
        client: { connect: { id: data.clientId } },
      },
    });
    revalidatePath(adminTestimonialsPath());
    return toActionState("SUCCESS", "Testimonial added", undefined, created);
  } catch (error) {
    return fromErrorToActionState(error);
  }
}

export async function updateTestimonial(
  id: string,
  input: TestimonialInput
): Promise<ActionState> {
  try {
    const { user } = await getAuthOrRedirect();
    const denied = ensureAdminAccess(user);
    if (denied) return denied;

    const data = testimonialSchema.parse(input);
    const updated = await prisma.testimonial.update({
      where: { id },
      data: {
        content: data.content,
        client: { connect: { id: data.clientId } },
      },
    });
    revalidatePath(adminTestimonialsPath());
    return toActionState("SUCCESS", "Testimonial updated", undefined, updated);
  } catch (error) {
    return fromErrorToActionState(error);
  }
}

export async function deleteTestimonial(id: string): Promise<ActionState> {
  try {
    const { user } = await getAuthOrRedirect();
    if (!isSuperAdmin(user)) {
      return toActionState("ERROR", "Not authorized");
    }

    const deleted = await prisma.testimonial.delete({ where: { id } });
    revalidatePath(adminTestimonialsPath());
    return toActionState("SUCCESS", "Testimonial deleted", undefined, deleted);
  } catch (error) {
    return fromErrorToActionState(error);
  }
}
