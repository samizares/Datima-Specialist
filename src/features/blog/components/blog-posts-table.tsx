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
import Link from "next/link";
import { adminBlogCreatePath } from "@/paths";
import { deleteBlog, updateBlog, updateScheduledPost } from "../actions/blogs";
import { getBlogPosts } from "../queries/get-blog-posts";

const statusLabels = {
  PUBLISHED: "Published",
  SCHEDULED: "Scheduled",
} as const;

type BlogRecord = Awaited<ReturnType<typeof getBlogPosts>>[number];

type BlogFormValues = {
  title: string;
  tags: string;
  content: string;
  scheduleDate: string;
  scheduleTime: string;
};

const defaultFormValues: BlogFormValues = {
  title: "",
  tags: "",
  content: "",
  scheduleDate: "",
  scheduleTime: "",
};

const DeleteBlogButton = ({
  blogId,
  kind,
  disabled,
  onDeleted,
}: {
  blogId: string;
  kind: "PUBLISHED" | "SCHEDULED";
  disabled: boolean;
  onDeleted: () => void;
}) => {
  const [trigger, dialog] = useConfirmDialog({
    title: "Delete post",
    description:
      "Are you sure you want to delete this record permanently from the database?",
    action: async () => {
      const result = await deleteBlog(blogId, kind);
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

const parseTags = (tags: string) =>
  tags
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);

const buildScheduleValue = (date: string, time: string) => {
  if (!date || !time) return null;
  return new Date(`${date}T${time}`).toISOString();
};

export function BlogPostsTable({
  initialPosts,
  canEdit,
  canDelete,
}: {
  initialPosts: BlogRecord[];
  canEdit: boolean;
  canDelete: boolean;
}) {
  const [posts, setPosts] = useState<BlogRecord[]>(initialPosts);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<BlogRecord | null>(null);
  const [formValues, setFormValues] = useState<BlogFormValues>(defaultFormValues);
  const [isPending, startTransition] = useTransition();

  const tableRows = useMemo(() => posts.slice(0, 6), [posts]);

  const loadPosts = () => {
    startTransition(async () => {
      const data = await getBlogPosts();
      setPosts(data);
    });
  };

  useEffect(() => {
    if (!formOpen) return;
    if (editing) {
      const scheduleDate =
        editing.status === "SCHEDULED"
          ? format(new Date(editing.date), "yyyy-MM-dd")
          : "";
      const scheduleTime =
        editing.status === "SCHEDULED"
          ? format(new Date(editing.date), "HH:mm")
          : "";

      setFormValues({
        title: editing.title,
        tags: editing.tags,
        content: editing.content,
        scheduleDate,
        scheduleTime,
      });
    } else {
      setFormValues(defaultFormValues);
    }
  }, [editing, formOpen]);

  const handleEditClick = (post: BlogRecord) => {
    if (!canEdit) return;
    setEditing(post);
    setFormOpen(true);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editing) return;

    startTransition(async () => {
      if (editing.status === "SCHEDULED") {
        const scheduledFor = buildScheduleValue(
          formValues.scheduleDate,
          formValues.scheduleTime
        );
        if (!scheduledFor) {
          toast.error("Schedule date and time are required.");
          return;
        }
        const action = await updateScheduledPost(editing.id, {
          title: formValues.title,
          tags: formValues.tags,
          content: formValues.content,
          scheduledFor,
        });
        if (action.status === "ERROR") {
          toast.error(action.message || "Please check the form fields.");
          return;
        }
      } else {
        const action = await updateBlog(editing.id, {
          title: formValues.title,
          tags: formValues.tags,
          content: formValues.content,
        });
        if (action.status === "ERROR") {
          toast.error(action.message || "Please check the form fields.");
          return;
        }
      }

      toast.success("Post updated.");
      setFormOpen(false);
      setEditing(null);
      loadPosts();
    });
  };

  return (
    <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">
            Blog
          </p>
          <h1 className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
            All posts
          </h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Review published content and scheduled posts.
          </p>
        </div>
        <Button
          className="rounded-full bg-blue-600 text-white hover:bg-blue-700"
          asChild
        >
          <Link href={adminBlogCreatePath()}>Create Post</Link>
        </Button>
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
              <TableHead>Title</TableHead>
              <TableHead>Tags</TableHead>
              <TableHead>Author</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tableRows.length ? (
              tableRows.map((post) => (
                <TableRow
                  key={post.id}
                  className="border-slate-100 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-950"
                >
                  <TableCell className="font-semibold text-slate-900 dark:text-white">
                    {post.title}
                  </TableCell>
                  <TableCell className="text-slate-500 dark:text-slate-400">
                    <div className="flex flex-wrap gap-2">
                      {parseTags(post.tags).slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-slate-500 dark:text-slate-400">
                    {post.authorName}
                  </TableCell>
                  <TableCell className="text-slate-500 dark:text-slate-400">
                    {statusLabels[post.status]}
                  </TableCell>
                  <TableCell className="text-slate-500 dark:text-slate-400">
                    {format(new Date(post.date), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {canEdit ? (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditClick(post)}
                        >
                          <Pencil className="h-4 w-4 text-slate-500" />
                        </Button>
                      ) : null}
                      {canDelete ? (
                        <DeleteBlogButton
                          blogId={post.id}
                          kind={post.status}
                          disabled={isPending}
                          onDeleted={loadPosts}
                        />
                      ) : null}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-sm text-slate-500">
                  No blog posts found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-2xl rounded-3xl border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-slate-900 dark:text-white">
              Edit post
            </DialogTitle>
          </DialogHeader>
          <form className="mt-4 grid gap-4" onSubmit={handleSubmit}>
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formValues.title}
                onChange={(event) =>
                  setFormValues((prev) => ({ ...prev, title: event.target.value }))
                }
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="tags">Tags</Label>
              <Input
                id="tags"
                placeholder="Health, Wellness, Tips"
                value={formValues.tags}
                onChange={(event) =>
                  setFormValues((prev) => ({ ...prev, tags: event.target.value }))
                }
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="content">Content</Label>
              <textarea
                id="content"
                className="min-h-[140px] rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
                value={formValues.content}
                onChange={(event) =>
                  setFormValues((prev) => ({ ...prev, content: event.target.value }))
                }
                required
              />
            </div>
            {editing?.status === "SCHEDULED" ? (
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="scheduleDate">Schedule date</Label>
                  <Input
                    id="scheduleDate"
                    type="date"
                    value={formValues.scheduleDate}
                    onChange={(event) =>
                      setFormValues((prev) => ({
                        ...prev,
                        scheduleDate: event.target.value,
                      }))
                    }
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="scheduleTime">Schedule time</Label>
                  <Input
                    id="scheduleTime"
                    type="time"
                    value={formValues.scheduleTime}
                    onChange={(event) =>
                      setFormValues((prev) => ({
                        ...prev,
                        scheduleTime: event.target.value,
                      }))
                    }
                    required
                  />
                </div>
              </div>
            ) : null}
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
