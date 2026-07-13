"use client";

import { useState } from "react";
import { ImageDown } from "lucide-react";
import { Dropzone } from "@/components/Dropzone";
import { FileListItem } from "@/components/FileListItem";
import { Button } from "@/components/Button";
import { ErrorBanner } from "@/components/ErrorBanner";
import { ResultPanel, type ResultFile } from "@/components/ResultPanel";
import { pdfToImages } from "@/lib/pdf";
import clsx from "clsx";

type Format = "image/jpeg" | "image/png";

export function PdfToJpgTool() {
  const [file, setFile] = useState<File | null>(null);
  const [format, setFormat] = useState<Format>("image/jpeg");
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ResultFile[] | null>(null);

  function reset() {
    setFile(null);
    setResult(null);
    setError(null);
  }

  async function handleConvert() {
    if (!file) return;
    setProcessing(true);
    setError(null);
    try {
      const images = await pdfToImages(file, format);
      setResult(images);
    } catch {
      setError("Gagal mengonversi PDF ke gambar. Pastikan file valid dan tidak rusak.");
    } finally {
      setProcessing(false);
    }
  }

  if (result) {
    return <ResultPanel files={result} onReset={reset} zipName="hasil-pdf-ke-gambar.zip" />;
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

          <div>
            <p className="mb-2 text-sm font-medium text-foreground">Format keluaran</p>
            <div className="flex gap-2">
              {(["image/jpeg", "image/png"] as const).map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFormat(f)}
                  className={clsx(
                    "flex-1 cursor-pointer rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    format === f
                      ? "border-primary bg-muted text-primary"
                      : "border-border text-foreground hover:bg-muted",
                  )}
                >
                  {f === "image/jpeg" ? "JPG" : "PNG"}
                </button>
              ))}
            </div>
          </div>

          <Button size="lg" className="w-full" loading={processing} onClick={handleConvert}>
            <ImageDown className="size-4" aria-hidden="true" />
            Konversi ke Gambar
          </Button>
        </>
      )}
    </div>
  );
}
