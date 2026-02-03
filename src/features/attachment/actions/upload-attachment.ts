"use server";

import { AttachmentType } from "@prisma/client";
import { z } from "zod";

import {
  ActionState,
  fromErrorToActionState,
  toActionState,
} from "@/components/form/utils/to-action-state";
import { getAuthOrRedirect } from "@/features/auth/queries/get-auth-or-redirect";
import { MAX_SIZE } from "@/features/attachment/constants";
import { sizeInMB } from "@/features/attachment/utils/size";
import * as attachmentService from "@/features/attachment/service";

const imageSchema = z
  .custom<File>((file) => file instanceof File, "Image is required")
  .refine((file) => file.size > 0, "Image is required")
  .refine((file) => sizeInMB(file.size) <= MAX_SIZE, `Maximum size is ${MAX_SIZE}MB`)
  .refine(
    (file) => ["image/png", "image/jpeg", "image/jpg"].includes(file.type),
    "Image type is not supported"
  );

export async function uploadAttachment(
  attachmentType: AttachmentType,
  file: File
): Promise<ActionState<{ attachmentId: string }>> {
  try {
    await getAuthOrRedirect();

    const image = imageSchema.parse(file);
    const attachments = await attachmentService.createAttachments({
      attachmentType,
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
