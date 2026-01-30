"use server";

import { AttachmentType } from "@prisma/client";
import { z } from "zod";
import {
  ActionState,
  fromErrorToActionState,
  toActionState,
} from "@/components/form/utils/to-action-state";
import { getAuthOrRedirect } from "@/features/auth/queries/get-auth-or-redirect";
import { filesSchema } from "../schema/files";
import * as attachmentService from "../service";

const createAttachmentsSchema = z.object({
  files: filesSchema.refine((files) => files.length !== 0, "File is required"),
});

type CreateAttachmentsArgs = {
  attachmentType: AttachmentType;
};

export const createAttachments = async (
  { attachmentType }: CreateAttachmentsArgs,
  _actionState: ActionState,
  formData: FormData
) => {
  await getAuthOrRedirect();

  try {
    const { files } = createAttachmentsSchema.parse({
      files: formData.getAll("files"),
    });

    await attachmentService.createAttachments({
      attachmentType,
      files,
    });
  } catch (error) {
    return fromErrorToActionState(error);
  }

  return toActionState("SUCCESS", "Attachment(s) uploaded");
};
