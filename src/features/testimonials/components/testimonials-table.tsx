"use client";

import { useEffect, useMemo, useState, useTransition, type FormEvent } from "react";
import { format } from "date-fns";
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
import {
  createTestimonial,
  deleteTestimonial,
  updateTestimonial,
} from "../actions/testimonials";
import { getTestimonials } from "../queries/get-testimonials";

type TestimonialRecord = Awaited<ReturnType<typeof getTestimonials>>[number];

type ClientOption = {
  id: string;
  firstName: string;
  lastName: string;
};

type TestimonialFormValues = {
  clientId: string;
  content: string;
};

const defaultFormValues: TestimonialFormValues = {
  clientId: "",
  content: "",
};

const DeleteTestimonialButton = ({
  testimonialId,
  disabled,
  onDeleted,
}: {
  testimonialId: string;
  disabled: boolean;
  onDeleted: () => void;
}) => {
  const [trigger, dialog] = useConfirmDialog({
    title: "Delete testimonial",
    description:
      "Are you sure you want to delete this record permanently from the database?",
    action: async () => {
      const result = await deleteTestimonial(testimonialId);
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

export function TestimonialsTable({
  initialTestimonials,
  clients,
  canEdit,
  canDelete,
}: {
  initialTestimonials: TestimonialRecord[];
  clients: ClientOption[];
  canEdit: boolean;
  canDelete: boolean;
}) {
  const [testimonials, setTestimonials] = useState<TestimonialRecord[]>(
    initialTestimonials
  );
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<TestimonialRecord | null>(null);
  const [formValues, setFormValues] =
    useState<TestimonialFormValues>(defaultFormValues);
  const [isPending, startTransition] = useTransition();

  const tableRows = useMemo(() => testimonials.slice(0, 6), [testimonials]);

  const loadTestimonials = () => {
    startTransition(async () => {
      const data = await getTestimonials();
      setTestimonials(data);
    });
  };

  useEffect(() => {
    if (!formOpen) return;
    if (editing) {
      setFormValues({
        clientId: editing.clientId,
        content: editing.content,
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

  const handleEditClick = (testimonial: TestimonialRecord) => {
    if (!canEdit) return;
    setEditing(testimonial);
    setFormOpen(true);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    startTransition(async () => {
      const action = editing
        ? await updateTestimonial(editing.id, formValues)
        : await createTestimonial(formValues);
      if (action.status === "ERROR") {
        toast.error(action.message || "Please check the form fields.");
        return;
      }
      toast.success(action.message || "Saved.");
      setFormOpen(false);
      setEditing(null);
      loadTestimonials();
    });
  };

  return (
    <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">
            Testimonials
          </p>
          <h1 className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
            Client feedback
          </h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Highlight patient experiences and success stories.
          </p>
        </div>
        {canEdit ? (
          <Button
            className="rounded-full bg-blue-600 text-white hover:bg-blue-700"
            onClick={handleAddClick}
          >
            Add Testimonial
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
              <TableHead>Testimonial</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tableRows.length ? (
              tableRows.map((testimonial) => (
                <TableRow
                  key={testimonial.id}
                  className="border-slate-100 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-950"
                >
                  <TableCell className="font-semibold text-slate-900 dark:text-white">
                    {testimonial.client.firstName} {testimonial.client.lastName}
                  </TableCell>
                  <TableCell className="max-w-md truncate text-slate-500 dark:text-slate-400">
                    {testimonial.content}
                  </TableCell>
                  <TableCell className="text-slate-500 dark:text-slate-400">
                    {format(new Date(testimonial.createdAt), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {canEdit ? (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditClick(testimonial)}
                        >
                          <Pencil className="h-4 w-4 text-slate-500" />
                        </Button>
                      ) : null}
                      {canDelete ? (
                        <DeleteTestimonialButton
                          testimonialId={testimonial.id}
                          disabled={isPending}
                          onDeleted={loadTestimonials}
                        />
                      ) : null}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="py-10 text-center text-sm text-slate-500">
                  No testimonials found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-xl rounded-3xl border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          <DialogHeader>
            <DialogTitle className="inline-flex w-fit rounded-lg bg-blue-600 px-3 py-2 text-xl font-semibold text-white">
              {editing ? "Edit testimonial" : "Add testimonial"}
            </DialogTitle>
          </DialogHeader>
          <form className="mt-4 grid gap-4" onSubmit={handleSubmit}>
            <div className="grid gap-2">
              <Label>Client</Label>
              <Select
                value={formValues.clientId}
                onValueChange={(value) =>
                  setFormValues((prev) => ({ ...prev, clientId: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select client" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.firstName} {client.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="content">Testimonial</Label>
              <textarea
                id="content"
                value={formValues.content}
                onChange={(event) =>
                  setFormValues((prev) => ({ ...prev, content: event.target.value }))
                }
                required
                maxLength={300}
                className="min-h-[140px] rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
              />
              <p className="text-xs text-slate-400">
                {formValues.content.length}/300
              </p>
            </div>
            <DialogFooter className="gap-2">
              <Button type="button" variant="outline" onClick={() => setFormOpen(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                className="rounded-full bg-blue-600 text-white hover:bg-blue-700"
                disabled={isPending}
              >
                {editing ? "Save changes" : "Create testimonial"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
