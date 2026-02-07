"use client";

import { useEffect, useMemo, useState, useTransition, type FormEvent } from "react";
import { Pencil, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DoctorFormFields } from "./doctor-form-fields";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  createDoctor,
  deleteDoctor,
  updateDoctor,
} from "../actions/doctors";
import { getDoctors } from "../queries/get-doctors";
import Link from "next/link";
import { attachmentDownloadPath } from "@/paths";

type DoctorRecord = Awaited<ReturnType<typeof getDoctors>>[number];

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

const defaultFormValues: DoctorFormValues = {
  firstName: "",
  lastName: "",
  email: "",
  clinicId: "none",
  attachmentId: "",
};

const DeleteDoctorButton = ({
  doctorId,
  disabled,
  onDeleted,
}: {
  doctorId: string;
  disabled: boolean;
  onDeleted: () => void;
}) => {
  const [trigger, dialog] = useConfirmDialog({
    title: "Delete doctor",
    description:
      "Are you sure you want to delete this record permanently from the database?",
    action: async () => {
      const result = await deleteDoctor(doctorId);
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

export function DoctorsTable({
  initialDoctors,
  clinicOptions,
  canEdit,
  canDelete,
}: {
  initialDoctors: DoctorRecord[];
  clinicOptions: ClinicOption[];
  canEdit: boolean;
  canDelete: boolean;
}) {
  const [doctors, setDoctors] = useState<DoctorRecord[]>(initialDoctors);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<DoctorRecord | null>(null);
  const [formValues, setFormValues] = useState<DoctorFormValues>(defaultFormValues);
  const [isPending, startTransition] = useTransition();

  const tableRows = useMemo(() => doctors.slice(0, 6), [doctors]);

  const loadDoctors = () => {
    startTransition(async () => {
      const data = await getDoctors();
      setDoctors(data);
    });
  };

  useEffect(() => {
    if (!formOpen) return;
    if (editing) {
      setFormValues({
        firstName: editing.firstName,
        lastName: editing.lastName,
        email: editing.email,
        clinicId: editing.clinicId ?? "none",
        attachmentId: editing.attachmentId ?? "",
      });
    } else {
      setFormValues(defaultFormValues);
    }
  }, [editing, formOpen]);

  const handleAddClick = () => {
    if (!canEdit) return;
    setEditing(null);
    setFormOpen(true);
  };

  const handleEditClick = (doctor: DoctorRecord) => {
    if (!canEdit) return;
    setEditing(doctor);
    setFormOpen(true);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    startTransition(async () => {
      const payload = {
        ...formValues,
        clinicId: formValues.clinicId === "none" ? null : formValues.clinicId,
        attachmentId: formValues.attachmentId || null,
      };
      const action = editing
        ? await updateDoctor(editing.id, payload)
        : await createDoctor(payload);
      if (action.status === "ERROR") {
        toast.error(action.message || "Please check the form fields.");
        return;
      }
      toast.success(action.message || "Saved.");
      setFormOpen(false);
      setEditing(null);
      loadDoctors();
    });
  };

  return (
    <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">
            Doctors
          </p>
          <h1 className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
            Specialist roster
          </h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Manage clinician profiles and their clinic assignments.
          </p>
        </div>
        {canEdit ? (
          <Button
            className="rounded-full bg-blue-600 text-white hover:bg-blue-700"
            onClick={handleAddClick}
          >
            Add Doctor
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
              <TableHead>Photo</TableHead>
              <TableHead>Doctor</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Clinic</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tableRows.length ? (
              tableRows.map((doctor) => (
                <TableRow
                  key={doctor.id}
                  className="border-slate-100 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-950"
                >
                  <TableCell>
                        <div className="h-10 w-14 overflow-hidden rounded-lg bg-slate-100">
                          <img
                            src={
                              doctor.attachmentId
                                ? attachmentDownloadPath(doctor.attachmentId)
                                : "/assets/profile-placeholder.svg"
                            }
                            alt={`${doctor.firstName} ${doctor.lastName}`}
                            className="h-full w-full object-cover"
                            loading="lazy"
                            decoding="async"
                          />
                        </div>
                  </TableCell>
                  <TableCell className="font-semibold text-slate-900 dark:text-white">
                    <Link
                      href={`/admin/doctors/${doctor.id}`}
                      className="transition hover:text-blue-600"
                    >
                      {doctor.firstName} {doctor.lastName}
                    </Link>
                  </TableCell>
                  <TableCell className="text-slate-500 dark:text-slate-400">
                    {doctor.email}
                  </TableCell>
                  <TableCell className="text-slate-500 dark:text-slate-400">
                    {doctor.clinic?.name ?? "Unassigned"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {canEdit ? (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditClick(doctor)}
                        >
                          <Pencil className="h-4 w-4 text-slate-500" />
                        </Button>
                      ) : null}
                      {canDelete ? (
                        <DeleteDoctorButton
                          doctorId={doctor.id}
                          disabled={isPending}
                          onDeleted={loadDoctors}
                        />
                      ) : null}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="py-10 text-center text-sm text-slate-500">
                  No doctors found.
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
              {editing ? "Edit doctor" : "Add doctor"}
            </DialogTitle>
          </DialogHeader>
          <form className="mt-4 grid gap-4" onSubmit={handleSubmit}>
            <DoctorFormFields
              values={formValues}
              clinics={clinicOptions}
              onChange={(values) => setFormValues(values)}
            />
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
                {editing ? "Save changes" : "Create doctor"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
