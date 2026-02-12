"use client";

import { addDays, addHours, startOfDay } from "date-fns";
import { CalendarDays } from "lucide-react";
import { useActionState, useEffect, useMemo, useState } from "react";
import { FieldError } from "@/components/form/field-error";
import { Form } from "@/components/form/form";
import { SubmitButton } from "@/components/form/submit-button";
import { EMPTY_ACTION_STATE } from "@/components/form/utils/to-action-state";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { bookAppointment } from "../actions/book-appointment";
import { operatingDayOptions, type OperatingDayValue } from "@/lib/operating-days";
import {
  buildTimeOptions,
  formatLocalDateKey,
  parseLocalDateKey,
  timeStringToMinutes,
} from "@/lib/time";

type ClinicOption = {
  id: string;
  name: string;
  operatingTimes: {
    openDay: OperatingDayValue;
    startTime: string;
    endTime: string;
  }[];
};

type DoctorOption = {
  id: string;
  firstName: string;
  lastName: string;
};

type AppointmentBookFormProps = {
  clinics: ClinicOption[];
  doctors: DoctorOption[];
};

const getMinTimeMinutes = (date: Date) => date.getHours() * 60 + date.getMinutes();

const AppointmentBookForm = ({ clinics, doctors }: AppointmentBookFormProps) => {
  const [clinicId, setClinicId] = useState(clinics[0]?.id ?? "");
  const [doctorId, setDoctorId] = useState("");
  const [openDay, setOpenDay] = useState<OperatingDayValue | "">("");
  const [appointmentDate, setAppointmentDate] = useState("");
  const [appointmentTime, setAppointmentTime] = useState("");
  const [dateOpen, setDateOpen] = useState(false);
  const minDateTime = useMemo(() => addHours(new Date(), 24), []);
  const minDateKey = useMemo(
    () => formatLocalDateKey(minDateTime),
    [minDateTime]
  );
  const minTimeMinutes = useMemo(
    () => getMinTimeMinutes(minDateTime),
    [minDateTime]
  );

  const doctorOptions = useMemo(() => doctors, [doctors]);
  const selectedClinic = useMemo(
    () => clinics.find((clinic) => clinic.id === clinicId) ?? null,
    [clinics, clinicId]
  );
  const openDayOptions = useMemo(() => {
    if (!selectedClinic) return [] as OperatingDayValue[];
    const unique = new Set(selectedClinic.operatingTimes.map((time) => time.openDay));
    return operatingDayOptions
      .map((day) => day.value)
      .filter((day) => unique.has(day));
  }, [selectedClinic]);

  const operatingTimesForDay = useMemo(() => {
    if (!selectedClinic || !openDay) return [] as ClinicOption["operatingTimes"];
    return selectedClinic.operatingTimes.filter((time) => time.openDay === openDay);
  }, [selectedClinic, openDay]);

  const timeOptions = useMemo(() => {
    if (!appointmentDate) return [];
    const options = buildTimeOptions(operatingTimesForDay);
    if (appointmentDate !== minDateKey) {
      return options;
    }
    return options.filter((time) => {
      const minutes = timeStringToMinutes(time);
      return minutes !== null && minutes >= minTimeMinutes;
    });
  }, [operatingTimesForDay, appointmentDate, minDateKey, minTimeMinutes]);

  useEffect(() => {
    if (!selectedClinic) return;
    if (openDayOptions.length && !openDayOptions.includes(openDay as OperatingDayValue)) {
      setOpenDay(openDayOptions[0] ?? "");
    }
    if (!openDayOptions.length) {
      setOpenDay("");
      setAppointmentDate("");
      setAppointmentTime("");
    }
  }, [selectedClinic, openDayOptions, openDay]);

  const selectedDate = useMemo(() => {
    if (!appointmentDate) return undefined;
    const parsed = parseLocalDateKey(appointmentDate);
    return Number.isNaN(parsed.getTime()) ? undefined : parsed;
  }, [appointmentDate]);

  const isDateAllowed = (date: Date, day: OperatingDayValue) => {
    if (!operatingTimesForDay.length) return false;
    const targetIndex =
      operatingDayOptions.find((option) => option.value === day)?.index ?? 0;
    if (date.getDay() !== targetIndex) return false;
    const dateKey = formatLocalDateKey(date);
    if (dateKey < minDateKey) return false;
    if (dateKey !== minDateKey) return true;
    return operatingTimesForDay.some((time) => {
      const end = timeStringToMinutes(time.endTime);
      if (end === null) return false;
      return end >= minTimeMinutes;
    });
  };

  const nextValidDate = useMemo(() => {
    if (!openDay || !operatingTimesForDay.length) return "";
    const targetIndex =
      operatingDayOptions.find((day) => day.value === openDay)?.index ?? 0;
    let cursor = startOfDay(minDateTime);
    let guard = 0;
    while (guard < 366) {
      if (cursor.getDay() === targetIndex) {
        const dateKey = formatLocalDateKey(cursor);
        if (dateKey !== minDateKey) {
          return dateKey;
        }
        const hasTime = operatingTimesForDay.some((time) => {
          const end = timeStringToMinutes(time.endTime);
          if (end === null) return false;
          return end >= minTimeMinutes;
        });
        if (hasTime) {
          return dateKey;
        }
      }
      cursor = addDays(cursor, 1);
      guard += 1;
    }
    return "";
  }, [openDay, operatingTimesForDay, minDateKey, minDateTime, minTimeMinutes]);

  const isSelectedDateValid = useMemo(() => {
    if (!openDay || !appointmentDate) return false;
    const currentDate = parseLocalDateKey(appointmentDate);
    if (Number.isNaN(currentDate.getTime())) return false;
    return isDateAllowed(currentDate, openDay as OperatingDayValue);
  }, [
    openDay,
    appointmentDate,
    operatingTimesForDay,
    minDateKey,
    minTimeMinutes,
  ]);

  useEffect(() => {
    if (!openDay) return;
    if (!nextValidDate) {
      if (appointmentDate) {
        setAppointmentDate("");
      }
      return;
    }
    if (!isSelectedDateValid && nextValidDate !== appointmentDate) {
      setAppointmentDate(nextValidDate);
    }
  }, [openDay, appointmentDate, nextValidDate, isSelectedDateValid]);

  useEffect(() => {
    if (!timeOptions.length) {
      setAppointmentTime("");
      return;
    }
    if (!timeOptions.includes(appointmentTime)) {
      setAppointmentTime(timeOptions[0] ?? "");
    }
  }, [timeOptions, appointmentTime]);

  const [actionState, action] = useActionState(
    bookAppointment,
    EMPTY_ACTION_STATE
  );

  return (
    <Form action={action} actionState={actionState}>
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="firstName">First name</Label>
          <Input id="firstName" name="firstName" placeholder="First name" required />
          <FieldError actionState={actionState} name="firstName" />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="lastName">Last name</Label>
          <Input id="lastName" name="lastName" placeholder="Last name" required />
          <FieldError actionState={actionState} name="lastName" />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" placeholder="you@email.com" required />
          <FieldError actionState={actionState} name="email" />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="telephone">Telephone</Label>
          <Input id="telephone" name="telephone" placeholder="(+234) 0800 000 0000" required />
          <FieldError actionState={actionState} name="telephone" />
        </div>
        <div className="grid gap-2 lg:col-span-2">
          <Label htmlFor="address">Address</Label>
          <Input id="address" name="address" placeholder="Street address" required />
          <FieldError actionState={actionState} name="address" />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="clinicId">Clinic</Label>
          <select
            id="clinicId"
            name="clinicId"
            value={clinicId}
            onChange={(event) => setClinicId(event.target.value)}
            className="h-11 rounded-md border border-input bg-white px-3 text-sm text-foreground"
            required
          >
            <option value="" disabled>
              Select a clinic
            </option>
            {clinics.map((clinic) => (
              <option key={clinic.id} value={clinic.id}>
                {clinic.name}
              </option>
            ))}
          </select>
          <FieldError actionState={actionState} name="clinicId" />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="openDay">Open day</Label>
          <select
            id="openDay"
            name="openDay"
            value={openDay}
            onChange={(event) => setOpenDay(event.target.value as OperatingDayValue)}
            className="h-11 rounded-md border border-input bg-white px-3 text-sm text-foreground"
            disabled={!openDayOptions.length}
            required
          >
            <option value="" disabled>
              Select open day
            </option>
            {openDayOptions.map((day) => (
              <option key={day} value={day}>
                {operatingDayOptions.find((option) => option.value === day)?.label ?? day}
              </option>
            ))}
          </select>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="doctorId">Preferred doctor (optional)</Label>
          <select
            id="doctorId"
            name="doctorId"
            value={doctorId}
            onChange={(event) => setDoctorId(event.target.value)}
            className="h-11 rounded-md border border-input bg-white px-3 text-sm text-foreground"
          >
            <option value="">No preference</option>
            {doctorOptions.map((doctor) => (
              <option key={doctor.id} value={doctor.id}>
                {doctor.firstName} {doctor.lastName}
              </option>
            ))}
          </select>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="setDay">Appointment date</Label>
          <Popover open={dateOpen} onOpenChange={setDateOpen}>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="outline"
                className="justify-start text-left font-normal"
                disabled={!openDay || !nextValidDate}
              >
                <CalendarDays className="mr-2 h-4 w-4" />
                {selectedDate
                  ? selectedDate.toLocaleDateString(undefined, {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  : "Select date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => {
                  if (!date) return;
                  const nextValue = formatLocalDateKey(date);
                  setAppointmentDate(nextValue);
                  setDateOpen(false);
                }}
                modifiers={{
                  available: (date) =>
                    Boolean(openDay) &&
                    isDateAllowed(date, openDay as OperatingDayValue),
                }}
                modifiersClassNames={{
                  available: "bg-blue-600/15 text-blue-700 hover:bg-blue-600/20",
                }}
                disabled={(date) => {
                  if (!openDay) return true;
                  return !isDateAllowed(date, openDay as OperatingDayValue);
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          <input type="hidden" name="setDay" value={appointmentDate} />
          {openDay && !nextValidDate ? (
            <p className="text-xs text-red-600">No valid dates are available.</p>
          ) : null}
          <FieldError actionState={actionState} name="setDay" />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="setTime">Appointment time</Label>
          <select
            id="setTime"
            name="setTime"
            value={appointmentTime}
            onChange={(event) => setAppointmentTime(event.target.value)}
            className="h-11 rounded-md border border-input bg-white px-3 text-sm text-foreground"
            required
            disabled={!timeOptions.length}
          >
            <option value="" disabled>
              Select time
            </option>
            {timeOptions.map((time) => (
              <option key={time} value={time}>
                {time}
              </option>
            ))}
          </select>
          <FieldError actionState={actionState} name="setTime" />
        </div>
      </div>

      <div className="pt-2">
        <SubmitButton label="Book Appointment" />
      </div>
    </Form>
  );
};

export { AppointmentBookForm };
