import { ShieldCheck } from "lucide-react";
import { Logo } from "@/components/Logo";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-border bg-surface">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          <Logo />
          <div className="flex items-center gap-2 rounded-lg bg-muted px-3 py-2 text-sm text-muted-foreground">
            <ShieldCheck className="size-4 shrink-0 text-primary" aria-hidden="true" />
            <span>Semua proses berjalan di browser Anda — file tidak diunggah ke server mana pun.</span>
          </div>
        </div>
        <p className="mt-6 text-sm text-muted-foreground">
          © {new Date().getFullYear()} Konverta. Dibuat untuk kemudahan mengelola file Anda.
        </p>
      </div>
    </footer>
  );
}
