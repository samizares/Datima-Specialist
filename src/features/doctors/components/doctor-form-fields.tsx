"use client";

import { useEffect, useRef, useState, type ChangeEvent } from "react";
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

type ClinicOption = {
  id: string;
  name: string;
};

type DoctorFormValues = {
  firstName: string;
  lastName: string;
  email: string;
  clinicId: string;
  attachmentId: string;
};

type DoctorFormFieldsProps = {
  values: DoctorFormValues;
  clinics: ClinicOption[];
  onChange: (values: DoctorFormValues) => void;
};

export function DoctorFormFields({
  values,
  clinics,
  onChange,
}: DoctorFormFieldsProps) {
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
    const result = await uploadAttachment(AttachmentType.DOCTOR, file);
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
        <Label htmlFor="firstName">First name</Label>
        <Input
          id="firstName"
          value={values.firstName}
          onChange={(event) =>
            onChange({ ...values, firstName: event.target.value })
          }
          required
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="lastName">Last name</Label>
        <Input
          id="lastName"
          value={values.lastName}
          onChange={(event) =>
            onChange({ ...values, lastName: event.target.value })
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
        <Label>Clinic assignment</Label>
        <Select
          value={values.clinicId}
          onValueChange={(value) =>
            onChange({ ...values, clinicId: value })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a clinic" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Unassigned</SelectItem>
            {clinics.map((clinic) => (
              <SelectItem key={clinic.id} value={clinic.id}>
                {clinic.name}
              </SelectItem>
            ))}
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
                  alt="Doctor preview"
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
