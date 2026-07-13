"use client";

import { useState } from "react";
import { BellRing, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/Button";

export function ComingSoon({ toolName }: { toolName: string }) {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-border bg-surface px-6 py-16 text-center">
      <span className="flex size-14 items-center justify-center rounded-full bg-accent/15 text-accent">
        <BellRing className="size-6" aria-hidden="true" />
      </span>
      <h2 className="mt-4 text-lg font-semibold text-foreground">
        {toolName} sedang kami siapkan
      </h2>
      <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">
        Fitur ini akan segera hadir. Tinggalkan email Anda dan kami akan memberi tahu
        begitu alat ini siap digunakan.
      </p>

      {submitted ? (
        <p className="mt-6 flex items-center gap-2 text-sm font-medium text-primary">
          <CheckCircle2 className="size-4" aria-hidden="true" />
          Terima kasih, kami akan mengabari Anda.
        </p>
      ) : (
        <form
          className="mt-6 flex w-full max-w-sm flex-col gap-3 sm:flex-row"
          onSubmit={(e) => {
            e.preventDefault();
            if (email.trim()) setSubmitted(true);
          }}
        >
          <label htmlFor="notify-email" className="sr-only">
            Email
          </label>
          <input
            id="notify-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="nama@email.com"
            className="h-11 flex-1 rounded-lg border border-border bg-background px-4 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          <Button type="submit">Beritahu saya</Button>
        </form>
      )}
    </div>
  );
}
