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

type UserFormValues = {
  username: string;
  email: string;
  password: string;
  emailVerified: string;
  isAdmin: string;
  isSuperAdmin: string;
};

type UserFormFieldsProps = {
  values: UserFormValues;
  canAssignRoles: boolean;
  isEditing: boolean;
  onChange: (values: UserFormValues) => void;
};

export function UserFormFields({
  values,
  canAssignRoles,
  isEditing,
  onChange,
}: UserFormFieldsProps) {
  return (
    <>
      <div className="grid gap-2">
        <Label htmlFor="username">Username</Label>
        <Input
          id="username"
          value={values.username}
          onChange={(event) =>
            onChange({ ...values, username: event.target.value })
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
        <Label htmlFor="password">
          Password {isEditing ? "(leave blank to keep)" : ""}
        </Label>
        <Input
          id="password"
          type="password"
          value={values.password}
          onChange={(event) =>
            onChange({ ...values, password: event.target.value })
          }
          required={!isEditing}
        />
      </div>
      <div className="grid gap-2">
        <Label>Email verified</Label>
        <Select
          value={values.emailVerified}
          onValueChange={(value) =>
            onChange({ ...values, emailVerified: value })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="true">Verified</SelectItem>
            <SelectItem value="false">Not verified</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="grid gap-2">
        <Label>Admin role</Label>
        <Select
          value={values.isAdmin}
          onValueChange={(value) => onChange({ ...values, isAdmin: value })}
          disabled={!canAssignRoles}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="true">Admin</SelectItem>
            <SelectItem value="false">Standard</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="grid gap-2">
        <Label>Super admin</Label>
        <Select
          value={values.isSuperAdmin}
          onValueChange={(value) => onChange({ ...values, isSuperAdmin: value })}
          disabled={!canAssignRoles}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="true">Super admin</SelectItem>
            <SelectItem value="false">Standard</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </>
  );
}
