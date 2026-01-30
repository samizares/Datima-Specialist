import { AttachmentType } from "@prisma/client";

type GenerateKeyArgs = {
  attachmentType: AttachmentType;
  fileName: string;
  attachmentId: string;
};

export const generateS3Key = ({
  attachmentType,
  fileName,
  attachmentId,
}: GenerateKeyArgs) => {
  return `attachments/${attachmentType}/${attachmentId}/${fileName}`;
};
