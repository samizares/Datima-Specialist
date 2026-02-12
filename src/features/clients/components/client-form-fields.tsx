"use client";

import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type Dispatch,
  type PointerEvent,
  type SetStateAction,
} from "react";
import Image from "next/image";
import { AttachmentType, ClientStatus } from "@prisma/client";
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

export type ClientFormValues = {
  firstName: string;
  lastName: string;
  email: string;
  telephone: string;
  address: string;
  status: ClientStatus;
  attachmentId: string;
};

type ClientFormFieldsProps = {
  values: ClientFormValues;
  onChange: Dispatch<SetStateAction<ClientFormValues>>;
};

export function ClientFormFields({ values, onChange }: ClientFormFieldsProps) {
  const uploadRef = useRef<HTMLInputElement | null>(null);
  const previewRef = useRef<HTMLDivElement | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [position, setPosition] = useState({ x: 50, y: 50 });
  const [isUploading, setUploading] = useState(false);
  const [isDragging, setDragging] = useState(false);
  const dragState = useRef<{
    startX: number;
    startY: number;
    startPosX: number;
    startPosY: number;
  } | null>(null);

  useEffect(() => {
    if (values.attachmentId) {
      setPreview(attachmentDownloadPath(values.attachmentId));
    } else {
      setPreview(null);
    }
    setPosition({ x: 50, y: 50 });
  }, [values.attachmentId]);

  const handleUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const result = await uploadAttachment(AttachmentType.CLIENT, file);
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

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (!previewRef.current) return;
    previewRef.current.setPointerCapture(event.pointerId);
    setDragging(true);
    dragState.current = {
      startX: event.clientX,
      startY: event.clientY,
      startPosX: position.x,
      startPosY: position.y,
    };
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!previewRef.current || !dragState.current) return;
    const rect = previewRef.current.getBoundingClientRect();
    const deltaX = event.clientX - dragState.current.startX;
    const deltaY = event.clientY - dragState.current.startY;
    const nextX = Math.min(
      100,
      Math.max(0, dragState.current.startPosX + (deltaX / rect.width) * 100)
    );
    const nextY = Math.min(
      100,
      Math.max(0, dragState.current.startPosY + (deltaY / rect.height) * 100)
    );
    setPosition({ x: nextX, y: nextY });
  };

  const handlePointerUp = (event: PointerEvent<HTMLDivElement>) => {
    if (!previewRef.current) return;
    previewRef.current.releasePointerCapture(event.pointerId);
    dragState.current = null;
    setDragging(false);
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
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="telephone">Telephone</Label>
        <Input
          id="telephone"
          value={values.telephone}
          onChange={(event) =>
            onChange({ ...values, telephone: event.target.value })
          }
          required
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="address">Address</Label>
        <Input
          id="address"
          value={values.address}
          onChange={(event) =>
            onChange({ ...values, address: event.target.value })
          }
          required
        />
      </div>
      <div className="grid gap-2">
        <Label>Status</Label>
        <Select
          value={values.status}
          onValueChange={(value) =>
            onChange({ ...values, status: value as ClientStatus })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="PROSPECT">Prospect</SelectItem>
            <SelectItem value="PATIENT">Patient</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="grid gap-2">
        <Label>Profile image</Label>
        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 text-center text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-950">
          {preview ? (
            <div className="space-y-3">
              <div
                ref={previewRef}
                className="relative h-[300px] w-full touch-none overflow-hidden rounded-xl border border-slate-200"
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
              >
                <Image
                  src={preview}
                  alt="Client preview"
                  fill
                  sizes="480px"
                  quality={100}
                  className={`object-cover select-none ${isDragging ? "cursor-grabbing" : "cursor-grab"}`}
                  style={{ objectPosition: `${position.x}% ${position.y}%` }}
                  draggable={false}
                />
              </div>
              <span className="block text-xs text-slate-500">
                Drag the image to adjust its positioning.
              </span>
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
