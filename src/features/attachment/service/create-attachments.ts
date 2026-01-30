import { PutObjectCommand } from "@aws-sdk/client-s3";
import { AttachmentType } from "@prisma/client";
import { s3 } from "@/lib/aws";
import * as attachmentData from "../data";
import { generateS3Key } from "../utils/generate-s3-key";

type CreateAttachmentsArgs = {
  attachmentType: AttachmentType;
  files: File[];
};

export const createAttachments = async ({
  attachmentType,
  files,
}: CreateAttachmentsArgs) => {
  const attachments = [];

  try {
    for (const file of files) {
      const buffer = await Buffer.from(await file.arrayBuffer());

      const attachment = await attachmentData.createAttachment({
        name: file.name,
        attachmentType,
      });

      attachments.push(attachment);

      await s3.send(
        new PutObjectCommand({
          Bucket: process.env.AWS_BUCKET_NAME,
          Key: generateS3Key({
            attachmentType,
            fileName: file.name,
            attachmentId: attachment.id,
          }),
          Body: buffer,
          ContentType: file.type,
        })
      );
    }
  } catch (error) {
    throw error;
  }

  return attachments;
};
