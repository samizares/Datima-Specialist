"use client";

import { useMemo, useState, useTransition } from "react";
import { format } from "date-fns";
import { Pencil, Search, Trash2 } from "lucide-react";

import { useConfirmDialog } from "@/components/confirm-dialog";
import { Button } from "@/components/ui/button";
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
import Link from "next/link";
import { adminBlogCreatePath, attachmentDownloadPath } from "@/paths";
import { deleteBlog } from "../actions/blogs";
import { getBlogPosts } from "../queries/get-blog-posts";

const statusLabels = {
  PUBLISHED: "Published",
  SCHEDULED: "Scheduled",
} as const;

type BlogRecord = Awaited<ReturnType<typeof getBlogPosts>>[number];

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
  const [isPending, startTransition] = useTransition();

  const tableRows = useMemo(() => posts.slice(0, 6), [posts]);

  const loadPosts = () => {
    startTransition(async () => {
      const data = await getBlogPosts();
      setPosts(data);
    });
  };

  const handleEditClick = (post: BlogRecord) => {
    if (!canEdit) return;
    window.location.href = `${adminBlogCreatePath()}?postId=${post.id}`;
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
              <TableHead>Cover</TableHead>
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
                  <TableCell>
                    <div className="h-12 w-16 overflow-hidden rounded-lg bg-slate-100">
                      <img
                        src={
                          post.attachmentId
                            ? attachmentDownloadPath(post.attachmentId)
                            : "/assets/profile-placeholder.svg"
                        }
                        alt={post.title}
                        className="h-full w-full object-cover"
                        loading="lazy"
                        decoding="async"
                      />
                    </div>
                  </TableCell>
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
                <TableCell colSpan={7} className="py-10 text-center text-sm text-slate-500">
                  No blog posts found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
