"use client";

import { useState, useTransition } from "react";
import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { searchClients } from "../actions/search-clients";

type SearchResult = Awaited<ReturnType<typeof searchClients>>;

export function AdminSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult>([]);
  const [isPending, startTransition] = useTransition();

  const handleChange = (value: string) => {
    setQuery(value);
    const trimmed = value.trim();
    if (trimmed.length < 2) {
      setResults([]);
      return;
    }

    startTransition(async () => {
      const data = await searchClients(trimmed);
      setResults(data);
    });
  };

  return (
    <div className="relative">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      <Input
        value={query}
        onChange={(event) => handleChange(event.target.value)}
        placeholder="Search clients..."
        className="h-10 rounded-full border-slate-200 bg-white/80 pl-10 pr-4 text-sm shadow-sm focus-visible:ring-blue-500 dark:border-slate-800 dark:bg-slate-900/80"
      />
      <div
        className={cn(
          "absolute left-0 right-0 mt-2 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl transition-opacity dark:border-slate-800 dark:bg-slate-900",
          query.trim().length >= 2 ? "opacity-100" : "pointer-events-none opacity-0"
        )}
      >
        <div className="max-h-72 overflow-y-auto">
          {isPending ? (
            <div className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400">
              Searching clients...
            </div>
          ) : results.length ? (
            results.map((client) => (
              <div
                key={client.id}
                className="flex flex-col gap-1 border-b border-slate-100 px-4 py-3 text-sm last:border-b-0 dark:border-slate-800"
              >
                <span className="font-semibold text-slate-900 dark:text-white">
                  {client.firstName} {client.lastName}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {client.email ?? "No email"} · {client.telephone}
                </span>
              </div>
            ))
          ) : (
            <div className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400">
              No clients found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
