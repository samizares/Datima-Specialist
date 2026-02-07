import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { NextRequest } from "next/server";
import * as attachmentData from "@/features/attachment/data";
import { generateS3Key } from "@/features/attachment/utils/generate-s3-key";
import { s3 } from "@/lib/aws";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ attachmentId: string }> }
) {
  const { attachmentId } = await params;

  const attachment = await attachmentData.getAttachment(attachmentId);

  if (!attachment) {
    throw new Error("Attachment not found");
  }

  const presignedUrl = await getSignedUrl(
    s3,
    new GetObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: generateS3Key({
        attachmentType: attachment.attachmentType,
        fileName: attachment.name,
        attachmentId: attachment.id,
      }),
    }),
    { expiresIn: 5 * 60 }
  );

  const response = await fetch(presignedUrl);

  const headers = new Headers();
  const contentType = response.headers.get("content-type");
  if (contentType) {
    headers.set("content-type", contentType);
  }
  headers.set(
    "content-disposition",
    `inline; filename="${attachment.name}"`
  );

  return new Response(response.body, {
    headers,
  });
}
