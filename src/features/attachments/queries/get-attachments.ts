import { AttachmentType } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export const getAttachments = async (
  attachmentType: AttachmentType
) => {
  return await prisma.attachment.findMany({
    where: {
      attachmentTpe: attachmentType,
    },
  });
};
