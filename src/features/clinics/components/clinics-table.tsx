"use client";

import { useEffect, useMemo, useRef, useState, useTransition, type FormEvent, type ChangeEvent } from "react";
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

type ClinicRecord = Awaited<ReturnType<typeof getClinics>>[number];

type ClinicFormValues = {
  name: string;
  desc: string;
  attachmentId: string;
};

const defaultFormValues: ClinicFormValues = {
  name: "",
  desc: "",
  attachmentId: "",
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
      });
      setAttachmentPreview(
        editing.attachmentId ? attachmentDownloadPath(editing.attachmentId) : null
      );
    } else {
      setFormValues(defaultFormValues);
      setAttachmentPreview(null);
    }
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
    setUploading(false);
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

  return (
    <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">
            Clinics
          </p>
          <h1 className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
            Clinic directories
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
                <TableCell colSpan={4} className="py-10 text-center text-sm text-slate-500">
                  No clinics found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-xl rounded-3xl border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
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
            <div className="grid gap-2">
              <Label>Clinic image</Label>
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 text-center text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-950">
                {attachmentPreview ? (
                  <div className="space-y-3">
                    <div className="relative h-36 w-full overflow-hidden rounded-xl border border-slate-200">
                      <Image
                        src={attachmentPreview}
                        alt="Clinic preview"
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
