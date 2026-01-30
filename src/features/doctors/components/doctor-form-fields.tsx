"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

type DoctorFormFieldsProps = {
  values: DoctorFormValues;
  clinics: ClinicOption[];
  onChange: (values: DoctorFormValues) => void;
};

export function DoctorFormFields({
  values,
  clinics,
  onChange,
}: DoctorFormFieldsProps) {
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
          required
        />
      </div>
      <div className="grid gap-2">
        <Label>Clinic assignment</Label>
        <Select
          value={values.clinicId}
          onValueChange={(value) =>
            onChange({ ...values, clinicId: value })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a clinic" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Unassigned</SelectItem>
            {clinics.map((clinic) => (
              <SelectItem key={clinic.id} value={clinic.id}>
                {clinic.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="attachmentId">Attachment ID</Label>
        <Input
          id="attachmentId"
          value={values.attachmentId}
          onChange={(event) =>
            onChange({ ...values, attachmentId: event.target.value })
          }
        />
      </div>
    </>
  );
}
