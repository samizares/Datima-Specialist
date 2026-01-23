"use client";

import { useActionState, useMemo, useState } from "react";
import { FieldError } from "@/components/form/field-error";
import { Form } from "@/components/form/form";
import { SubmitButton } from "@/components/form/submit-button";
import { EMPTY_ACTION_STATE } from "@/components/form/utils/to-action-state";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { bookAppointment } from "../actions/book-appointment";

type ClinicOption = {
  id: string;
  name: string;
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

const AppointmentBookForm = ({ clinics, doctors }: AppointmentBookFormProps) => {
  const [clinicId, setClinicId] = useState(clinics[0]?.id ?? "");
  const [doctorId, setDoctorId] = useState("");

  const doctorOptions = useMemo(() => doctors, [doctors]);

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
        <div className="grid gap-2 lg:col-span-2">
          <Label htmlFor="setTime">Appointment time</Label>
          <Input id="setTime" name="setTime" type="datetime-local" required />
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
