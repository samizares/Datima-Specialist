"use client";

import { useEffect, useRef, useState, useTransition, type ChangeEvent } from "react";
import Image from "next/image";
import { CalendarDays, ImageUp, Plus, SendHorizonal, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { adminBlogAllPath, attachmentDownloadPath } from "@/paths";
import { BlogEditor, type BlogEditorHandle } from "./blog-editor";
import { createBlog, updateBlog, updateScheduledPost, uploadBlogImage } from "../actions/blogs";
import { useRouter } from "next/navigation";
import type { BlogPostDetail } from "../queries/get-blog-post";

const defaultForm = {
  title: "",
  tags: [] as string[],
  tagInput: "",
  content: "",
  coverAttachmentId: "",
  publishMode: "now" as "now" | "schedule",
  scheduleDate: "",
  scheduleTime: "",
};

type BlogComposeFormProps = {
  author: {
    id: string;
    username: string;
    email: string;
  };
  initialPost?: BlogPostDetail | null;
};

const parseTags = (tags: string) =>
  tags
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);

export function BlogComposeForm({ author, initialPost }: BlogComposeFormProps) {
  const router = useRouter();
  const editorRef = useRef<BlogEditorHandle | null>(null);
  const coverInputRef = useRef<HTMLInputElement | null>(null);
  const inlineInputRef = useRef<HTMLInputElement | null>(null);
  const [form, setForm] = useState(defaultForm);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isUploadingCover, setUploadingCover] = useState(false);
  const [isUploadingInline, setUploadingInline] = useState(false);

  const handleCoverChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploadingCover(true);
    const result = await uploadBlogImage(file);
    if (result.status === "ERROR") {
      toast.error(result.message || "Cover upload failed.");
      setUploadingCover(false);
      return;
    }
    const attachmentId = result.data?.attachmentId;
    if (!attachmentId) {
      toast.error("Cover upload failed.");
      setUploadingCover(false);
      return;
    }
    setForm((prev) => ({ ...prev, coverAttachmentId: attachmentId }));
    setCoverPreview(URL.createObjectURL(file));
    setUploadingCover(false);
  };

  const handleInlineImage = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploadingInline(true);
    const result = await uploadBlogImage(file);
    if (result.status === "ERROR") {
      toast.error(result.message || "Image upload failed.");
      setUploadingInline(false);
      return;
    }
    const attachmentId = result.data?.attachmentId;
    if (!attachmentId) {
      toast.error("Image upload failed.");
      setUploadingInline(false);
      return;
    }
    const url = `/api/aws/s3/attachments/${attachmentId}`;
    editorRef.current?.insertImage(url);
    setUploadingInline(false);
  };

  const removeTag = (tag: string) => {
    setForm((prev) => ({
      ...prev,
      tags: prev.tags.filter((item) => item !== tag),
    }));
  };

  const addTag = () => {
    if (!form.tagInput.trim()) return;
    setForm((prev) => ({
      ...prev,
      tags: Array.from(new Set([...prev.tags, prev.tagInput.trim()])),
      tagInput: "",
    }));
  };

  const scheduleValue =
    form.publishMode === "schedule" && form.scheduleDate && form.scheduleTime
      ? new Date(`${form.scheduleDate}T${form.scheduleTime}`).toISOString()
      : null;

  useEffect(() => {
    if (!initialPost) return;
    const scheduleDate =
      initialPost.status === "SCHEDULED" && initialPost.scheduledFor
        ? new Date(initialPost.scheduledFor).toISOString().slice(0, 10)
        : "";
    const scheduleTime =
      initialPost.status === "SCHEDULED" && initialPost.scheduledFor
        ? new Date(initialPost.scheduledFor).toISOString().slice(11, 16)
        : "";

    setForm({
      title: initialPost.title,
      tags: parseTags(initialPost.tags),
      tagInput: "",
      content: initialPost.content,
      coverAttachmentId: initialPost.attachmentId,
      publishMode: initialPost.status === "SCHEDULED" ? "schedule" : "now",
      scheduleDate,
      scheduleTime,
    });
    setCoverPreview(attachmentDownloadPath(initialPost.attachmentId));
  }, [initialPost]);

  const handleSubmit = () => {
    startTransition(async () => {
      if (!form.coverAttachmentId) {
        toast.error("Upload a cover image before publishing.");
        return;
      }
      if (!form.title.trim()) {
        toast.error("Title is required.");
        return;
      }
      if (!form.content.trim()) {
        toast.error("Content is required.");
        return;
      }
      const nextTags = form.tags.length
        ? form.tags
        : form.tagInput.trim()
        ? [form.tagInput.trim()]
        : [];
      if (!nextTags.length) {
        toast.error("Add at least one tag.");
        return;
      }
      if (form.publishMode === "schedule" && !scheduleValue) {
        toast.error("Schedule date and time are required.");
        return;
      }
      if (nextTags !== form.tags) {
        setForm((prev) => ({
          ...prev,
          tags: nextTags,
          tagInput: "",
        }));
      }
      if (initialPost?.status === "SCHEDULED" && !scheduleValue) {
        toast.error("Schedule date and time are required.");
        return;
      }

      const result = initialPost
        ? initialPost.status === "SCHEDULED"
          ? await updateScheduledPost(initialPost.id, {
              title: form.title,
              tags: nextTags.join(", "),
              content: form.content,
              scheduledFor: scheduleValue ?? "",
            })
          : await updateBlog(initialPost.id, {
              title: form.title,
              tags: nextTags.join(", "),
              content: form.content,
            })
        : await createBlog({
            title: form.title,
            tags: nextTags.join(", "),
            content: form.content,
            attachmentId: form.coverAttachmentId,
            publishMode: form.publishMode,
            scheduledFor: scheduleValue ?? undefined,
          });
      if (result.status === "ERROR") {
        toast.error(result.message || "Please check the form fields.");
        return;
      }
      toast.success(result.message || "Post saved.");
      router.push(adminBlogAllPath());
    });
  };

  return (
    <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">
            Blog Post Compose
          </p>
          <h1 className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
            Create a new post
          </h1>
        </div>
        <Button
          variant="outline"
          className="rounded-full"
          onClick={() => router.push(adminBlogAllPath())}
        >
          Cancel
        </Button>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_0.7fr]">
        <div className="space-y-6">
          <div className="grid gap-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="Enter post title..."
              value={form.title}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, title: event.target.value }))
              }
            />
          </div>

          <div className="grid gap-2">
            <Label>Tags</Label>
            <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 dark:border-slate-800 dark:bg-slate-950">
              {form.tags.map((tag) => (
                <span
                  key={tag}
                  className="flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-200"
                >
                  {tag}
                  <button type="button" onClick={() => removeTag(tag)}>
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
              <div className="flex items-center gap-2">
                <Input
                  value={form.tagInput}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, tagInput: event.target.value }))
                  }
                  placeholder="Add tag"
                  className="h-8 w-32 border-none bg-transparent p-0 text-xs shadow-none focus-visible:ring-0"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={addTag}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <div className="grid gap-2">
            <Label>Author</Label>
            <Select value={author.id} disabled>
              <SelectTrigger className="h-10 rounded-2xl border-slate-200 bg-white text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={author.id}>{author.username}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label>Content</Label>
            <BlogEditor
              ref={editorRef}
              value={form.content}
              onChange={(value) => setForm((prev) => ({ ...prev, content: value }))}
              onRequestImage={() => inlineInputRef.current?.click()}
            />
          </div>
        </div>

        <div className="space-y-6">
          <div className="grid gap-2">
            <Label>Upload Image</Label>
            <div
              className={cn(
                "rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-5 text-center text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-950",
                isUploadingCover && "opacity-70"
              )}
            >
              {coverPreview ? (
                <div className="space-y-3">
                  <div className="overflow-hidden rounded-xl border border-slate-200">
                    <Image
                      src={coverPreview}
                      alt="Cover preview"
                      width={320}
                      height={200}
                      className="h-40 w-full object-cover"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => coverInputRef.current?.click()}
                  >
                    Replace image
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <ImageUp className="mx-auto h-6 w-6 text-slate-400" />
                  <p>Drag & drop or upload an image</p>
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-full"
                    onClick={() => coverInputRef.current?.click()}
                    disabled={isUploadingCover}
                  >
                    Upload an image
                  </Button>
                  <p className="text-xs text-slate-400">Maximum size 4MB</p>
                </div>
              )}
            </div>
          </div>

          <div className="grid gap-3">
            <Label>Published On</Label>
            <div className="space-y-2 rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="publishMode"
                  checked={form.publishMode === "now"}
                  onChange={() =>
                    setForm((prev) => ({ ...prev, publishMode: "now" }))
                  }
                />
                Publish now
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="publishMode"
                  checked={form.publishMode === "schedule"}
                  onChange={() =>
                    setForm((prev) => ({ ...prev, publishMode: "schedule" }))
                  }
                />
                Schedule
              </label>
              {form.publishMode === "schedule" ? (
                <div className="grid gap-2 sm:grid-cols-[1fr_120px]">
                  <div className="relative">
                    <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <Input
                      type="date"
                      value={form.scheduleDate}
                      onChange={(event) =>
                        setForm((prev) => ({
                          ...prev,
                          scheduleDate: event.target.value,
                        }))
                      }
                      className="pl-9"
                    />
                  </div>
                  <Input
                    type="time"
                    value={form.scheduleTime}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        scheduleTime: event.target.value,
                      }))
                    }
                  />
                </div>
              ) : null}
            </div>
          </div>

          <Button
            className="w-full rounded-full bg-blue-600 text-white hover:bg-blue-700"
            onClick={handleSubmit}
            disabled={isPending}
          >
            Publish Post
            <SendHorizonal className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>

      <input
        ref={coverInputRef}
        type="file"
        accept="image/png,image/jpeg,image/jpg"
        className="hidden"
        onChange={handleCoverChange}
      />
      <input
        ref={inlineInputRef}
        type="file"
        accept="image/png,image/jpeg,image/jpg"
        className="hidden"
        onChange={handleInlineImage}
        disabled={isUploadingInline}
      />
    </div>
  );
}
