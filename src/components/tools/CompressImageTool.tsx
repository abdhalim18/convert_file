"use client";

import { useState } from "react";
import { Minimize2 } from "lucide-react";
import { Dropzone } from "@/components/Dropzone";
import { FileListItem } from "@/components/FileListItem";
import { Button } from "@/components/Button";
import { ErrorBanner } from "@/components/ErrorBanner";
import { ResultPanel, type ResultFile } from "@/components/ResultPanel";
import { compressImage } from "@/lib/image";

export function CompressImageTool() {
  const [files, setFiles] = useState<File[]>([]);
  const [quality, setQuality] = useState(70);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ResultFile[] | null>(null);

  function reset() {
    setFiles([]);
    setResult(null);
    setError(null);
  }

  async function handleCompress() {
    setProcessing(true);
    setError(null);
    try {
      const compressed = await Promise.all(
        files.map((f) => compressImage(f, quality / 100)),
      );
      setResult(compressed);
    } catch {
      setError("Gagal mengompres gambar. Pastikan semua file valid.");
    } finally {
      setProcessing(false);
    }
  }

  if (result) {
    return <ResultPanel files={result} onReset={reset} zipName="hasil-kompres-gambar.zip" />;
  }

  return (
    <div className="space-y-5">
      <Dropzone
        accept={["image/jpeg", "image/png", "image/webp"]}
        multiple
        onFiles={(f) => setFiles((prev) => [...prev, ...f])}
        label="Seret gambar ke sini, atau klik untuk memilih"
        hint="Format yang didukung: JPG, PNG, WebP"
      />

      {error && <ErrorBanner message={error} />}

      {files.length > 0 && (
        <>
          <ul className="space-y-2">
            {files.map((file, i) => (
              <FileListItem
                key={`${file.name}-${i}`}
                file={file}
                onRemove={() => setFiles((prev) => prev.filter((_, idx) => idx !== i))}
              />
            ))}
          </ul>

          <div className="rounded-2xl border border-border bg-surface p-5">
            <div className="flex items-center justify-between">
              <label htmlFor="quality" className="text-sm font-medium text-foreground">
                Kualitas gambar
              </label>
              <span className="text-sm font-semibold text-primary">{quality}%</span>
            </div>
            <input
              id="quality"
              type="range"
              min={10}
              max={95}
              value={quality}
              onChange={(e) => setQuality(Number(e.target.value))}
              className="mt-3 w-full cursor-pointer accent-primary"
            />
            <p className="mt-2 text-xs text-muted-foreground">
              Kualitas lebih rendah menghasilkan ukuran file lebih kecil.
            </p>
          </div>

          <Button size="lg" className="w-full" loading={processing} onClick={handleCompress}>
            <Minimize2 className="size-4" aria-hidden="true" />
            Kompres {files.length} gambar
          </Button>
        </>
      )}
    </div>
  );
}
