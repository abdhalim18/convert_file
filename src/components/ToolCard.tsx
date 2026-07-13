import Link from "next/link";
import type { ToolDef } from "@/lib/tools";

export function ToolCard({ tool }: { tool: ToolDef }) {
  const Icon = tool.icon;
  const isSoon = tool.status === "soon";

  const content = (
    <>
      <span className="inline-flex size-11 items-center justify-center rounded-xl bg-muted text-primary transition-colors duration-150 group-hover:bg-primary group-hover:text-on-primary">
        <Icon className="size-5" aria-hidden="true" />
      </span>
      <span className="mt-4 flex items-center gap-2">
        <span className="text-base font-semibold text-foreground">{tool.name}</span>
        {isSoon && (
          <span className="rounded-full bg-accent/15 px-2 py-0.5 text-xs font-medium text-accent">
            Segera hadir
          </span>
        )}
      </span>
      <span className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
        {tool.description}
      </span>
    </>
  );

  if (isSoon) {
    return (
      <div
        className="group flex cursor-not-allowed flex-col rounded-2xl border border-border bg-surface p-5 opacity-70"
        aria-disabled="true"
      >
        {content}
      </div>
    );
  }

  return (
    <Link
      href={`/tools/${tool.slug}`}
      className="group flex cursor-pointer flex-col rounded-2xl border border-border bg-surface p-5 transition-colors duration-150 hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      {content}
    </Link>
  );
}
