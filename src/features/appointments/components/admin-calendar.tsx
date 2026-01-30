"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import {
  addDays,
  addMonths,
  addWeeks,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  startOfDay,
  startOfMonth,
  startOfWeek,
  subMonths,
  subWeeks,
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";

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
import { cn } from "@/lib/utils";
import {
  createAppointment,
  deleteAppointment,
  updateAppointment,
} from "../actions/appointments";
import { getAppointmentsInRange } from "../queries/get-appointments-in-range";

type ClientOption = {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
};

type ClinicOption = {
  id: string;
  name: string;
};

type DoctorOption = {
  id: string;
  firstName: string;
  lastName: string;
};

type AppointmentRecord = Awaited<
  ReturnType<typeof getAppointmentsInRange>
>[number];

type ViewMode = "month" | "week" | "day";

type AdminCalendarProps = {
  clients: ClientOption[];
  clinics: ClinicOption[];
  doctors: DoctorOption[];
  canEdit: boolean;
  canDelete: boolean;
};

const hours = Array.from({ length: 10 }, (_, index) => 8 + index);

const statusOptions = [
  { value: "UNFILL", label: "Unfilled" },
  { value: "FILL", label: "Filled" },
  { value: "DONE", label: "Completed" },
];

const formatDateValue = (value?: Date | string | null) => {
  if (!value) return "";
  const date = typeof value === "string" ? new Date(value) : value;
  return format(date, "yyyy-MM-dd");
};

export function AdminCalendar({
  clients,
  clinics,
  doctors,
  canEdit,
  canDelete,
}: AdminCalendarProps) {
  const [view, setView] = useState<ViewMode>("month");
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [appointments, setAppointments] = useState<AppointmentRecord[]>([]);
  const [listOpen, setListOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [editing, setEditing] = useState<AppointmentRecord | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [formValues, setFormValues] = useState({
    clientId: "",
    clinicId: "",
    doctorId: "",
    setDay: "",
    setTime: "",
    status: "UNFILL",
  });

  const dateLabel = useMemo(() => {
    if (view === "month") {
      return format(currentDate, "MMMM yyyy");
    }
    if (view === "week") {
      const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
      const weekEnd = endOfWeek(currentDate, { weekStartsOn: 0 });
      return `${format(weekStart, "MMM d")} - ${format(weekEnd, "MMM d, yyyy")}`;
    }
    return format(currentDate, "MMMM d, yyyy");
  }, [currentDate, view]);

  const daysOfWeek = useMemo(
    () =>
      Array.from({ length: 7 }, (_, index) =>
        format(addDays(startOfWeek(currentDate), index), "EEE")
      ),
    [currentDate]
  );

  const monthDays = useMemo(() => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const gridStart = startOfWeek(monthStart, { weekStartsOn: 0 });
    const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
    const days: Date[] = [];
    let cursor = gridStart;
    while (cursor <= gridEnd) {
      days.push(cursor);
      cursor = addDays(cursor, 1);
    }
    return days;
  }, [currentDate]);

  const weekDays = useMemo(() => {
    const start = startOfWeek(currentDate, { weekStartsOn: 0 });
    return Array.from({ length: 7 }, (_, index) => addDays(start, index));
  }, [currentDate]);

  const handleNavigate = (direction: "prev" | "next") => {
    if (view === "month") {
      setCurrentDate((date) =>
        direction === "prev" ? subMonths(date, 1) : addMonths(date, 1)
      );
    } else if (view === "week") {
      setCurrentDate((date) =>
        direction === "prev" ? subWeeks(date, 1) : addWeeks(date, 1)
      );
    } else {
      setCurrentDate((date) =>
        direction === "prev" ? addDays(date, -1) : addDays(date, 1)
      );
    }
  };

  const getRangeForView = (date: Date) => {
    if (view === "month") {
      const start = startOfDay(date);
      return { start, end: addDays(start, 1) };
    }
    if (view === "week") {
      const start = startOfWeek(date, { weekStartsOn: 0 });
      const end = addDays(endOfWeek(date, { weekStartsOn: 0 }), 1);
      return { start, end };
    }
    const start = startOfDay(date);
    return { start, end: addDays(start, 1) };
  };

  const loadAppointments = (date: Date) => {
    const range = getRangeForView(date);
    startTransition(async () => {
      const data = await getAppointmentsInRange(
        range.start.toISOString(),
        range.end.toISOString()
      );
      setAppointments(data);
    });
  };

  const openList = (date: Date) => {
    setSelectedDate(date);
    setListOpen(true);
    loadAppointments(date);
  };

  const handleAddClick = () => {
    if (!canEdit) return;
    setEditing(null);
    setFormError(null);
    setListOpen(false);
    setFormOpen(true);
  };

  const handleEditClick = (appointment: AppointmentRecord) => {
    if (!canEdit) return;
    setEditing(appointment);
    setFormError(null);
    setListOpen(false);
    setFormOpen(true);
  };

  useEffect(() => {
    if (!formOpen) return;
    if (editing) {
      setFormValues({
        clientId: editing.clientId,
        clinicId: editing.clinicId,
        doctorId: editing.doctorId ?? "",
        setDay: formatDateValue(editing.setDay),
        setTime: editing.setTime,
        status: editing.status,
      });
      return;
    }
    setFormValues({
      clientId: "",
      clinicId: "",
      doctorId: "",
      setDay: formatDateValue(selectedDate),
      setTime: "",
      status: "UNFILL",
    });
  }, [editing, formOpen, selectedDate]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);

    const payload = {
      clientId: formValues.clientId,
      clinicId: formValues.clinicId,
      doctorId: formValues.doctorId,
      setDay: formValues.setDay,
      setTime: formValues.setTime,
      status: formValues.status,
    };

    const result = editing
      ? await updateAppointment(editing.id, payload)
      : await createAppointment(payload);

    if (result.status === "ERROR") {
      const message = result.message || "Unable to save appointment.";
      setFormError(message);
      toast.error(message);
      return;
    }

    toast.success(result.message || "Appointment saved.");
    setFormOpen(false);
    if (selectedDate) {
      loadAppointments(selectedDate);
    }
  };

  const handleDelete = async (appointmentId: string) => {
    const result = await deleteAppointment(appointmentId);
    if (result.status === "ERROR") {
      toast.error(result.message || "Unable to delete appointment.");
      return;
    }

    toast.success(result.message || "Appointment deleted.");
    if (selectedDate) {
      loadAppointments(selectedDate);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            onClick={() => handleNavigate("prev")}
            className="border-slate-200 bg-white hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => handleNavigate("next")}
            className="border-slate-200 bg-white hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900"
          >
            <ChevronRight className="h-4 w-4" aria-hidden />
          </Button>
          {canEdit ? (
            <Button
              className="rounded-full bg-blue-600 text-white hover:bg-blue-700"
              onClick={handleAddClick}
            >
              Add appointment
            </Button>
          ) : null}
        </div>

        <div className="text-lg font-semibold text-slate-900 dark:text-white">
          {dateLabel}
        </div>

        <div className="flex items-center rounded-full border border-slate-200 bg-slate-50 p-1 text-sm dark:border-slate-800 dark:bg-slate-950">
          {(["month", "week", "day"] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setView(mode)}
              className={cn(
                "rounded-full px-4 py-1.5 text-sm font-semibold capitalize transition",
                view === mode
                  ? "bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-white"
                  : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
              )}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-950">
        {view === "month" && (
          <div>
            <div className="grid grid-cols-7 border-b border-slate-200 text-xs font-semibold uppercase text-slate-500 dark:border-slate-800">
              {daysOfWeek.map((day) => (
                <div key={day} className="px-4 py-3">
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7">
              {monthDays.map((day) => {
                const isMuted = !isSameMonth(day, currentDate);
                return (
                  <button
                    key={day.toISOString()}
                    type="button"
                    onClick={() => openList(day)}
                    className={cn(
                      "h-28 border-b border-r border-slate-200/80 px-3 py-3 text-left text-sm transition hover:bg-blue-50 dark:border-slate-800 dark:hover:bg-slate-900",
                      isMuted && "text-slate-400"
                    )}
                  >
                    <span className="font-semibold">{format(day, "d")}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {view === "week" && (
          <div className="grid grid-cols-[80px_repeat(7,minmax(0,1fr))]">
            <div className="border-b border-r border-slate-200 px-3 py-3 text-xs font-semibold uppercase text-slate-500 dark:border-slate-800" />
            {weekDays.map((day) => (
              <div
                key={day.toISOString()}
                className="border-b border-r border-slate-200 px-3 py-3 text-xs font-semibold uppercase text-slate-500 dark:border-slate-800"
              >
                {format(day, "EEE d")}
              </div>
            ))}
            {hours.map((hour) => (
              <div key={`hour-${hour}`} className="contents">
                <div className="border-r border-slate-200 px-3 py-3 text-xs text-slate-500 dark:border-slate-800">
                  {format(new Date(2020, 0, 1, hour), "ha")}
                </div>
                {weekDays.map((day) => (
                  <button
                    key={`${day.toISOString()}-${hour}`}
                    type="button"
                    onClick={() => openList(day)}
                    className="h-16 border-b border-r border-slate-200 px-2 text-left text-xs hover:bg-blue-50 dark:border-slate-800 dark:hover:bg-slate-900"
                  />
                ))}
              </div>
            ))}
          </div>
        )}

        {view === "day" && (
          <div className="grid grid-cols-[80px_minmax(0,1fr)]">
            <div className="border-b border-r border-slate-200 px-3 py-3 text-xs font-semibold uppercase text-slate-500 dark:border-slate-800">
              Time
            </div>
            <div className="border-b border-slate-200 px-3 py-3 text-xs font-semibold uppercase text-slate-500 dark:border-slate-800">
              {format(currentDate, "EEEE, MMM d")}
            </div>
            {hours.map((hour) => (
              <div key={`day-hour-${hour}`} className="contents">
                <div className="border-r border-slate-200 px-3 py-3 text-xs text-slate-500 dark:border-slate-800">
                  {format(new Date(2020, 0, 1, hour), "ha")}
                </div>
                <button
                  type="button"
                  onClick={() => openList(currentDate)}
                  className="h-16 border-b border-slate-200 px-2 text-left text-xs hover:bg-blue-50 dark:border-slate-800 dark:hover:bg-slate-900"
                />
              </div>
            ))}
          </div>
        )}
      </div>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-xl rounded-3xl border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-slate-900 dark:text-white">
              {editing ? "Edit appointment" : "Add appointment"}
            </DialogTitle>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Provide the appointment details for scheduling.
            </p>
          </DialogHeader>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="grid gap-3">
              <Label htmlFor="clientId">Client</Label>
              <Select
                value={formValues.clientId}
                onValueChange={(value) =>
                  setFormValues((prev) => ({ ...prev, clientId: value }))
                }
              >
                <SelectTrigger id="clientId">
                  <SelectValue placeholder="Select client" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.firstName} {client.lastName}
                      {client.email ? ` · ${client.email}` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-3">
              <Label htmlFor="clinicId">Clinic</Label>
              <Select
                value={formValues.clinicId}
                onValueChange={(value) =>
                  setFormValues((prev) => ({ ...prev, clinicId: value }))
                }
              >
                <SelectTrigger id="clinicId">
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
            <div className="grid gap-3">
              <Label htmlFor="doctorId">Doctor (optional)</Label>
              <Select
                value={formValues.doctorId || "none"}
                onValueChange={(value) =>
                  setFormValues((prev) => ({
                    ...prev,
                    doctorId: value === "none" ? "" : value,
                  }))
                }
              >
                <SelectTrigger id="doctorId">
                  <SelectValue placeholder="Select doctor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No preference</SelectItem>
                  {doctors.map((doctor) => (
                    <SelectItem key={doctor.id} value={doctor.id}>
                      {doctor.firstName} {doctor.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-3">
              <Label htmlFor="setDay">Appointment date</Label>
              <Input
                id="setDay"
                name="setDay"
                type="date"
                value={formValues.setDay}
                onChange={(event) =>
                  setFormValues((prev) => ({
                    ...prev,
                    setDay: event.target.value,
                  }))
                }
              />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="setTime">Appointment time</Label>
              <Input
                id="setTime"
                name="setTime"
                type="time"
                value={formValues.setTime}
                onChange={(event) =>
                  setFormValues((prev) => ({
                    ...prev,
                    setTime: event.target.value,
                  }))
                }
              />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formValues.status}
                onValueChange={(value) =>
                  setFormValues((prev) => ({ ...prev, status: value }))
                }
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {formError ? (
              <p className="text-sm text-red-600">{formError}</p>
            ) : null}
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
              >
                {editing ? "Update appointment" : "Add Appointment"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={listOpen} onOpenChange={setListOpen}>
        <DialogContent className="max-w-2xl rounded-3xl border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-slate-900 dark:text-white">
              Appointments
            </DialogTitle>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {selectedDate
                ? `Viewing ${view} of ${format(selectedDate, "MMM d, yyyy")}`
                : "Select a date to view appointments."}
            </p>
          </DialogHeader>
          <div className="space-y-4">
            {isPending ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Loading appointments...
              </p>
            ) : appointments.length ? (
              <div className="space-y-3">
                {appointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="rounded-2xl border border-slate-200/80 bg-slate-50 p-4 text-sm dark:border-slate-800 dark:bg-slate-950"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white">
                          {appointment.client.firstName}{" "}
                          {appointment.client.lastName}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {appointment.clinic.name} ·{" "}
                          {format(new Date(appointment.setDay), "MMM d, yyyy")} ·{" "}
                          {appointment.setTime}
                        </p>
                      </div>
                      <span className="rounded-full bg-blue-600/10 px-3 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-500/20 dark:text-blue-200">
                        {appointment.status}
                      </span>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {canEdit ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditClick(appointment)}
                        >
                          Update
                        </Button>
                      ) : null}
                      {canDelete ? (
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-red-200 text-red-600 hover:bg-red-50"
                          onClick={() => handleDelete(appointment.id)}
                        >
                          Delete
                        </Button>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-500 dark:border-slate-800 dark:text-slate-400">
                <p>No appointments for this time-frame.</p>
                {canEdit ? (
                  <Button
                    className="mt-4 rounded-full bg-blue-600 text-white hover:bg-blue-700"
                    onClick={handleAddClick}
                  >
                    Add New Appointment
                  </Button>
                ) : null}
              </div>
            )}
          </div>
          <DialogFooter>
            {canEdit ? (
              <Button
                className="rounded-full bg-blue-600 text-white hover:bg-blue-700"
                onClick={handleAddClick}
              >
                Add appointment
              </Button>
            ) : null}
            <Button variant="outline" onClick={() => setListOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
