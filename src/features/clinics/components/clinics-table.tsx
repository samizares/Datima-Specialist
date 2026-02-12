"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
  type ChangeEvent,
  type FormEvent,
  type PointerEvent,
} from "react";
import Image from "next/image";
import { Pencil, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AttachmentType } from "@prisma/client";

import { useConfirmDialog } from "@/components/confirm-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  createClinic,
  deleteClinic,
  updateClinic,
} from "../actions/clinics";
import { getClinics } from "../queries/get-clinics";
import { uploadAttachment } from "@/features/attachment/actions/upload-attachment";
import { attachmentDownloadPath } from "@/paths";
import { operatingDayOptions, type OperatingDayValue } from "@/lib/operating-days";

type ClinicRecord = Awaited<ReturnType<typeof getClinics>>[number];

type OperatingTimeValue = {
  openDay: OperatingDayValue;
  startTime: string;
  endTime: string;
};

type ClinicFormValues = {
  name: string;
  desc: string;
  attachmentId: string;
  operatingTimes: OperatingTimeValue[];
};

const defaultFormValues: ClinicFormValues = {
  name: "",
  desc: "",
  attachmentId: "",
  operatingTimes: [],
};

type ClinicsTableProps = {
  initialClinics: ClinicRecord[];
  canEdit: boolean;
  canDelete: boolean;
};

const DeleteClinicButton = ({
  clinicId,
  disabled,
  onDeleted,
}: {
  clinicId: string;
  disabled: boolean;
  onDeleted: () => void;
}) => {
  const [trigger, dialog] = useConfirmDialog({
    title: "Delete clinic",
    description:
      "Are you sure you want to delete this record permanently from the database?",
    action: async () => {
      const result = await deleteClinic(clinicId);
      if (result.status === "SUCCESS") {
        onDeleted();
      }
      return result;
    },
    trigger: (isLoading) => (
      <Button variant="ghost" size="icon" disabled={disabled || isLoading}>
        <Trash2 className="h-4 w-4 text-red-500" />
      </Button>
    ),
  });

  return (
    <>
      {trigger}
      {dialog}
    </>
  );
};

export function ClinicsTable({
  initialClinics,
  canEdit,
  canDelete,
}: ClinicsTableProps) {
  const [clinics, setClinics] = useState<ClinicRecord[]>(initialClinics);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<ClinicRecord | null>(null);
  const [formValues, setFormValues] = useState<ClinicFormValues>(defaultFormValues);
  const [isPending, startTransition] = useTransition();
  const [isUploading, setUploading] = useState(false);
  const [attachmentPreview, setAttachmentPreview] = useState<string | null>(null);
  const uploadRef = useRef<HTMLInputElement | null>(null);
  const previewRef = useRef<HTMLDivElement | null>(null);
  const [position, setPosition] = useState({ x: 50, y: 50 });
  const [isDragging, setDragging] = useState(false);
  const dragState = useRef<{
    startX: number;
    startY: number;
    startPosX: number;
    startPosY: number;
  } | null>(null);

  const tableRows = useMemo(() => clinics.slice(0, 6), [clinics]);

  const loadClinics = () => {
    startTransition(async () => {
      const data = await getClinics();
      setClinics(data);
    });
  };

  useEffect(() => {
    if (!formOpen) return;
    if (editing) {
      setFormValues({
        name: editing.name,
        desc: editing.desc,
        attachmentId: editing.attachmentId ?? "",
        operatingTimes:
          editing.operatingTimes?.map((time) => ({
            openDay: time.openDay,
            startTime: time.startTime,
            endTime: time.endTime,
          })) ?? [],
      });
      setAttachmentPreview(
        editing.attachmentId ? attachmentDownloadPath(editing.attachmentId) : null
      );
    } else {
      setFormValues(defaultFormValues);
      setAttachmentPreview(null);
    }
    setPosition({ x: 50, y: 50 });
  }, [editing, formOpen]);

  const handleUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const result = await uploadAttachment(AttachmentType.CLINIC, file);
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
    setFormValues((prev) => ({ ...prev, attachmentId }));
    setAttachmentPreview(URL.createObjectURL(file));
    setPosition({ x: 50, y: 50 });
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

  const handleAddClick = () => {
    if (!canEdit) return;
    setEditing(null);
    setFormOpen(true);
  };

  const handleEditClick = (clinic: ClinicRecord) => {
    if (!canEdit) return;
    setEditing(clinic);
    setFormOpen(true);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    startTransition(async () => {
      const payload = {
        ...formValues,
        attachmentId: formValues.attachmentId || null,
      };
      const action = editing
        ? await updateClinic(editing.id, payload)
        : await createClinic(payload);
      if (action.status === "ERROR") {
        toast.error(action.message || "Please check the form fields.");
        return;
      }
      toast.success(action.message || "Saved.");
      setFormOpen(false);
      setEditing(null);
      loadClinics();
    });
  };

  const addOperatingTime = () => {
    setFormValues((prev) => ({
      ...prev,
      operatingTimes: [
        ...prev.operatingTimes,
        {
          openDay: operatingDayOptions[0]?.value ?? "MONDAY",
          startTime: "",
          endTime: "",
        },
      ],
    }));
  };

  const updateOperatingTime = (
    index: number,
    updates: Partial<OperatingTimeValue>
  ) => {
    setFormValues((prev) => ({
      ...prev,
      operatingTimes: prev.operatingTimes.map((time, timeIndex) =>
        timeIndex === index ? { ...time, ...updates } : time
      ),
    }));
  };

  const removeOperatingTime = (index: number) => {
    setFormValues((prev) => ({
      ...prev,
      operatingTimes: prev.operatingTimes.filter((_, timeIndex) => timeIndex !== index),
    }));
  };

  return (
    <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">
            Clinics
          </p>
          <h1 className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
            Manage Clinics
          </h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Update clinic profiles, descriptions, and linked assets.
          </p>
        </div>
        {canEdit ? (
          <Button
            className="rounded-full bg-blue-600 text-white hover:bg-blue-700"
            onClick={handleAddClick}
          >
            Add Clinic
          </Button>
        ) : null}
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-950">
        <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
          <span>Show</span>
          <Select defaultValue="10">
            <SelectTrigger className="h-9 w-[90px] rounded-full border-slate-200 bg-white text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
            </SelectContent>
          </Select>
          <span>entries</span>
        </div>
        <div className="relative w-full max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Search..."
            className="h-10 rounded-full border-slate-200 bg-white pl-9 text-sm text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
          />
        </div>
      </div>

      <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200/70 dark:border-slate-800">
        <Table>
          <TableHeader className="bg-white text-xs font-semibold uppercase tracking-[0.12em] text-slate-400 dark:bg-slate-900 dark:text-slate-500">
            <TableRow className="border-slate-200/70 dark:border-slate-800">
              <TableHead>Clinic</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Doctors</TableHead>
              <TableHead>Image</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tableRows.length ? (
              tableRows.map((clinic) => (
                <TableRow
                  key={clinic.id}
                  className="border-slate-100 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-950"
                >
                  <TableCell className="font-semibold text-slate-900 dark:text-white">
                    {clinic.name}
                  </TableCell>
                  <TableCell className="max-w-md truncate text-slate-500 dark:text-slate-400">
                    {clinic.desc}
                  </TableCell>
                  <TableCell className="text-slate-500 dark:text-slate-400">
                    {clinic.doctors.length
                      ? Array.from(
                          new Set(
                            clinic.doctors
                              .map((schedule) =>
                                schedule.doctor
                                  ? `${schedule.doctor.firstName} ${schedule.doctor.lastName}`
                                  : null
                              )
                              .filter((value): value is string => Boolean(value))
                          )
                        ).join(", ")
                      : "No doctors"}
                  </TableCell>
                  <TableCell>
                    <div className="h-10 w-14 overflow-hidden rounded-lg bg-slate-100">
                      <img
                        src={
                          clinic.attachmentId
                            ? attachmentDownloadPath(clinic.attachmentId)
                            : "/assets/profile-placeholder.svg"
                        }
                        alt={clinic.name}
                        className="h-full w-full object-cover"
                        loading="lazy"
                        decoding="async"
                      />
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {canEdit ? (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditClick(clinic)}
                        >
                          <Pencil className="h-4 w-4 text-slate-500" />
                        </Button>
                      ) : null}
                      {canDelete ? (
                        <DeleteClinicButton
                          clinicId={clinic.id}
                          disabled={isPending}
                          onDeleted={loadClinics}
                        />
                      ) : null}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="py-10 text-center text-sm text-slate-500">
                  No clinics found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-h-[85vh] max-w-xl overflow-y-auto rounded-3xl border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          <DialogHeader>
            <DialogTitle className="inline-flex w-fit rounded-lg bg-blue-600 px-3 py-2 text-xl font-semibold text-white">
              {editing ? "Edit clinic" : "Add clinic"}
            </DialogTitle>
          </DialogHeader>
          <form className="mt-4 grid gap-4" onSubmit={handleSubmit}>
            <div className="grid gap-2">
              <Label htmlFor="name">Clinic name</Label>
              <Input
                id="name"
                value={formValues.name}
                onChange={(event) =>
                  setFormValues((prev) => ({ ...prev, name: event.target.value }))
                }
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="desc">Description</Label>
              <textarea
                id="desc"
                value={formValues.desc}
                onChange={(event) =>
                  setFormValues((prev) => ({ ...prev, desc: event.target.value }))
                }
                required
                className="min-h-[120px] rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
              />
            </div>
            <div className="rounded-2xl border border-slate-200/80 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">
                    Operating times
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Optional. Clinics only appear in appointment booking after at
                    least one operating time is saved.
                  </p>
                </div>
                <Button type="button" variant="outline" onClick={addOperatingTime}>
                  Add operating time
                </Button>
              </div>
              {formValues.operatingTimes.length ? (
                <div className="mt-4 space-y-3">
                  {formValues.operatingTimes.map((time, index) => (
                    <div
                      key={`${time.openDay}-${index}`}
                      className="grid gap-3 md:grid-cols-[1.3fr_1fr_1fr_auto] md:items-end"
                    >
                      <div className="grid gap-2">
                        <Label>Open day</Label>
                        <Select
                          value={time.openDay}
                          onValueChange={(value) =>
                            updateOperatingTime(index, {
                              openDay: value as OperatingDayValue,
                            })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select day" />
                          </SelectTrigger>
                          <SelectContent>
                            {operatingDayOptions.map((day) => (
                              <SelectItem key={day.value} value={day.value}>
                                {day.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label>Start time</Label>
                        <Input
                          type="time"
                          value={time.startTime}
                          onChange={(event) =>
                            updateOperatingTime(index, {
                              startTime: event.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label>End time</Label>
                        <Input
                          type="time"
                          value={time.endTime}
                          onChange={(event) =>
                            updateOperatingTime(index, {
                              endTime: event.target.value,
                            })
                          }
                        />
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-10 w-10 text-slate-500 hover:text-red-500"
                        onClick={() => removeOperatingTime(index)}
                        aria-label="Remove operating time"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
                  No operating times added yet.
                </p>
              )}
            </div>
            <div className="grid gap-2">
              <Label>Clinic image</Label>
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 text-center text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-950">
                {attachmentPreview ? (
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
                        src={attachmentPreview}
                        alt="Clinic preview"
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
            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setFormOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="rounded-full bg-blue-600 text-white hover:bg-blue-700"
                disabled={isPending}
              >
                {editing ? "Save changes" : "Create clinic"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <input
        ref={uploadRef}
        type="file"
        accept="image/png,image/jpeg,image/jpg"
        className="hidden"
        onChange={handleUpload}
      />
    </div>
  );
}
