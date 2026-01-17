"use client";

import { AttachmentType } from "@prisma/client";
import { useActionState } from "react";
import { FieldError } from "@/components/form/field-error";
import { Form } from "@/components/form/form";
import { SubmitButton } from "@/components/form/submit-button";
import { EMPTY_ACTION_STATE } from "@/components/form/utils/to-action-state";
import { Input } from "@/components/ui/input";
import { createAttachments } from "../actions/create-attachments";
import { ACCEPTED } from "../constants";

type AttachmentCreateFormProps = {
  attachmentType: AttachmentType;
  buttons?: React.ReactNode;
  onSuccess?: () => void;
};

const AttachmentCreateForm = ({
  attachmentType,
  buttons,
  onSuccess,
}: AttachmentCreateFormProps) => {
  const [actionState, action] = useActionState(
    createAttachments.bind(null, { attachmentType }),
    EMPTY_ACTION_STATE
  );

  return (
    <Form action={action} actionState={actionState} onSuccess={onSuccess}>
      <Input
        name="files"
        id="files"
        type="file"
        multiple
        accept={ACCEPTED.join(",")}
      />
      <FieldError actionState={actionState} name="files" />

      {buttons || <SubmitButton label="Upload" />}
    </Form>
  );
};

export { AttachmentCreateForm };
