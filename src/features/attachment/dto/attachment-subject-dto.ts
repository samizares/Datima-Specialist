import { AttachmentType } from "@prisma/client";

export type Type = {
  attachmentType: AttachmentType;
};

export const fromAttachmentType = (attachmentType: AttachmentType) => {
  return { attachmentType };
};
