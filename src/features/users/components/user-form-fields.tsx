"use client";

import { useEffect, useRef, useState, type ChangeEvent, type Dispatch, type SetStateAction } from "react";
import Image from "next/image";
import { AttachmentType } from "@prisma/client";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { uploadAttachment } from "@/features/attachment/actions/upload-attachment";
import { attachmentDownloadPath } from "@/paths";

type UserFormValues = {
  username: string;
  email: string;
  password: string;
  emailVerified: string;
  isAdmin: string;
  isSuperAdmin: string;
  attachmentId: string;
};

type UserFormFieldsProps = {
  values: UserFormValues;
  canAssignRoles: boolean;
  isEditing: boolean;
  onChange: Dispatch<SetStateAction<UserFormValues>>;
};

export function UserFormFields({
  values,
  canAssignRoles,
  isEditing,
  onChange,
}: UserFormFieldsProps) {
  const uploadRef = useRef<HTMLInputElement | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isUploading, setUploading] = useState(false);

  useEffect(() => {
    if (values.attachmentId) {
      setPreview(attachmentDownloadPath(values.attachmentId));
    } else {
      setPreview(null);
    }
  }, [values.attachmentId]);

  const handleUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const result = await uploadAttachment(AttachmentType.USER, file);
    if (result.status === "ERROR") {
      toast.error(result.message || "Image upload failed.");
      setUploading(false);
      return;
    }
    const attachmentId = result.data?.attachmentId;
    if (!attachmentId) {
      toast.error("Image upload failed.");
      setUploading(false);
      return;
    }
    onChange({ ...values, attachmentId });
    setPreview(URL.createObjectURL(file));
    setUploading(false);
  };

  return (
    <>
      <div className="grid gap-2">
        <Label htmlFor="username">Username</Label>
        <Input
          id="username"
          value={values.username}
          onChange={(event) =>
            onChange({ ...values, username: event.target.value })
          }
          required
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={values.email}
          onChange={(event) => onChange({ ...values, email: event.target.value })}
          required
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="password">
          Password {isEditing ? "(leave blank to keep)" : ""}
        </Label>
        <Input
          id="password"
          type="password"
          value={values.password}
          onChange={(event) =>
            onChange({ ...values, password: event.target.value })
          }
          required={!isEditing}
        />
      </div>
      <div className="grid gap-2">
        <Label>Email verified</Label>
        <Select
          value={values.emailVerified}
          onValueChange={(value) =>
            onChange({ ...values, emailVerified: value })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="true">Verified</SelectItem>
            <SelectItem value="false">Not verified</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="grid gap-2">
        <Label>Admin role</Label>
        <Select
          value={values.isAdmin}
          onValueChange={(value) => onChange({ ...values, isAdmin: value })}
          disabled={!canAssignRoles}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="true">Admin</SelectItem>
            <SelectItem value="false">Standard</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="grid gap-2">
        <Label>Super admin</Label>
        <Select
          value={values.isSuperAdmin}
          onValueChange={(value) => onChange({ ...values, isSuperAdmin: value })}
          disabled={!canAssignRoles}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="true">Super admin</SelectItem>
            <SelectItem value="false">Standard</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="grid gap-2">
        <Label>Profile image</Label>
        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 text-center text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-950">
          {preview ? (
            <div className="space-y-3">
              <div className="relative h-36 w-full overflow-hidden rounded-xl border border-slate-200">
                <Image
                  src={preview}
                  alt="User preview"
                  fill
                  sizes="480px"
                  className="object-cover"
                />
              </div>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => uploadRef.current?.click()}
                disabled={isUploading}
              >
                Replace image
              </Button>
            </div>
          ) : (
            <Button
              type="button"
              variant="outline"
              className="rounded-full"
              onClick={() => uploadRef.current?.click()}
              disabled={isUploading}
            >
              Upload image
            </Button>
          )}
        </div>
      </div>
      <input
        ref={uploadRef}
        type="file"
        accept="image/png,image/jpeg,image/jpg"
        className="hidden"
        onChange={handleUpload}
      />
    </>
  );
}
