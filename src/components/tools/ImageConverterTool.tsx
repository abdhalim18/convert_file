"use client";

import { useState } from "react";
import { Images } from "lucide-react";
import { Dropzone } from "@/components/Dropzone";
import { FileListItem } from "@/components/FileListItem";
import { Button } from "@/components/Button";
import { ErrorBanner } from "@/components/ErrorBanner";
import { ResultPanel, type ResultFile } from "@/components/ResultPanel";
import { convertImage, type ImageFormat } from "@/lib/image";
import clsx from "clsx";

const FORMATS: { value: ImageFormat; label: string }[] = [
  { value: "image/jpeg", label: "JPG" },
  { value: "image/png", label: "PNG" },
  { value: "image/webp", label: "WebP" },
];

export function ImageConverterTool() {
  const [files, setFiles] = useState<File[]>([]);
  const [format, setFormat] = useState<ImageFormat>("image/webp");
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ResultFile[] | null>(null);

  function reset() {
    setFiles([]);
    setResult(null);
    setError(null);
  }

  async function handleConvert() {
    setProcessing(true);
    setError(null);
    try {
      const converted = await Promise.all(files.map((f) => convertImage(f, format)));
      setResult(converted);
    } catch {
      setError("Gagal mengonversi gambar. Pastikan semua file valid.");
    } finally {
      setProcessing(false);
    }
  }

  if (result) {
    return <ResultPanel files={result} onReset={reset} zipName="hasil-konversi-gambar.zip" />;
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

          <div>
            <p className="mb-2 text-sm font-medium text-foreground">Konversi ke</p>
            <div className="flex gap-2">
              {FORMATS.map((f) => (
                <button
                  key={f.value}
                  type="button"
                  onClick={() => setFormat(f.value)}
                  className={clsx(
                    "flex-1 cursor-pointer rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    format === f.value
                      ? "border-primary bg-muted text-primary"
                      : "border-border text-foreground hover:bg-muted",
                  )}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <Button size="lg" className="w-full" loading={processing} onClick={handleConvert}>
            <Images className="size-4" aria-hidden="true" />
            Konversi {files.length} gambar
          </Button>
        </>
      )}
    </div>
  );
}
