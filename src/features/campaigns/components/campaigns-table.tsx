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
  createCampaign,
  deleteCampaign,
  updateCampaign,
} from "../actions/campaigns";
import { getCampaigns } from "../queries/get-campaigns";

type CampaignRecord = Awaited<ReturnType<typeof getCampaigns>>[number];

type CampaignFormValues = {
  name: string;
  catchphrase: string;
  startDate: string;
  endDate: string;
};

const defaultFormValues: CampaignFormValues = {
  name: "",
  catchphrase: "",
  startDate: "",
  endDate: "",
};

const formatDateValue = (value?: Date | string | null) => {
  if (!value) return "";
  const date = typeof value === "string" ? new Date(value) : value;
  return format(date, "yyyy-MM-dd");
};

export function CampaignsTable({
  initialCampaigns,
  canEdit,
  canDelete,
}: {
  initialCampaigns: CampaignRecord[];
  canEdit: boolean;
  canDelete: boolean;
}) {
  const [campaigns, setCampaigns] = useState<CampaignRecord[]>(initialCampaigns);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<CampaignRecord | null>(null);
  const [formValues, setFormValues] = useState<CampaignFormValues>(defaultFormValues);
  const [isPending, startTransition] = useTransition();

  const tableRows = useMemo(() => campaigns.slice(0, 6), [campaigns]);

  const loadCampaigns = () => {
    startTransition(async () => {
      const data = await getCampaigns();
      setCampaigns(data);
    });
  };

  useEffect(() => {
    if (!formOpen) return;
    if (editing) {
      setFormValues({
        name: editing.name,
        catchphrase: editing.catchphrase,
        startDate: formatDateValue(editing.startDate),
        endDate: formatDateValue(editing.endDate),
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

  const handleEditClick = (campaign: CampaignRecord) => {
    if (!canEdit) return;
    setEditing(campaign);
    setFormOpen(true);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    startTransition(async () => {
      const action = editing
        ? await updateCampaign(editing.id, formValues)
        : await createCampaign(formValues);
      if (action.status === "ERROR") {
        toast.error(action.message || "Please check the form fields.");
        return;
      }
      toast.success(action.message || "Saved.");
      setFormOpen(false);
      setEditing(null);
      loadCampaigns();
    });
  };
  const DeleteCampaignButton = ({
    campaignId,
  }: {
    campaignId: string;
  }) => {
    const [trigger, dialog] = useConfirmDialog({
      title: "Delete campaign",
      description:
        "Are you sure you want to delete this record permanently from the database?",
      action: async () => {
        const result = await deleteCampaign(campaignId);
        if (result.status === "SUCCESS") {
          loadCampaigns();
        }
        return result;
      },
      trigger: (isLoading) => (
        <Button variant="ghost" size="icon" disabled={isPending || isLoading}>
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

  return (
    <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">
            Campaigns
          </p>
          <h1 className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
            Campaign planning
          </h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Track awareness campaigns and promotional messaging timelines.
          </p>
        </div>
        {canEdit ? (
          <Button
            className="rounded-full bg-blue-600 text-white hover:bg-blue-700"
            onClick={handleAddClick}
          >
            Add Campaign
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
              <TableHead>Name</TableHead>
              <TableHead>Catchphrase</TableHead>
              <TableHead>Start</TableHead>
              <TableHead>End</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tableRows.length ? (
              tableRows.map((campaign) => (
                <TableRow
                  key={campaign.id}
                  className="border-slate-100 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-950"
                >
                  <TableCell className="font-semibold text-slate-900 dark:text-white">
                    {campaign.name}
                  </TableCell>
                  <TableCell className="max-w-md truncate text-slate-500 dark:text-slate-400">
                    {campaign.catchphrase}
                  </TableCell>
                  <TableCell className="text-slate-500 dark:text-slate-400">
                    {format(new Date(campaign.startDate), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell className="text-slate-500 dark:text-slate-400">
                    {format(new Date(campaign.endDate), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {canEdit ? (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditClick(campaign)}
                        >
                          <Pencil className="h-4 w-4 text-slate-500" />
                        </Button>
                      ) : null}
                      {canDelete ? (
                        <DeleteCampaignButton campaignId={campaign.id} />
                      ) : null}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="py-10 text-center text-sm text-slate-500">
                  No campaigns found.
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
              {editing ? "Edit campaign" : "Add campaign"}
            </DialogTitle>
          </DialogHeader>
          <form className="mt-4 grid gap-4" onSubmit={handleSubmit}>
            <div className="grid gap-2">
              <Label htmlFor="name">Campaign name</Label>
              <Input
                id="name"
                value={formValues.name}
                onChange={(event) =>
                  setFormValues((prev) => ({ ...prev, name: event.target.value }))
                }
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="catchphrase">Catchphrase</Label>
              <Input
                id="catchphrase"
                value={formValues.catchphrase}
                onChange={(event) =>
                  setFormValues((prev) => ({ ...prev, catchphrase: event.target.value }))
                }
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="startDate">Start date</Label>
              <Input
                id="startDate"
                type="date"
                value={formValues.startDate}
                onChange={(event) =>
                  setFormValues((prev) => ({ ...prev, startDate: event.target.value }))
                }
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="endDate">End date</Label>
              <Input
                id="endDate"
                type="date"
                value={formValues.endDate}
                onChange={(event) =>
                  setFormValues((prev) => ({ ...prev, endDate: event.target.value }))
                }
                required
              />
            </div>
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
                {editing ? "Save changes" : "Create campaign"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
