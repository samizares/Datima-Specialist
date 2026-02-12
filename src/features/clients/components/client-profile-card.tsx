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
import { ClientFormFields, type ClientFormValues } from "./client-form-fields";
import { updateClient } from "../actions/clients";
import type { getClient } from "../queries/get-client";
import { attachmentDownloadPath } from "@/paths";

const STATUS_LABELS: Record<string, string> = {
  PROSPECT: "Prospect",
  PATIENT: "Patient",
};

type ClientRecord = Awaited<ReturnType<typeof getClient>>;

type Client = NonNullable<ClientRecord>;

const defaultFormValues: ClientFormValues = {
  firstName: "",
  lastName: "",
  email: "",
  telephone: "",
  address: "",
  status: "PROSPECT",
  attachmentId: "",
};

export function ClientProfileCard({
  client,
  canEdit,
}: {
  client: Client;
  canEdit: boolean;
}) {
  const [profile, setProfile] = useState(client);
  const [formOpen, setFormOpen] = useState(false);
  const [formValues, setFormValues] = useState<ClientFormValues>(defaultFormValues);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!formOpen) return;
    setFormValues({
      firstName: profile.firstName,
      lastName: profile.lastName,
      email: profile.email ?? "",
      telephone: profile.telephone,
      address: profile.address,
      status: profile.status,
      attachmentId: profile.attachmentId ?? "",
    });
  }, [formOpen, profile]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    startTransition(async () => {
      const action = await updateClient(profile.id, {
        ...formValues,
        email: formValues.email || null,
      });
      if (action.status === "ERROR") {
        toast.error(action.message || "Please check the form fields.");
        return;
      }
      toast.success(action.message || "Client updated.");
      setProfile((prev) => ({
        ...prev,
        ...formValues,
        email: formValues.email || null,
      }));
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
            Client profile
          </h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Review client details and update their information.
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
              src={
                profile.attachmentId
                  ? attachmentDownloadPath(profile.attachmentId)
                  : "/assets/profile-placeholder.svg"
              }
              alt="Client avatar"
              width={48}
              height={48}
              className="h-12 w-12 object-cover"
            />
          </div>
          <div className="flex-1">
            <h2 className="inline-flex w-fit rounded-lg bg-blue-600 px-3 py-2 text-xl font-semibold text-white">
              {profile.firstName} {profile.lastName}
            </h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {profile.address}
            </p>
          </div>
          <Badge className="rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-200">
            {STATUS_LABELS[profile.status] ?? profile.status}
          </Badge>
        </CardContent>
      </Card>

      <Card className="rounded-3xl border-slate-200/80 shadow-sm dark:border-slate-800">
        <CardHeader>
          <CardTitle className="text-lg text-slate-900 dark:text-white">
            Personal information
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
              {profile.email ?? "Not provided"}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              Phone
            </p>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              {profile.telephone}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              Address
            </p>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              {profile.address}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              Attachment ID
            </p>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              {profile.attachmentId}
            </p>
          </div>
        </CardContent>
      </Card>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-h-[85vh] max-w-xl overflow-y-auto rounded-3xl border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          <DialogHeader>
            <DialogTitle className="inline-flex w-fit rounded-lg bg-blue-600 px-3 py-2 text-xl font-semibold text-white">
              Edit client
            </DialogTitle>
          </DialogHeader>
          <form className="mt-4 grid gap-4" onSubmit={handleSubmit}>
            <ClientFormFields values={formValues} onChange={(values) => setFormValues(values)} />
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
