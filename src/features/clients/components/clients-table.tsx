"use client";

import { useEffect, useMemo, useState, useTransition, type FormEvent } from "react";
import { Pencil, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { useConfirmDialog } from "@/components/confirm-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  createClient,
  deleteClient,
  updateClient,
} from "../actions/clients";
import { ClientFormFields, type ClientFormValues } from "./client-form-fields";
import { getClients } from "../queries/get-clients";
import Link from "next/link";

type ClientRecord = Awaited<ReturnType<typeof getClients>>[number];

const defaultFormValues: ClientFormValues = {
  firstName: "",
  lastName: "",
  email: "",
  telephone: "",
  address: "",
  status: "PROSPECT",
  attachmentId: "",
};

type ClientsTableProps = {
  initialClients: ClientRecord[];
  canEdit: boolean;
  canDelete: boolean;
};

const DeleteClientButton = ({
  clientId,
  disabled,
  onDeleted,
}: {
  clientId: string;
  disabled: boolean;
  onDeleted: () => void;
}) => {
  const [trigger, dialog] = useConfirmDialog({
    title: "Delete client",
    description:
      "Are you sure you want to delete this record permanently from the database?",
    action: async () => {
      const result = await deleteClient(clientId);
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

export function ClientsTable({
  initialClients,
  canEdit,
  canDelete,
}: ClientsTableProps) {
  const [clients, setClients] = useState<ClientRecord[]>(initialClients);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<ClientRecord | null>(null);
  const [formValues, setFormValues] = useState<ClientFormValues>(defaultFormValues);
  const [isPending, startTransition] = useTransition();

  const tableRows = useMemo(() => clients.slice(0, 6), [clients]);

  const loadClients = () => {
    startTransition(async () => {
      const data = await getClients();
      setClients(data);
    });
  };

  useEffect(() => {
    if (!formOpen) return;
    if (editing) {
      setFormValues({
        firstName: editing.firstName,
        lastName: editing.lastName,
        email: editing.email ?? "",
        telephone: editing.telephone,
        address: editing.address,
        status: editing.status,
        attachmentId: editing.attachmentId ?? "",
      });
    } else {
      setFormValues(defaultFormValues);
    }
  }, [editing, formOpen]);

  const handleAddClick = () => {
    if (!canEdit) return;
    setEditing(null);
    setFormOpen(true);
  };

  const handleEditClick = (client: ClientRecord) => {
    if (!canEdit) return;
    setEditing(client);
    setFormOpen(true);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    startTransition(async () => {
      const action = editing
        ? await updateClient(editing.id, formValues)
        : await createClient(formValues);
      if (action.status === "ERROR") {
        toast.error(action.message || "Please check the form fields.");
        return;
      }

      toast.success(action.message || "Saved.");
      setFormOpen(false);
      setEditing(null);
      loadClients();
    });
  };

  return (
    <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">
            Clients
          </p>
          <h1 className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
            Client records
          </h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Manage client profiles and current status updates.
          </p>
        </div>
        {canEdit ? (
          <Button
            className="rounded-full bg-blue-600 text-white hover:bg-blue-700"
            onClick={handleAddClick}
          >
            Add Client
          </Button>
        ) : null}
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-950">
        <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
          <span>Show</span>
          <Select defaultValue="10">
            <SelectTrigger className="h-9 w-[90px] rounded-full border-slate-200 bg-white text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
            </SelectContent>
          </Select>
          <span>entries</span>
        </div>
        <div className="relative w-full max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Search..."
            className="h-10 rounded-full border-slate-200 bg-white pl-9 text-sm text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
          />
        </div>
      </div>

      <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200/70 dark:border-slate-800">
        <Table>
          <TableHeader className="bg-white text-xs font-semibold uppercase tracking-[0.12em] text-slate-400 dark:bg-slate-900 dark:text-slate-500">
            <TableRow className="border-slate-200/70 dark:border-slate-800">
              <TableHead>Client</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Telephone</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Address</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tableRows.length ? (
              tableRows.map((client) => (
                <TableRow
                  key={client.id}
                  className="border-slate-100 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-950"
                >
                  <TableCell className="font-semibold text-slate-900 dark:text-white">
                    <Link
                      href={`/admin/clients/${client.id}`}
                      className="transition hover:text-blue-600"
                    >
                      {client.firstName} {client.lastName}
                    </Link>
                  </TableCell>
                  <TableCell className="text-slate-500 dark:text-slate-400">
                    {client.email ?? "—"}
                  </TableCell>
                  <TableCell className="text-slate-500 dark:text-slate-400">
                    {client.telephone}
                  </TableCell>
                  <TableCell className="text-slate-500 dark:text-slate-400">
                    {client.status}
                  </TableCell>
                  <TableCell className="text-slate-500 dark:text-slate-400">
                    {client.address}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {canEdit ? (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditClick(client)}
                        >
                          <Pencil className="h-4 w-4 text-slate-500" />
                        </Button>
                      ) : null}
                      {canDelete ? (
                        <DeleteClientButton
                          clientId={client.id}
                          disabled={isPending}
                          onDeleted={loadClients}
                        />
                      ) : null}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-sm text-slate-500">
                  No clients found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-xl rounded-3xl border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-slate-900 dark:text-white">
              {editing ? "Edit client" : "Add client"}
            </DialogTitle>
          </DialogHeader>
          <form className="mt-4 grid gap-4" onSubmit={handleSubmit}>
            <ClientFormFields
              values={formValues}
              onChange={(values) => setFormValues(values)}
            />
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
                disabled={isPending}
              >
                {editing ? "Save changes" : "Create client"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
