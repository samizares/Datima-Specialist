"use client";

import { useEffect, useState, useTransition, type FormEvent } from "react";
import Image from "next/image";
import { format } from "date-fns";
import { Pencil } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { UserFormFields } from "./user-form-fields";
import { updateUser } from "../actions/users";
import type { getUser } from "../queries/get-user";

type UserRecord = Awaited<ReturnType<typeof getUser>>;

type User = NonNullable<UserRecord>;

type UserFormValues = {
  username: string;
  fullName: string;
  email: string;
  password: string;
  emailVerified: string;
  role: string;
  attachmentId: string;
};

const defaultFormValues: UserFormValues = {
  username: "",
  fullName: "",
  email: "",
  password: "",
  emailVerified: "false",
  role: "none",
  attachmentId: "",
};

const getRoleLabel = (user: User) => {
  if (user.isAdmin && user.isSuperAdmin) return "Both";
  if (user.isSuperAdmin) return "Super Admin";
  if (user.isAdmin) return "Admin User";
  return "None";
};

const roleFromFlags = (isAdmin: boolean, isSuperAdmin: boolean) => {
  if (isAdmin && isSuperAdmin) return "both";
  if (isSuperAdmin) return "super";
  if (isAdmin) return "admin";
  return "none";
};

const flagsFromRole = (role: string) => {
  switch (role) {
    case "both":
      return { isAdmin: true, isSuperAdmin: true };
    case "super":
      return { isAdmin: false, isSuperAdmin: true };
    case "admin":
      return { isAdmin: true, isSuperAdmin: false };
    default:
      return { isAdmin: false, isSuperAdmin: false };
  }
};

export function UserProfileCard({
  user,
  canEdit,
  canAssignRoles,
}: {
  user: User;
  canEdit: boolean;
  canAssignRoles: boolean;
}) {
  const [profile, setProfile] = useState(user);
  const [formOpen, setFormOpen] = useState(false);
  const [formValues, setFormValues] = useState<UserFormValues>(defaultFormValues);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!formOpen) return;
    setFormValues({
      username: profile.username,
      fullName: profile.fullName,
      email: profile.email,
      password: "",
      emailVerified: String(profile.emailVerified),
      role: roleFromFlags(profile.isAdmin, profile.isSuperAdmin),
      attachmentId: profile.attachmentId ?? "",
    });
  }, [formOpen, profile]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    startTransition(async () => {
      const roleFlags = flagsFromRole(formValues.role);
      const payload = {
        username: formValues.username,
        fullName: formValues.fullName,
        email: formValues.email,
        password: formValues.password || undefined,
        emailVerified: formValues.emailVerified === "true",
        isAdmin: roleFlags.isAdmin,
        isSuperAdmin: roleFlags.isSuperAdmin,
        attachmentId: formValues.attachmentId || null,
      };
      const action = await updateUser(profile.id, payload);
      if (action.status === "ERROR") {
        toast.error(action.message || "Please check the form fields.");
        return;
      }
      setProfile((prev) => ({
        ...prev,
        username: payload.username,
        fullName: payload.fullName,
        email: payload.email,
        emailVerified: payload.emailVerified,
        isAdmin: payload.isAdmin,
        isSuperAdmin: payload.isSuperAdmin,
      }));
      toast.success(action.message || "User updated.");
      setFormOpen(false);
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">
            Profile
          </p>
          <h1 className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
            User profile
          </h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Review account details and adjust access permissions.
          </p>
        </div>
        {canEdit ? (
          <Button
            className="gap-2 rounded-full bg-blue-600 text-white hover:bg-blue-700"
            onClick={() => setFormOpen(true)}
          >
            <Pencil className="h-4 w-4" />
            Edit
          </Button>
        ) : null}
      </div>

      <Card className="rounded-3xl border-slate-200/80 shadow-sm dark:border-slate-800">
        <CardContent className="flex flex-wrap items-center gap-5 p-6">
          <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-950">
            <Image
              src="/assets/profile-placeholder.svg"
              alt="User avatar"
              width={48}
              height={48}
              className="h-12 w-12"
            />
          </div>
          <div className="flex-1">
            <h2 className="inline-flex w-fit rounded-lg bg-blue-600 px-3 py-2 text-xl font-semibold text-white">
              {profile.fullName}
            </h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              @{profile.username} · {profile.email}
            </p>
          </div>
          <Badge className="rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-200">
            {getRoleLabel(profile)}
          </Badge>
        </CardContent>
      </Card>

      <Card className="rounded-3xl border-slate-200/80 shadow-sm dark:border-slate-800">
        <CardHeader>
          <CardTitle className="text-lg text-slate-900 dark:text-white">
            Account information
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6 sm:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              Username
            </p>
            <p className="mt-2 text-sm font-medium text-slate-900 dark:text-white">
              {profile.username}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              Full name
            </p>
            <p className="mt-2 text-sm font-medium text-slate-900 dark:text-white">
              {profile.fullName}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              Email address
            </p>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              {profile.email}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              Verification
            </p>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              {profile.emailVerified ? "Verified" : "Not verified"}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              Role
            </p>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              {getRoleLabel(profile)}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              Created
            </p>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              {format(new Date(profile.createdAt), "MMM d, yyyy")}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              User ID
            </p>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              {profile.id}
            </p>
          </div>
        </CardContent>
      </Card>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-xl rounded-3xl border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          <DialogHeader>
            <DialogTitle className="inline-flex w-fit rounded-lg bg-blue-600 px-3 py-2 text-xl font-semibold text-white">
              Edit user
            </DialogTitle>
          </DialogHeader>
          <form className="mt-4 grid gap-4" onSubmit={handleSubmit}>
            <UserFormFields
              values={formValues}
              canAssignRoles={canAssignRoles}
              isEditing
              onChange={setFormValues}
            />
            <DialogFooter className="gap-2">
              <Button type="button" variant="outline" onClick={() => setFormOpen(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                className="rounded-full bg-blue-600 text-white hover:bg-blue-700"
                disabled={isPending}
              >
                Save changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
