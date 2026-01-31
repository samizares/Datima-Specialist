"use client";

import type { Dispatch, SetStateAction } from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ClientStatus } from "@prisma/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type ClientFormValues = {
  firstName: string;
  lastName: string;
  email: string;
  telephone: string;
  address: string;
  status: ClientStatus;
  attachmentId: string;
};

type ClientFormFieldsProps = {
  values: ClientFormValues;
  onChange: Dispatch<SetStateAction<ClientFormValues>>;
};

export function ClientFormFields({ values, onChange }: ClientFormFieldsProps) {
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
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="telephone">Telephone</Label>
        <Input
          id="telephone"
          value={values.telephone}
          onChange={(event) =>
            onChange({ ...values, telephone: event.target.value })
          }
          required
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="address">Address</Label>
        <Input
          id="address"
          value={values.address}
          onChange={(event) =>
            onChange({ ...values, address: event.target.value })
          }
          required
        />
      </div>
      <div className="grid gap-2">
        <Label>Status</Label>
        <Select
          value={values.status}
          onValueChange={(value) =>
            onChange({ ...values, status: value as ClientStatus })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="PROSPECT">Prospect</SelectItem>
            <SelectItem value="PATIENT">Patient</SelectItem>
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
          required
        />
      </div>
    </>
  );
}
