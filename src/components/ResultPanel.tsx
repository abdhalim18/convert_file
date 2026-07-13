"use client";

import { CheckCircle2, Download, FileDown, RotateCcw } from "lucide-react";
import { Button } from "@/components/Button";
import { downloadAsZip, downloadBlob } from "@/lib/download";

export interface ResultFile {
  name: string;
  blob: Blob;
}

interface ResultPanelProps {
  files: ResultFile[];
  zipName?: string;
  onReset: () => void;
}

export function ResultPanel({ files, zipName = "hasil-konverta.zip", onReset }: ResultPanelProps) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-6">
      <div className="flex items-center gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
          <CheckCircle2 className="size-5" aria-hidden="true" />
        </span>
        <div>
          <p className="font-semibold text-foreground">Selesai diproses</p>
          <p className="text-sm text-muted-foreground">
            {files.length === 1 ? "1 file siap diunduh." : `${files.length} file siap diunduh.`}
          </p>
        </div>
      </div>

      <ul className="mt-5 space-y-2">
        {files.map((file, i) => (
          <li
            key={`${file.name}-${i}`}
            className="flex items-center justify-between gap-3 rounded-xl border border-border bg-background px-4 py-3"
          >
            <span className="flex min-w-0 items-center gap-2.5">
              <FileDown className="size-4 shrink-0 text-primary" aria-hidden="true" />
              <span className="truncate text-sm font-medium text-foreground">{file.name}</span>
            </span>
            <button
              type="button"
              onClick={() => downloadBlob(file.blob, file.name)}
              className="inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium text-primary transition-colors duration-150 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Download className="size-4" aria-hidden="true" />
              Unduh
            </button>
          </li>
        ))}
      </ul>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        {files.length > 1 && (
          <Button
            variant="primary"
            onClick={() => downloadAsZip(files, zipName)}
            className="w-full sm:w-auto"
          >
            <Download className="size-4" aria-hidden="true" />
            Unduh semua (.zip)
          </Button>
        )}
        <Button variant="secondary" onClick={onReset} className="w-full sm:w-auto">
          <RotateCcw className="size-4" aria-hidden="true" />
          Proses file lain
        </Button>
      </div>
    </div>
  );
}
