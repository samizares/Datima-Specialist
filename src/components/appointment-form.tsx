"use client";

import { CalendarDays, ChevronDown, Clock3, PhoneCall } from "lucide-react";
import { useActionState, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

import { Form } from "@/components/form/form";
import { EMPTY_ACTION_STATE } from "@/components/form/utils/to-action-state";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { bookAppointment } from "@/features/appointment/actions/book-appointment";

type ClinicOption = {
  id: string;
  name: string;
};

type AppointmentFormProps = {
  clinics: ClinicOption[];
};

export function AppointmentForm({ clinics }: AppointmentFormProps) {
  const searchParams = useSearchParams();
  const defaultService = useMemo(() => {
    const requested = searchParams.get("service");
    const matched = clinics.find(
      (service) => service.name.toLowerCase() === requested?.toLowerCase()
    );
    return matched?.id ?? clinics[0]?.id ?? "";
  }, [clinics, searchParams]);

  const [clinicId, setClinicId] = useState(defaultService);
  const [doctorId, setDoctorId] = useState("");
  const [appointmentDate, setAppointmentDate] = useState("");
  const [appointmentTime, setAppointmentTime] = useState("");

  const truncateLabel = (value: string, max = 28) =>
    value.length > max ? `${value.slice(0, max - 1)}…` : value;
  const [actionState, action] = useActionState(
    bookAppointment,
    EMPTY_ACTION_STATE
  );

  return (
    <Form
      action={action}
      actionState={actionState}
      className="gap-6 rounded-3xl border border-sky-100 bg-[#eef7fb] p-6 shadow-xl md:p-8"
    >
      <div className="text-center">
        <h3 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-foreground sm:text-3xl dark:text-black">
          Book an appointment
        </h3>
        <p className="mt-2 text-sm text-muted-foreground sm:text-base dark:text-black">
          Reserve your visit with our specialists today
        </p>
      </div>

      <div className="grid gap-6">
        <div className="grid gap-6 md:grid-cols-2 md:gap-x-8">
          <div className="group relative" data-filled={Boolean(appointmentDate)}>
            <Input
              id="firstName"
              name="firstName"
              placeholder="Name"
              required
              className="peer h-14 rounded-2xl border-2 border-transparent bg-[#e5f6fb] px-4 text-base transition focus-visible:ring-0 placeholder:text-transparent group-hover:border-primary group-hover:bg-white group-hover:ring-2 group-hover:ring-primary/20 group-focus-within:border-primary group-focus-within:bg-white group-focus-within:ring-2 group-focus-within:ring-primary/20"
            />
            <Label
              htmlFor="firstName"
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-slate-500 transition-all duration-200 group-hover:top-2 group-hover:text-xs group-hover:text-primary group-focus-within:top-2 group-focus-within:text-xs group-focus-within:text-primary peer-focus:top-2 peer-focus:text-xs peer-focus:text-primary peer-[&:not(:placeholder-shown)]:top-2 peer-[&:not(:placeholder-shown)]:text-xs peer-[&:not(:placeholder-shown)]:text-primary"
            >
              First Name
            </Label>
          </div>
          <div className="group relative" data-filled={Boolean(appointmentDate)}>
            <Input
              id="lastName"
              name="lastName"
              placeholder="Last Name"
              required
              className="peer h-14 rounded-2xl border-2 border-transparent bg-[#e5f6fb] px-4 text-base transition focus-visible:ring-0 placeholder:text-transparent group-hover:border-primary group-hover:bg-white group-hover:ring-2 group-hover:ring-primary/20 group-focus-within:border-primary group-focus-within:bg-white group-focus-within:ring-2 group-focus-within:ring-primary/20"
            />
            <Label
              htmlFor="lastName"
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-slate-500 transition-all duration-200 group-hover:top-2 group-hover:text-xs group-hover:text-primary group-focus-within:top-2 group-focus-within:text-xs group-focus-within:text-primary peer-focus:top-2 peer-focus:text-xs peer-focus:text-primary peer-[&:not(:placeholder-shown)]:top-2 peer-[&:not(:placeholder-shown)]:text-xs peer-[&:not(:placeholder-shown)]:text-primary"
            >
              Last Name
            </Label>
          </div>
        
        </div>

        <div className="grid gap-6 md:grid-cols-2 md:gap-x-8">
          <div className="group relative" data-filled={Boolean(appointmentDate)}>
            <Input
              id="email"
              name="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder="Email"
              required
              className="peer h-14 rounded-2xl border-2 border-transparent bg-[#e5f6fb] px-4 text-base transition focus-visible:ring-0 placeholder:text-transparent group-hover:border-primary group-hover:bg-white group-hover:ring-2 group-hover:ring-primary/20 group-focus-within:border-primary group-focus-within:bg-white group-focus-within:ring-2 group-focus-within:ring-primary/20"
            />
            <Label
              htmlFor="email"
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-slate-500 transition-all duration-200 group-hover:top-2 group-hover:text-xs group-hover:text-primary group-focus-within:top-2 group-focus-within:text-xs group-focus-within:text-primary peer-focus:top-2 peer-focus:text-xs peer-focus:text-primary peer-[&:not(:placeholder-shown)]:top-2 peer-[&:not(:placeholder-shown)]:text-xs peer-[&:not(:placeholder-shown)]:text-primary"
            >
              Email
            </Label>
          </div>
          <div
            className="group relative"
            data-filled={Boolean(clinicId)}
          >
            <Label
              htmlFor="clinicId"
              className="pointer-events-none absolute left-4 top-1/2 max-w-[calc(100%-3.5rem)] -translate-y-1/2 truncate whitespace-nowrap text-sm text-slate-500 opacity-0 transition-all duration-200 group-hover:opacity-100 group-hover:top-2 group-hover:text-xs group-hover:text-primary group-focus-within:opacity-100 group-focus-within:top-2 group-focus-within:text-xs group-focus-within:text-primary group-data-[filled=true]:opacity-100 group-data-[filled=true]:top-2 group-data-[filled=true]:text-xs group-data-[filled=true]:text-primary"
            >
              Choose clinics
            </Label>
            <select
              id="clinicId"
              name="clinicId"
              value={clinicId}
              onChange={(event) => setClinicId(event.target.value)}
              className="h-14 w-full max-w-full appearance-none truncate rounded-2xl border-2 border-transparent bg-[#e5f6fb] px-4 pr-12 text-sm text-slate-700 transition focus-visible:outline-none focus-visible:ring-0 group-hover:border-primary group-hover:bg-white group-hover:ring-2 group-hover:ring-primary/20 group-focus-within:border-primary group-focus-within:bg-white group-focus-within:ring-2 group-focus-within:ring-primary/20 sm:text-base"
              required
            >
              <option value="" disabled>
                Choose clinics
              </option>
              {clinics.map((clinic) => (
                <option key={clinic.id} value={clinic.id}>
                  {truncateLabel(clinic.name)}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3 md:gap-x-8">
          <div className="group relative">
            <Input
              id="telephone"
              name="telephone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder="Phone"
              required
              className="peer h-14 rounded-2xl border-2 border-transparent bg-[#e5f6fb] px-4 text-base transition focus-visible:ring-0 placeholder:text-transparent group-hover:border-primary group-hover:bg-white group-hover:ring-2 group-hover:ring-primary/20 group-focus-within:border-primary group-focus-within:bg-white group-focus-within:ring-2 group-focus-within:ring-primary/20"
            />
            <Label
              htmlFor="telephone"
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-slate-500 transition-all duration-200 group-hover:top-2 group-hover:text-xs group-hover:text-primary group-focus-within:top-2 group-focus-within:text-xs group-focus-within:text-primary peer-focus:top-2 peer-focus:text-xs peer-focus:text-primary peer-[&:not(:placeholder-shown)]:top-2 peer-[&:not(:placeholder-shown)]:text-xs peer-[&:not(:placeholder-shown)]:text-primary"
            >
              Phone
            </Label>
          </div>
          <div className="group relative" data-filled={Boolean(appointmentDate)}>
            <Label
              htmlFor="setDay"
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 px-2 text-sm text-slate-500 opacity-0 transition-all duration-200 group-hover:opacity-100 group-hover:top-2 group-hover:text-xs group-hover:text-primary group-focus-within:opacity-100 group-focus-within:top-2 group-focus-within:text-xs group-focus-within:text-primary group-data-[filled=true]:opacity-100 group-data-[filled=true]:top-2 group-data-[filled=true]:text-xs group-data-[filled=true]:text-primary"
            >
              Select Date
            </Label>
            <CalendarDays className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <Input
              id="setDay"
              name="setDay"
              type="date"
              required
              onChange={(event) => setAppointmentDate(event.target.value)}
              className="h-14 rounded-2xl border-2 border-transparent bg-[#e5f6fb] px-4 text-base transition focus-visible:ring-0 group-hover:border-primary group-hover:bg-white group-hover:ring-2 group-hover:ring-primary/20 group-focus-within:border-primary group-focus-within:bg-white group-focus-within:ring-2 group-focus-within:ring-primary/20"
            />
          </div>
          <div className="group relative" data-filled={Boolean(appointmentTime)}>
            <Label
              htmlFor="setTime"
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 px-2 text-sm text-slate-500 opacity-0 transition-all duration-200 group-hover:opacity-100 group-hover:top-2 group-hover:text-xs group-hover:text-primary group-focus-within:opacity-100 group-focus-within:top-2 group-focus-within:text-xs group-focus-within:text-primary group-data-[filled=true]:opacity-100 group-data-[filled=true]:top-2 group-data-[filled=true]:text-xs group-data-[filled=true]:text-primary"
            >
              Select Time
            </Label>
            <Clock3 className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <Input
              id="setTime"
              name="setTime"
              type="time"
              required
              onChange={(event) => setAppointmentTime(event.target.value)}
              className="h-14 rounded-2xl border-2 border-transparent bg-[#e5f6fb] px-4 text-base transition focus-visible:ring-0 group-hover:border-primary group-hover:bg-white group-hover:ring-2 group-hover:ring-primary/20 group-focus-within:border-primary group-focus-within:bg-white group-focus-within:ring-2 group-focus-within:ring-primary/20"
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4 pt-2">
        <div className="flex items-center justify-center gap-3 text-sm text-muted-foreground">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
            <PhoneCall className="h-4 w-4" aria-hidden />
          </span>
          <div className="text-left">
            <p className="font-semibold text-foreground dark:text-black">Need concierge scheduling?</p>
            <p className="dark:text-black">Call us and we will coordinate specialists for you.</p>
          </div>
        </div>
        <button
          type="submit"
          className="h-12 w-full rounded-2xl bg-[#283a6a] text-sm font-semibold uppercase tracking-[0.2em] text-white shadow-lg transition hover:bg-[#1f2f59]"
        >
          Make Appointment
        </button>
      </div>
    </Form>
  );
}
