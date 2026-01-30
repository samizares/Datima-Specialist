import { AttachmentType } from "@prisma/client";
import { CardCompact } from "@/components/card-compact";
import { getAttachments } from "../queries/get-attachments";
import { AttachmentCreateForm } from "./attachment-create-form";
import { AttachmentDeleteButton } from "./attachment-delete-button";
import { AttachmentList } from "./attachment-list";

type AttachmentsProps = {
  attachmentType: AttachmentType;
  isOwner: boolean;
};

const Attachments = async ({ attachmentType, isOwner }: AttachmentsProps) => {
  const attachments = await getAttachments(attachmentType);

  return (
    <CardCompact
      title="Attachments"
      description="Attached images or PDFs"
      content={
        <>
          <AttachmentList
            attachments={attachments}
            buttons={(attachmentId: string) => [
              ...(isOwner
                ? [<AttachmentDeleteButton key="0" id={attachmentId} />]
                : []),
            ]}
          />

          {isOwner && (
            <AttachmentCreateForm attachmentType={attachmentType} />
          )}
        </>
      }
    />
  );
};

export { Attachments };
