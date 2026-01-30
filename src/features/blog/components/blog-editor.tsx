"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import {
  Bold,
  Heading1,
  Heading2,
  Image as ImageIcon,
  Italic,
  Link2,
  List,
  ListOrdered,
  Underline,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type BlogEditorHandle = {
  insertImage: (url: string) => void;
};

type BlogEditorProps = {
  value: string;
  onChange: (value: string) => void;
  onRequestImage: () => void;
};

export const BlogEditor = forwardRef<BlogEditorHandle, BlogEditorProps>(
  ({ value, onChange, onRequestImage }, ref) => {
    const editorRef = useRef<HTMLDivElement | null>(null);
    const [isFocused, setIsFocused] = useState(false);

    useImperativeHandle(ref, () => ({
      insertImage: (url) => {
        editorRef.current?.focus();
        document.execCommand("insertImage", false, url);
        onChange(editorRef.current?.innerHTML ?? "");
      },
    }));

    useEffect(() => {
      if (!editorRef.current) return;
      if (editorRef.current.innerHTML !== value) {
        editorRef.current.innerHTML = value;
      }
    }, [value]);

    const applyCommand = (command: string, commandValue?: string) => {
      editorRef.current?.focus();
      document.execCommand(command, false, commandValue);
      onChange(editorRef.current?.innerHTML ?? "");
    };

    const isEmpty = !value || value === "<br>";

    return (
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 px-3 py-2 text-slate-500 dark:border-slate-800 dark:text-slate-400">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => applyCommand("formatBlock", "H1")}
          >
            <Heading1 className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => applyCommand("formatBlock", "H2")}
          >
            <Heading2 className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => applyCommand("bold")}
          >
            <Bold className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => applyCommand("italic")}
          >
            <Italic className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => applyCommand("underline")}
          >
            <Underline className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => applyCommand("insertUnorderedList")}
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => applyCommand("insertOrderedList")}
          >
            <ListOrdered className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => {
              const url = window.prompt("Enter a link URL");
              if (url) applyCommand("createLink", url);
            }}
          >
            <Link2 className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onRequestImage}
          >
            <ImageIcon className="h-4 w-4" />
          </Button>
        </div>
        <div
          ref={editorRef}
          contentEditable
          className={cn(
            "min-h-[220px] px-4 py-3 text-sm text-slate-700 outline-none dark:text-slate-200",
            isFocused ? "bg-white" : "bg-white",
            isEmpty && "before:pointer-events-none before:text-slate-400"
          )}
          data-placeholder="Write your post content here..."
          onInput={() => onChange(editorRef.current?.innerHTML ?? "")}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          suppressContentEditableWarning
        />
      </div>
    );
  }
);

BlogEditor.displayName = "BlogEditor";
