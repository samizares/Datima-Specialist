"use client";

import { Moon, Sun } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useAdminTheme } from "./admin-theme-provider";

export function AdminThemeSwitcher() {
  const { theme, toggleTheme } = useAdminTheme();

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggleTheme}
      className="border-slate-200 bg-white/70 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900"
    >
      <Sun
        className={[
          "h-4 w-4 transition-all",
          theme === "dark" ? "-rotate-90 scale-0" : "rotate-0 scale-100",
        ].join(" ")}
      />
      <Moon
        className={[
          "absolute h-4 w-4 transition-transform",
          theme === "dark" ? "rotate-0 scale-100" : "rotate-90 scale-0",
        ].join(" ")}
      />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
