"use client";

import { useState } from "react";
import { Minimize2 } from "lucide-react";
import { Dropzone } from "@/components/Dropzone";
import { FileListItem } from "@/components/FileListItem";
import { Button } from "@/components/Button";
import { ErrorBanner } from "@/components/ErrorBanner";
import { ResultPanel, type ResultFile } from "@/components/ResultPanel";
import { compressPdf } from "@/lib/pdf";

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`;
}

export function CompressPdfTool() {
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ResultFile[] | null>(null);
  const [savedPct, setSavedPct] = useState<number | null>(null);

  function reset() {
    setFile(null);
    setResult(null);
    setError(null);
    setSavedPct(null);
  }

  async function handleCompress() {
    if (!file) return;
    setProcessing(true);
    setError(null);
    try {
      const blob = await compressPdf(file);
      const pct = Math.max(0, Math.round((1 - blob.size / file.size) * 100));
      setSavedPct(pct);
      setResult([{ name: file.name.replace(/\.pdf$/i, "_kompres.pdf"), blob }]);
    } catch {
      setError("Gagal mengompres PDF. Pastikan file valid dan tidak rusak.");
    } finally {
      setProcessing(false);
    }
  }

  if (result) {
    return (
      <div className="space-y-4">
        {savedPct !== null && (
          <p className="rounded-xl bg-muted px-4 py-3 text-sm text-foreground">
            {savedPct > 0
              ? `Ukuran file berkurang sekitar ${savedPct}%.`
              : "File sudah cukup optimal, ukuran tidak banyak berubah."}
          </p>
        )}
        <ResultPanel files={result} onReset={reset} />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {!file && (
        <Dropzone
          accept={["application/pdf"]}
          multiple={false}
          onFiles={(f) => setFile(f[0])}
          label="Seret satu PDF ke sini, atau klik untuk memilih"
        />
      )}

      {error && <ErrorBanner message={error} />}

      {file && (
        <>
          <ul className="space-y-2">
            <FileListItem file={file} onRemove={reset} />
          </ul>
          <p className="text-sm text-muted-foreground">
            Ukuran saat ini: <span className="font-medium text-foreground">{formatBytes(file.size)}</span>
          </p>
          <Button size="lg" className="w-full" loading={processing} onClick={handleCompress}>
            <Minimize2 className="size-4" aria-hidden="true" />
            Kompres PDF
          </Button>
        </>
      )}
    </div>
  );
}
