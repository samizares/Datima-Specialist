import { PutObjectCommand } from "@aws-sdk/client-s3";
import { AttachmentType } from "@prisma/client";
import { s3 } from "@/lib/aws";
import { generateS3Key } from "@/features/attachment/utils/generate-s3-key";
import * as attachmentData from "@/features/attachment/data";

type StoreInvoicePdfArgs = {
  buffer: Buffer;
  fileName: string;
};

export const storeInvoicePdf = async ({ buffer, fileName }: StoreInvoicePdfArgs) => {
  const attachment = await attachmentData.createAttachment({
    name: fileName,
    attachmentType: AttachmentType.INVOICE,
  });

  await s3.send(
    new PutObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: generateS3Key({
        attachmentType: AttachmentType.INVOICE,
        fileName,
        attachmentId: attachment.id,
      }),
      Body: buffer,
      ContentType: "application/pdf",
    })
  );

  return attachment;
};
