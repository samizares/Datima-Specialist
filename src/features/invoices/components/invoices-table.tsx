"use client";

import { useMemo, useState, useTransition, type FormEvent } from "react";
import Link from "next/link";
import { Eye, Pencil, Send, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { InvoiceStatus } from "@prisma/client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { useConfirmDialog } from "@/components/confirm-dialog";
import { createInvoice, deleteInvoice, sendInvoice, updateInvoice } from "../actions/invoices";

type ClientOption = {
  id: string;
  name: string;
  email: string | null;
};

type InvoiceRow = {
  id: string;
  clientId: string;
  invoiceNumber: string;
  status: InvoiceStatus;
  issueDate: Date;
  dueDate: Date;
  total: string;
  currency: string;
  clientName: string;
  items: InvoiceItemForm[];
  tax: string;
  discount: string;
  notes: string;
  terms: string;
};

type InvoiceItemForm = {
  description: string;
  quantity: string;
  unitPrice: string;
};

type InvoiceFormState = {
  clientId: string;
  invoiceNumber: string;
  status: InvoiceStatus;
  issueDate: string;
  dueDate: string;
  currency: string;
  tax: string;
  discount: string;
  notes: string;
  terms: string;
  items: InvoiceItemForm[];
};

type InvoicesTableProps = {
  invoices: InvoiceRow[];
  clients: ClientOption[];
  canPreview: boolean;
};

const DeleteInvoiceButton = ({
  invoiceId,
  disabled,
  onDeleted,
}: {
  invoiceId: string;
  disabled: boolean;
  onDeleted: () => void;
}) => {
  const [trigger, dialog] = useConfirmDialog({
    title: "Delete invoice",
    description: "Are you sure you want to delete this invoice?",
    action: async () => {
      const result = await deleteInvoice(invoiceId);
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

const defaultFormState: InvoiceFormState = {
  clientId: "",
  invoiceNumber: "",
  status: "DRAFT",
  issueDate: "",
  dueDate: "",
  currency: "NGN",
  tax: "0",
  discount: "0",
  notes: "",
  terms: "",
  items: [{ description: "", quantity: "1", unitPrice: "0" }],
};

export function InvoicesTable({ invoices, clients, canPreview }: InvoicesTableProps) {
  const [rows, setRows] = useState(invoices);
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formState, setFormState] = useState<InvoiceFormState>(defaultFormState);
  const [isPending, startTransition] = useTransition();

  const filteredRows = useMemo(() => {
    const query = search.toLowerCase().trim();
    if (!query) return rows;
    return rows.filter(
      (row) =>
        row.invoiceNumber.toLowerCase().includes(query) ||
        row.clientName.toLowerCase().includes(query)
    );
  }, [rows, search]);

  const openCreate = () => {
    setEditingId(null);
    setFormState(defaultFormState);
    setFormOpen(true);
  };

  const openEdit = (invoice: InvoiceRow) => {
    setEditingId(invoice.id);
    setFormState({
      clientId: invoice.clientId,
      invoiceNumber: invoice.invoiceNumber,
      status: invoice.status,
      issueDate: invoice.issueDate.toISOString().slice(0, 10),
      dueDate: invoice.dueDate.toISOString().slice(0, 10),
      currency: invoice.currency,
      tax: invoice.tax,
      discount: invoice.discount,
      notes: invoice.notes,
      terms: invoice.terms,
      items: invoice.items.length ? invoice.items : defaultFormState.items,
    });
    setFormOpen(true);
  };

  const removeRow = (invoiceId: string) => {
    setRows((prev) => prev.filter((row) => row.id !== invoiceId));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    startTransition(async () => {
      const payload = {
        clientId: formState.clientId,
        invoiceNumber: formState.invoiceNumber,
        status: formState.status,
        issueDate: formState.issueDate,
        dueDate: formState.dueDate,
        currency: formState.currency,
        tax: Number(formState.tax || 0),
        discount: Number(formState.discount || 0),
        notes: formState.notes || undefined,
        terms: formState.terms || undefined,
        items: formState.items.map((item) => ({
          description: item.description,
          quantity: Number(item.quantity || 0),
          unitPrice: Number(item.unitPrice || 0),
        })),
      };

      const result = editingId
        ? await updateInvoice(editingId, payload)
        : await createInvoice(payload);

      if (result.status === "ERROR") {
        toast.error(result.message || "Please check the form fields.");
        return;
      }

      toast.success(result.message || "Saved.");
      setFormOpen(false);
    });
  };

  const handleSend = (invoiceId: string) => {
    startTransition(async () => {
      const result = await sendInvoice(invoiceId);
      if (result.status === "ERROR") {
        toast.error(result.message || "Unable to send invoice.");
        return;
      }
      toast.success(result.message || "Invoice sent.");
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex gap-2">
          <Button
            className="rounded-full bg-blue-600 text-white hover:bg-blue-700"
            onClick={openCreate}
          >
            Create New Invoice
          </Button>
          {canPreview ? (
            <Button variant="outline" asChild>
              <Link href="/admin/invoices/preview">Preview Invoice</Link>
            </Button>
          ) : null}
        </div>
        <div className="relative w-full max-w-xs">
          <Input
            placeholder="Search invoice number or client"
            className="h-10 rounded-full border-slate-200 bg-white pl-4 text-sm text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200/70 dark:border-slate-800">
        <Table>
          <TableHeader className="bg-white text-xs font-semibold uppercase tracking-[0.12em] text-slate-400 dark:bg-slate-900 dark:text-slate-500">
            <TableRow className="border-slate-200/70 dark:border-slate-800">
              <TableHead>Invoice #</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Total</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRows.length ? (
              filteredRows.map((row) => (
                <TableRow key={row.id} className="border-slate-100 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-950">
                  <TableCell className="font-semibold text-slate-900 dark:text-white">{row.invoiceNumber}</TableCell>
                  <TableCell className="text-slate-500 dark:text-slate-400">{row.clientName}</TableCell>
                  <TableCell className="text-slate-500 dark:text-slate-400">{row.status}</TableCell>
                  <TableCell className="text-slate-500 dark:text-slate-400">
                    {row.dueDate.toDateString()}
                  </TableCell>
                  <TableCell className="text-slate-500 dark:text-slate-400">
                    {row.currency} {row.total}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(row)}>
                        <Pencil className="h-4 w-4 text-slate-500" />
                      </Button>
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/admin/invoices/${row.id}`}>
                          <Eye className="h-4 w-4 text-slate-500" />
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleSend(row.id)}
                        disabled={isPending}
                      >
                        <Send className="h-4 w-4 text-slate-500" />
                      </Button>
                      <DeleteInvoiceButton
                        invoiceId={row.id}
                        disabled={isPending}
                        onDeleted={() => removeRow(row.id)}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-sm text-slate-500">
                  No invoices found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-3xl rounded-3xl border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          <DialogHeader>
            <DialogTitle className="inline-flex w-fit rounded-lg bg-blue-600 px-3 py-2 text-xl font-semibold text-white">
              {editingId ? "Edit Invoice" : "Add Invoice"}
            </DialogTitle>
          </DialogHeader>
          <form className="mt-4 grid gap-4" onSubmit={handleSubmit}>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="grid gap-2">
                <Label>Client</Label>
                <Select
                  value={formState.clientId}
                  onValueChange={(value) => setFormState((prev) => ({ ...prev, clientId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select client" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Invoice Number</Label>
                <Input
                  value={formState.invoiceNumber}
                  onChange={(event) =>
                    setFormState((prev) => ({ ...prev, invoiceNumber: event.target.value }))
                  }
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label>Status</Label>
                <Select
                  value={formState.status}
                  onValueChange={(value) =>
                    setFormState((prev) => ({ ...prev, status: value as InvoiceStatus }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DRAFT">Draft</SelectItem>
                    <SelectItem value="SENT">Sent</SelectItem>
                    <SelectItem value="PAID">Paid</SelectItem>
                    <SelectItem value="OVERDUE">Overdue</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Issue Date</Label>
                <Input
                  type="date"
                  value={formState.issueDate}
                  onChange={(event) => setFormState((prev) => ({ ...prev, issueDate: event.target.value }))}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label>Due Date</Label>
                <Input
                  type="date"
                  value={formState.dueDate}
                  onChange={(event) => setFormState((prev) => ({ ...prev, dueDate: event.target.value }))}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label>Currency</Label>
                <Input
                  value={formState.currency}
                  onChange={(event) => setFormState((prev) => ({ ...prev, currency: event.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Line Items</Label>
              {formState.items.map((item, index) => (
                <div key={`${item.description}-${index}`} className="grid gap-2 md:grid-cols-4">
                  <Input
                    placeholder="Description"
                    value={item.description}
                    onChange={(event) =>
                      setFormState((prev) => {
                        const next = [...prev.items];
                        next[index] = { ...next[index], description: event.target.value };
                        return { ...prev, items: next };
                      })
                    }
                    required
                  />
                  <Input
                    placeholder="Qty"
                    value={item.quantity}
                    onChange={(event) =>
                      setFormState((prev) => {
                        const next = [...prev.items];
                        next[index] = { ...next[index], quantity: event.target.value };
                        return { ...prev, items: next };
                      })
                    }
                    required
                  />
                  <Input
                    placeholder="Unit Price"
                    value={item.unitPrice}
                    onChange={(event) =>
                      setFormState((prev) => {
                        const next = [...prev.items];
                        next[index] = { ...next[index], unitPrice: event.target.value };
                        return { ...prev, items: next };
                      })
                    }
                    required
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      setFormState((prev) => ({
                        ...prev,
                        items: prev.items.filter((_, idx) => idx !== index),
                      }))
                    }
                    disabled={formState.items.length === 1}
                  >
                    Remove
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  setFormState((prev) => ({
                    ...prev,
                    items: [...prev.items, { description: "", quantity: "1", unitPrice: "0" }],
                  }))
                }
              >
                Add Item
              </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="grid gap-2">
                <Label>Tax</Label>
                <Input
                  value={formState.tax}
                  onChange={(event) => setFormState((prev) => ({ ...prev, tax: event.target.value }))}
                />
              </div>
              <div className="grid gap-2">
                <Label>Discount</Label>
                <Input
                  value={formState.discount}
                  onChange={(event) =>
                    setFormState((prev) => ({ ...prev, discount: event.target.value }))
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label>Notes</Label>
                <Input
                  value={formState.notes}
                  onChange={(event) => setFormState((prev) => ({ ...prev, notes: event.target.value }))}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Terms</Label>
              <Input
                value={formState.terms}
                onChange={(event) => setFormState((prev) => ({ ...prev, terms: event.target.value }))}
              />
            </div>
            <DialogFooter className="gap-2">
              <Button type="button" variant="outline" onClick={() => setFormOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-blue-600 text-white hover:bg-blue-700" disabled={isPending}>
                Save
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
