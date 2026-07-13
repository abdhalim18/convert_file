"use client";

import { useState } from "react";
import { Presentation, Info } from "lucide-react";
import { Dropzone } from "@/components/Dropzone";
import { FileListItem } from "@/components/FileListItem";
import { Button } from "@/components/Button";
import { ErrorBanner } from "@/components/ErrorBanner";
import { ResultPanel, type ResultFile } from "@/components/ResultPanel";
import { convertPdfToPptx } from "@/lib/pdfToPptx";

export function PdfToPowerpointTool() {
  const [file, setFile] = useState<File | null>(null);
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
      const blob = await convertPdfToPptx(file);
      setResult([{ name: file.name.replace(/\.pdf$/i, ".pptx"), blob }]);
    } catch {
      setError("Gagal mengonversi PDF. Pastikan file valid dan tidak rusak.");
    } finally {
      setProcessing(false);
    }
  }

  if (result) {
    return <ResultPanel files={result} onReset={reset} />;
  }

  return (
    <div className="space-y-5">
      <div className="flex items-start gap-2.5 rounded-xl border border-border bg-muted px-4 py-3 text-sm text-muted-foreground">
        <Info className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
        <span>
          Setiap halaman PDF menjadi satu slide berisi gambar halaman tersebut, jadi
          tampilannya identik dengan aslinya — namun teks di dalamnya tidak bisa diedit
          langsung di PowerPoint.
        </span>
      </div>

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

          <Button size="lg" className="w-full" loading={processing} onClick={handleConvert}>
            <Presentation className="size-4" aria-hidden="true" />
            Konversi ke PowerPoint
          </Button>
        </>
      )}
    </div>
  );
}
