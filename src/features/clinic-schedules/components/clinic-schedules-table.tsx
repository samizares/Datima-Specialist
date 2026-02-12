"use client";

import { useMemo, useState, useTransition, type FormEvent } from "react";
import { addDays, startOfDay } from "date-fns";
import { CalendarDays, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { useConfirmDialog } from "@/components/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  operatingDayOptions,
  getOperatingDayLabel,
  type OperatingDayValue,
} from "@/lib/operating-days";
import {
  buildEndTimeOptions,
  buildTimeOptions,
  formatLocalDateKey,
  parseLocalDateKey,
  timeStringToMinutes,
} from "@/lib/time";
import {
  createClinicSchedule,
  deleteClinicSchedule,
} from "../actions/clinic-schedules";
import { getClinicSchedules } from "../queries/get-clinic-schedules";

type ClinicScheduleRecord = Awaited<ReturnType<typeof getClinicSchedules>>[number];

type DoctorOption = {
  id: string;
  firstName: string;
  lastName: string;
  email?: string | null;
};

type OperatingTimeOption = {
  openDay: OperatingDayValue;
  startTime: string;
  endTime: string;
};

type ClinicOption = {
  id: string;
  name: string;
  operatingTimes: OperatingTimeOption[];
};

type ScheduleFormValues = {
  clinicId: string;
  doctorId: string;
  openDay: OperatingDayValue | "";
  date: string;
  startShift: string;
  endShift: string;
};

const defaultFormValues: ScheduleFormValues = {
  clinicId: "",
  doctorId: "",
  openDay: "",
  date: "",
  startShift: "",
  endShift: "",
};

const formatDateLabel = (value: string) =>
  parseLocalDateKey(value).toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });


const isWindowCovered = (
  windowStart: number,
  windowEnd: number,
  intervals: Array<{ start: number; end: number }>
) => {
  const sorted = intervals
    .filter((interval) => interval.end > windowStart && interval.start < windowEnd)
    .map((interval) => ({
      start: Math.max(interval.start, windowStart),
      end: Math.min(interval.end, windowEnd),
    }))
    .sort((a, b) => a.start - b.start);

  let cursor = windowStart;
  for (const interval of sorted) {
    if (interval.start > cursor) {
      return false;
    }
    cursor = Math.max(cursor, interval.end);
    if (cursor >= windowEnd) {
      return true;
    }
  }
  return cursor >= windowEnd;
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
      const result = await deleteClinicSchedule(scheduleId);
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

export function ClinicSchedulesTable({
  initialSchedules,
  doctors,
  clinics,
  canEdit,
  canDelete,
}: {
  initialSchedules: ClinicScheduleRecord[];
  doctors: DoctorOption[];
  clinics: ClinicOption[];
  canEdit: boolean;
  canDelete: boolean;
}) {
  const [schedules, setSchedules] = useState<ClinicScheduleRecord[]>(initialSchedules);
  const [formOpen, setFormOpen] = useState(false);
  const [formValues, setFormValues] = useState<ScheduleFormValues>(defaultFormValues);
  const [dateOpen, setDateOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [isPending, startTransition] = useTransition();

  const isFormIncomplete =
    !formValues.clinicId ||
    !formValues.doctorId ||
    !formValues.openDay ||
    !formValues.date ||
    !formValues.startShift ||
    !formValues.endShift;

  const loadSchedules = () => {
    startTransition(async () => {
      const data = await getClinicSchedules();
      setSchedules(data);
    });
  };

  const filteredSchedules = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return schedules;
    return schedules.filter((schedule) => {
      const doctorName = `${schedule.doctor.firstName} ${schedule.doctor.lastName}`.toLowerCase();
      const clinicName = schedule.clinic.name.toLowerCase();
      return doctorName.includes(term) || clinicName.includes(term);
    });
  }, [schedules, search]);

  const selectedClinic = useMemo(
    () => clinics.find((clinic) => clinic.id === formValues.clinicId) ?? null,
    [clinics, formValues.clinicId]
  );

  const openDayOptions = useMemo(() => {
    if (!selectedClinic) return [] as OperatingDayValue[];
    const unique = new Set(selectedClinic.operatingTimes.map((time) => time.openDay));
    return operatingDayOptions
      .map((day) => day.value)
      .filter((day) => unique.has(day));
  }, [selectedClinic]);

  const operatingTimesForDay = useMemo(() => {
    if (!selectedClinic || !formValues.openDay) return [] as OperatingTimeOption[];
    return selectedClinic.operatingTimes.filter(
      (time) => time.openDay === formValues.openDay
    );
  }, [selectedClinic, formValues.openDay]);

  const isDateFullyBooked = (
    clinic: ClinicOption | null,
    openDay: OperatingDayValue,
    dateValue: string
  ) => {
    if (!clinic) return false;
    const windows = clinic.operatingTimes
      .filter((time) => time.openDay === openDay)
      .map((time) => {
        const start = timeStringToMinutes(time.startTime);
        const end = timeStringToMinutes(time.endTime);
        if (start === null || end === null) return null;
        return { start, end };
      })
      .filter((window): window is { start: number; end: number } => Boolean(window));

    if (!windows.length) return false;

    const intervals = schedules
      .filter(
        (schedule) =>
          schedule.clinic.id === clinic.id &&
          formatLocalDateKey(schedule.date) === dateValue
      )
      .map((schedule) => {
        const start = timeStringToMinutes(schedule.startShift);
        const end = timeStringToMinutes(schedule.endShift);
        if (start === null || end === null) return null;
        return { start, end };
      })
      .filter(
        (interval): interval is { start: number; end: number } => Boolean(interval)
      );

    if (!intervals.length) return false;

    return windows.every((window) => isWindowCovered(window.start, window.end, intervals));
  };

  const getNextAvailableDate = (
    clinic: ClinicOption | null,
    openDay: OperatingDayValue
  ) => {
    const targetIndex =
      operatingDayOptions.find((day) => day.value === openDay)?.index ?? 0;
    let cursor = startOfDay(new Date());
    let guard = 0;
    while (guard < 366) {
      if (cursor.getDay() === targetIndex) {
        const dateKey = formatLocalDateKey(cursor);
        if (!clinic) {
          return dateKey;
        }
        if (!isDateFullyBooked(clinic, openDay, dateKey)) {
          return dateKey;
        }
      }
      cursor = addDays(cursor, 1);
      guard += 1;
    }
    return "";
  };

  const selectedFormDate = useMemo(() => {
    if (!formValues.date) return undefined;
    const parsed = parseLocalDateKey(formValues.date);
    return Number.isNaN(parsed.getTime()) ? undefined : parsed;
  }, [formValues.date]);

  const isDateDisabled = (date: Date) => {
    if (!selectedClinic || !formValues.openDay) return true;
    const targetIndex =
      operatingDayOptions.find((day) => day.value === formValues.openDay)?.index ?? 0;
    if (date < startOfDay(new Date())) return true;
    if (date.getDay() !== targetIndex) return true;
    const dateKey = formatLocalDateKey(date);
    return isDateFullyBooked(
      selectedClinic,
      formValues.openDay as OperatingDayValue,
      dateKey
    );
  };

  const startShiftOptions = useMemo(
    () => buildTimeOptions(operatingTimesForDay),
    [operatingTimesForDay]
  );

  const endShiftOptions = useMemo(
    () => buildEndTimeOptions(formValues.startShift, operatingTimesForDay),
    [formValues.startShift, operatingTimesForDay]
  );

  const handleClinicChange = (value: string) => {
    const clinic = clinics.find((item) => item.id === value) ?? null;
    const openDays = clinic
      ? operatingDayOptions
          .map((day) => day.value)
          .filter((day) =>
            clinic.operatingTimes.some((time) => time.openDay === day)
          )
      : [];
    const nextOpenDay = openDays[0] ?? "";
    const nextDate =
      clinic && nextOpenDay
        ? getNextAvailableDate(clinic, nextOpenDay as OperatingDayValue)
        : "";
    const times = clinic && nextOpenDay
      ? buildTimeOptions(
          clinic.operatingTimes.filter((time) => time.openDay === nextOpenDay)
        )
      : [];
    const nextStartShift = times[0] ?? "";
    const nextEndShift = nextStartShift
      ? buildEndTimeOptions(
          nextStartShift,
          clinic?.operatingTimes.filter((time) => time.openDay === nextOpenDay) ?? []
        )[0] ?? ""
      : "";

    setFormValues((prev) => ({
      ...prev,
      clinicId: value,
      openDay: nextOpenDay,
      date: nextDate,
      startShift: nextStartShift,
      endShift: nextEndShift,
    }));
  };

  const handleOpenDayChange = (value: OperatingDayValue) => {
    const nextDate =
      selectedClinic && value
        ? getNextAvailableDate(selectedClinic, value)
        : "";
    const times = selectedClinic
      ? buildTimeOptions(
          selectedClinic.operatingTimes.filter((time) => time.openDay === value)
        )
      : [];
    const nextStartShift = times[0] ?? "";
    const nextEndShift = nextStartShift
      ? buildEndTimeOptions(
          nextStartShift,
          selectedClinic?.operatingTimes.filter((time) => time.openDay === value) ?? []
        )[0] ?? ""
      : "";

    setFormValues((prev) => ({
      ...prev,
      openDay: value,
      date: nextDate,
      startShift: nextStartShift,
      endShift: nextEndShift,
    }));
  };

  const handleStartShiftChange = (value: string) => {
    const nextEndShift =
      buildEndTimeOptions(value, operatingTimesForDay)[0] ?? "";
    setFormValues((prev) => ({
      ...prev,
      startShift: value,
      endShift: nextEndShift,
    }));
  };

  const openForm = () => {
    if (!canEdit) return;
    if (!clinics.length || !doctors.length) {
      toast.error("Please add clinics and doctors before scheduling.");
      return;
    }
    const clinic = clinics[0] ?? null;
    const doctor = doctors[0] ?? null;
    const openDays = clinic
      ? operatingDayOptions
          .map((day) => day.value)
          .filter((day) =>
            clinic.operatingTimes.some((time) => time.openDay === day)
          )
      : [];
    const nextOpenDay = openDays[0] ?? "";
    const nextDate =
      clinic && nextOpenDay
        ? getNextAvailableDate(clinic, nextOpenDay as OperatingDayValue)
        : "";
    const times =
      clinic && nextOpenDay
        ? buildTimeOptions(
            clinic.operatingTimes.filter((time) => time.openDay === nextOpenDay)
          )
        : [];
    const nextStartShift = times[0] ?? "";
    const nextEndShift = nextStartShift
      ? buildEndTimeOptions(
          nextStartShift,
          clinic?.operatingTimes.filter((time) => time.openDay === nextOpenDay) ?? []
        )[0] ?? ""
      : "";
    setFormValues({
      clinicId: clinic?.id ?? "",
      doctorId: doctor?.id ?? "",
      openDay: nextOpenDay,
      date: nextDate,
      startShift: nextStartShift,
      endShift: nextEndShift,
    });
    setFormOpen(true);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    startTransition(async () => {
      const action = await createClinicSchedule({
        clinicId: formValues.clinicId,
        doctorId: formValues.doctorId,
        openDay: formValues.openDay as OperatingDayValue,
        date: formValues.date,
        startShift: formValues.startShift,
        endShift: formValues.endShift,
      });
      if (action.status === "ERROR") {
        toast.error(action.message || "Please check the form fields.");
        return;
      }
      const schedule = action.data?.schedule;
      if (schedule) {
        setSchedules((prev) => [schedule as ClinicScheduleRecord, ...prev]);
      }
      toast.success(action.message || "Schedule created.");
      setFormOpen(false);
      setFormValues(defaultFormValues);
      loadSchedules();
    });
  };

  return (
    <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">
            Clinics Schedule
          </p>
          <h1 className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
            Schedule doctor shifts
          </h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Assign doctors to clinic operating hours without overlap.
          </p>
        </div>
        {canEdit ? (
          <Button
            className="rounded-full bg-blue-600 text-white hover:bg-blue-700"
            onClick={openForm}
          >
            Schedule Doctor
          </Button>
        ) : null}
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-950">
        <div className="relative w-full max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Search clinic or doctor..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="h-10 rounded-full border-slate-200 bg-white pl-9 text-sm text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
          />
        </div>
      </div>

      <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200/70 dark:border-slate-800">
        <Table>
          <TableHeader className="bg-white text-xs font-semibold uppercase tracking-[0.12em] text-slate-400 dark:bg-slate-900 dark:text-slate-500">
            <TableRow className="border-slate-200/70 dark:border-slate-800">
              <TableHead>Clinic</TableHead>
              <TableHead>Doctor</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Shift</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSchedules.length ? (
              filteredSchedules.map((schedule) => (
                <TableRow
                  key={schedule.id}
                  className="border-slate-100 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-950"
                >
                  <TableCell className="font-semibold text-slate-900 dark:text-white">
                    {schedule.clinic.name}
                  </TableCell>
                  <TableCell className="text-slate-500 dark:text-slate-400">
                    {schedule.doctor.firstName} {schedule.doctor.lastName}
                  </TableCell>
                  <TableCell className="text-slate-500 dark:text-slate-400">
                    {formatDateLabel(formatLocalDateKey(schedule.date))}
                  </TableCell>
                  <TableCell className="text-slate-500 dark:text-slate-400">
                    {schedule.startShift} - {schedule.endShift}
                  </TableCell>
                  <TableCell className="text-right">
                    {canDelete ? (
                      <DeleteScheduleButton
                        scheduleId={schedule.id}
                        disabled={isPending}
                        onDeleted={loadSchedules}
                      />
                    ) : null}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="py-10 text-center text-sm text-slate-500">
                  No schedules found.
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
              Schedule doctor
            </DialogTitle>
          </DialogHeader>
          <form className="mt-4 grid gap-4" onSubmit={handleSubmit}>
            <div className="grid gap-2">
              <Label>Clinic</Label>
              <Select value={formValues.clinicId} onValueChange={handleClinicChange}>
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
              <Label>Open day</Label>
              {openDayOptions.length ? (
                <Select
                  value={formValues.openDay}
                  onValueChange={(value) =>
                    handleOpenDayChange(value as OperatingDayValue)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select open day" />
                  </SelectTrigger>
                  <SelectContent>
                    {openDayOptions.map((day) => (
                      <SelectItem key={day} value={day}>
                        {getOperatingDayLabel(day)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="rounded-md border border-dashed border-slate-200 px-3 py-2 text-sm text-slate-500">
                  No open days
                </div>
              )}
            </div>
            <div className="grid gap-2">
              <Label>Date</Label>
              <Popover open={dateOpen} onOpenChange={setDateOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="justify-start text-left font-normal"
                    disabled={!formValues.openDay || !selectedClinic}
                  >
                    <CalendarDays className="mr-2 h-4 w-4" />
                    {selectedFormDate
                      ? formatDateLabel(formatLocalDateKey(selectedFormDate))
                      : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedFormDate}
                    onSelect={(date) => {
                      if (!date) return;
                      const nextValue = formatLocalDateKey(date);
                      setFormValues((prev) => ({ ...prev, date: nextValue }));
                      setDateOpen(false);
                    }}
                    disabled={isDateDisabled}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="grid gap-2">
              <Label>Start shift</Label>
              <Select
                value={formValues.startShift}
                onValueChange={handleStartShiftChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select start shift" />
                </SelectTrigger>
                <SelectContent>
                  {startShiftOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>End shift</Label>
              <Select
                value={formValues.endShift}
                onValueChange={(value) =>
                  setFormValues((prev) => ({ ...prev, endShift: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select end shift" />
                </SelectTrigger>
                <SelectContent>
                  {endShiftOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
                disabled={isPending || isFormIncomplete}
              >
                Create Schedule
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
