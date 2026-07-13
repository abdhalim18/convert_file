"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { categoryLabels, tools, type ToolCategory } from "@/lib/tools";
import { ToolCard } from "@/components/ToolCard";

export function HomeToolGrid() {
  const [query, setQuery] = useState("");

  const grouped = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = q
      ? tools.filter(
          (t) =>
            t.name.toLowerCase().includes(q) ||
            t.description.toLowerCase().includes(q),
        )
      : tools;

    return (Object.keys(categoryLabels) as ToolCategory[]).map((category) => ({
      category,
      items: filtered.filter((t) => t.category === category),
    }));
  }, [query]);

  const hasResults = grouped.some((g) => g.items.length > 0);

  return (
    <div>
      <div className="mx-auto max-w-xl">
        <label htmlFor="tool-search" className="sr-only">
          Cari alat
        </label>
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <input
            id="tool-search"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari alat, contoh: gabung PDF"
            className="h-12 w-full rounded-xl border border-border bg-surface pl-12 pr-4 text-base text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
      </div>

      <div className="mt-14 space-y-14">
        {!hasResults && (
          <p className="text-center text-muted-foreground">
            Tidak ada alat yang cocok dengan &ldquo;{query}&rdquo;.
          </p>
        )}
        {grouped.map(
          ({ category, items }) =>
            items.length > 0 && (
              <section key={category} id={category} className="scroll-mt-24">
                <h2 className="text-xl font-bold text-foreground">
                  {categoryLabels[category]}
                </h2>
                <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {items.map((tool) => (
                    <ToolCard key={tool.slug} tool={tool} />
                  ))}
                </div>
              </section>
            ),
        )}
      </div>
    </div>
  );
}
