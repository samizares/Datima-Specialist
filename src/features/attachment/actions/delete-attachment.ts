"use server";

import {
  fromErrorToActionState,
  toActionState,
} from "@/components/form/utils/to-action-state";
import { getAuthOrRedirect } from "@/features/auth/queries/get-auth-or-redirect";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { s3 } from "@/lib/aws";
import { prisma } from "@/lib/prisma";
import * as attachmentData from "../data";
import { generateS3Key } from "../utils/generate-s3-key";

export const deleteAttachment = async (id: string) => {
  await getAuthOrRedirect();

  const attachment = await attachmentData.getAttachment(id);

  if (!attachment) {
    return toActionState("ERROR", "Attachment not found");
  }

  try {
    await prisma.attachment.delete({
      where: {
        id,
      },
    });

    await s3.send(
      new DeleteObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: generateS3Key({
        attachmentType: attachment.attachmentType,
          fileName: attachment.name,
          attachmentId: attachment.id,
        }),
      })
    );
  } catch (error) {
    return fromErrorToActionState(error);
  }

  return toActionState("SUCCESS", "Attachment deleted");
};
