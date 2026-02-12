"use client";

import { useEffect, useState, useTransition, type FormEvent } from "react";
import Image from "next/image";
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
import { DoctorFormFields } from "./doctor-form-fields";
import { updateDoctor } from "../actions/doctors";
import type { getDoctor } from "../queries/get-doctor";

type DoctorRecord = Awaited<ReturnType<typeof getDoctor>>;

type Doctor = NonNullable<DoctorRecord>;

type DoctorFormValues = {
  firstName: string;
  lastName: string;
  email: string;
  attachmentId: string;
};

const defaultFormValues: DoctorFormValues = {
  firstName: "",
  lastName: "",
  email: "",
  attachmentId: "",
};

export function DoctorProfileCard({
  doctor,
  canEdit,
}: {
  doctor: Doctor;
  canEdit: boolean;
}) {
  const [profile, setProfile] = useState(doctor);
  const [formOpen, setFormOpen] = useState(false);
  const [formValues, setFormValues] = useState<DoctorFormValues>(defaultFormValues);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!formOpen) return;
    setFormValues({
      firstName: profile.firstName,
      lastName: profile.lastName,
      email: profile.email,
      attachmentId: profile.attachmentId ?? "",
    });
  }, [formOpen, profile]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    startTransition(async () => {
      const payload = {
        ...formValues,
        attachmentId: formValues.attachmentId || null,
      };
      const action = await updateDoctor(profile.id, payload);
      if (action.status === "ERROR") {
        toast.error(action.message || "Please check the form fields.");
        return;
      }
      setProfile((prev) => ({
        ...prev,
        firstName: formValues.firstName,
        lastName: formValues.lastName,
        email: formValues.email,
        attachmentId: formValues.attachmentId || null,
      }));
      toast.success(action.message || "Doctor updated.");
      setFormOpen(false);
    });
  };

  const clinicLabels = profile.clinics.length
    ? Array.from(
        new Set(
          profile.clinics
            .map((schedule) => schedule.clinic?.name ?? null)
            .filter((value): value is string => Boolean(value))
        )
      ).join(", ")
    : "Unassigned";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">
            Profile
          </p>
          <h1 className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
            Doctor profile
          </h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Review specialist details and update clinic assignments.
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
              alt="Doctor avatar"
              width={48}
              height={48}
              className="h-12 w-12"
            />
          </div>
          <div className="flex-1">
            <h2 className="inline-flex w-fit rounded-lg bg-blue-600 px-3 py-2 text-xl font-semibold text-white">
              Dr. {profile.firstName} {profile.lastName}
            </h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {clinicLabels}
            </p>
          </div>
          <Badge className="rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-200">
            {clinicLabels}
          </Badge>
        </CardContent>
      </Card>

      <Card className="rounded-3xl border-slate-200/80 shadow-sm dark:border-slate-800">
        <CardHeader>
          <CardTitle className="text-lg text-slate-900 dark:text-white">
            Professional information
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6 sm:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              First name
            </p>
            <p className="mt-2 text-sm font-medium text-slate-900 dark:text-white">
              {profile.firstName}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              Last name
            </p>
            <p className="mt-2 text-sm font-medium text-slate-900 dark:text-white">
              {profile.lastName}
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
              Clinics
            </p>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              {clinicLabels}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              Attachment ID
            </p>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              {profile.attachmentId ?? "Not provided"}
            </p>
          </div>
        </CardContent>
      </Card>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-xl rounded-3xl border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          <DialogHeader>
            <DialogTitle className="inline-flex w-fit rounded-lg bg-blue-600 px-3 py-2 text-xl font-semibold text-white">
              Edit doctor
            </DialogTitle>
          </DialogHeader>
          <form className="mt-4 grid gap-4" onSubmit={handleSubmit}>
            <DoctorFormFields
              values={formValues}
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
