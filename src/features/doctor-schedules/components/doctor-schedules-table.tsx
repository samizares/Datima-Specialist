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
  createDoctorSchedule,
  deleteDoctorSchedule,
  updateDoctorSchedule,
} from "../actions/doctor-schedules";
import { getDoctorSchedules } from "../queries/get-doctor-schedules";

type DoctorScheduleRecord = Awaited<ReturnType<typeof getDoctorSchedules>>[number];

type DoctorOption = {
  id: string;
  firstName: string;
  lastName: string;
};

type ClinicOption = {
  id: string;
  name: string;
};

type DoctorScheduleFormValues = {
  doctorId: string;
  clinicId: string;
  day: string;
  startTime: string;
  endTime: string;
};

const defaultFormValues: DoctorScheduleFormValues = {
  doctorId: "",
  clinicId: "",
  day: "",
  startTime: "",
  endTime: "",
};

const DeleteScheduleButton = ({
  scheduleId,
  disabled,
  onDeleted,
}: {
  scheduleId: string;
  disabled: boolean;
  onDeleted: () => void;
}) => {
  const [trigger, dialog] = useConfirmDialog({
    title: "Delete schedule",
    description:
      "Are you sure you want to delete this record permanently from the database?",
    action: async () => {
      const result = await deleteDoctorSchedule(scheduleId);
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

export function DoctorSchedulesTable({
  initialSchedules,
  doctors,
  clinics,
  canEdit,
  canDelete,
}: {
  initialSchedules: DoctorScheduleRecord[];
  doctors: DoctorOption[];
  clinics: ClinicOption[];
  canEdit: boolean;
  canDelete: boolean;
}) {
  const [schedules, setSchedules] = useState<DoctorScheduleRecord[]>(initialSchedules);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<DoctorScheduleRecord | null>(null);
  const [formValues, setFormValues] = useState<DoctorScheduleFormValues>(defaultFormValues);
  const [isPending, startTransition] = useTransition();

  const tableRows = useMemo(() => schedules.slice(0, 6), [schedules]);

  const loadSchedules = () => {
    startTransition(async () => {
      const data = await getDoctorSchedules();
      setSchedules(data);
    });
  };

  useEffect(() => {
    if (!formOpen) return;
    if (editing) {
      setFormValues({
        doctorId: editing.doctorId,
        clinicId: editing.clinicId,
        day: editing.day,
        startTime: editing.startTime,
        endTime: editing.endTime,
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

  const handleEditClick = (schedule: DoctorScheduleRecord) => {
    if (!canEdit) return;
    setEditing(schedule);
    setFormOpen(true);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    startTransition(async () => {
      const action = editing
        ? await updateDoctorSchedule(editing.id, formValues)
        : await createDoctorSchedule(formValues);
      if (action.status === "ERROR") {
        toast.error(action.message || "Please check the form fields.");
        return;
      }
      toast.success(action.message || "Saved.");
      setFormOpen(false);
      setEditing(null);
      loadSchedules();
    });
  };

  return (
    <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">
            Doctor Schedule
          </p>
          <h1 className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
            Clinic coverage
          </h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Manage doctor availability across clinics and days.
          </p>
        </div>
        {canEdit ? (
          <Button
            className="rounded-full bg-blue-600 text-white hover:bg-blue-700"
            onClick={handleAddClick}
          >
            Add Doctor Schedule
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
              <TableHead>Doctor</TableHead>
              <TableHead>Clinic</TableHead>
              <TableHead>Day</TableHead>
              <TableHead>Start</TableHead>
              <TableHead>End</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tableRows.length ? (
              tableRows.map((schedule) => (
                <TableRow
                  key={schedule.id}
                  className="border-slate-100 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-950"
                >
                  <TableCell className="font-semibold text-slate-900 dark:text-white">
                    {schedule.doctor.firstName} {schedule.doctor.lastName}
                  </TableCell>
                  <TableCell className="text-slate-500 dark:text-slate-400">
                    {schedule.clinic.name}
                  </TableCell>
                  <TableCell className="text-slate-500 dark:text-slate-400">
                    {schedule.day}
                  </TableCell>
                  <TableCell className="text-slate-500 dark:text-slate-400">
                    {schedule.startTime}
                  </TableCell>
                  <TableCell className="text-slate-500 dark:text-slate-400">
                    {schedule.endTime}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {canEdit ? (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditClick(schedule)}
                        >
                          <Pencil className="h-4 w-4 text-slate-500" />
                        </Button>
                      ) : null}
                      {canDelete ? (
                        <DeleteScheduleButton
                          scheduleId={schedule.id}
                          disabled={isPending}
                          onDeleted={loadSchedules}
                        />
                      ) : null}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-sm text-slate-500">
                  No schedules found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-xl rounded-3xl border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-slate-900 dark:text-white">
              {editing ? "Edit schedule" : "Add schedule"}
            </DialogTitle>
          </DialogHeader>
          <form className="mt-4 grid gap-4" onSubmit={handleSubmit}>
            <div className="grid gap-2">
              <Label>Doctor</Label>
              <Select
                value={formValues.doctorId}
                onValueChange={(value) =>
                  setFormValues((prev) => ({ ...prev, doctorId: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select doctor" />
                </SelectTrigger>
                <SelectContent>
                  {doctors.map((doctor) => (
                    <SelectItem key={doctor.id} value={doctor.id}>
                      {doctor.firstName} {doctor.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Clinic</Label>
              <Select
                value={formValues.clinicId}
                onValueChange={(value) =>
                  setFormValues((prev) => ({ ...prev, clinicId: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select clinic" />
                </SelectTrigger>
                <SelectContent>
                  {clinics.map((clinic) => (
                    <SelectItem key={clinic.id} value={clinic.id}>
                      {clinic.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="day">Day</Label>
              <Input
                id="day"
                value={formValues.day}
                onChange={(event) =>
                  setFormValues((prev) => ({ ...prev, day: event.target.value }))
                }
                placeholder="e.g. Monday"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="startTime">Start time</Label>
              <Input
                id="startTime"
                value={formValues.startTime}
                onChange={(event) =>
                  setFormValues((prev) => ({ ...prev, startTime: event.target.value }))
                }
                placeholder="e.g. 08:00am"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="endTime">End time</Label>
              <Input
                id="endTime"
                value={formValues.endTime}
                onChange={(event) =>
                  setFormValues((prev) => ({ ...prev, endTime: event.target.value }))
                }
                placeholder="e.g. 04:00pm"
              />
            </div>
            <DialogFooter className="gap-2">
              <Button type="button" variant="outline" onClick={() => setFormOpen(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                className="rounded-full bg-blue-600 text-white hover:bg-blue-700"
                disabled={isPending}
              >
                {editing ? "Save changes" : "Create schedule"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
