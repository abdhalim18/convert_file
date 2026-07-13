import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import type { ToolDef } from "@/lib/tools";

export function ToolShell({ tool, children }: { tool: ToolDef; children: React.ReactNode }) {
  const Icon = tool.icon;
  return (
    <>
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors duration-150 hover:text-foreground"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            Semua alat
          </Link>

          <div className="mt-6 flex items-start gap-4">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-muted text-primary">
              <Icon className="size-6" aria-hidden="true" />
            </span>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                {tool.name}
              </h1>
              <p className="mt-1 text-muted-foreground">{tool.description}</p>
            </div>
          </div>

          <div className="mt-8">{children}</div>
        </div>
      </main>
      <Footer />
    </>
  );
}
