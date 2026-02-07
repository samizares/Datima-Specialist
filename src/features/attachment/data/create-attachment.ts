import { AttachmentType } from "@prisma/client";
import { prisma } from "@/lib/prisma";

type CreateAttachmentArgs = {
  name: string;
  attachmentType: AttachmentType;
};

export const createAttachment = async ({
  name,
  attachmentType,
}: CreateAttachmentArgs) => {
  return await prisma.attachment.create({
    data: {
      name,
      attachmentType,
    },
  });
};
