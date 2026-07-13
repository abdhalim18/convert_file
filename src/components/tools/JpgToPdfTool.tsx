"use client";

import { useState } from "react";
import { FileImage } from "lucide-react";
import { Dropzone } from "@/components/Dropzone";
import { FileListItem } from "@/components/FileListItem";
import { Button } from "@/components/Button";
import { ErrorBanner } from "@/components/ErrorBanner";
import { ResultPanel, type ResultFile } from "@/components/ResultPanel";
import { imagesToPdf } from "@/lib/pdf";

export function JpgToPdfTool() {
  const [files, setFiles] = useState<File[]>([]);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ResultFile[] | null>(null);

  function reset() {
    setFiles([]);
    setResult(null);
    setError(null);
  }

  function move(index: number, direction: -1 | 1) {
    setFiles((prev) => {
      const next = [...prev];
      const target = index + direction;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  async function handleConvert() {
    setProcessing(true);
    setError(null);
    try {
      const blob = await imagesToPdf(files);
      setResult([{ name: "gambar-ke-pdf.pdf", blob }]);
    } catch {
      setError("Gagal membuat PDF. Pastikan semua gambar valid.");
    } finally {
      setProcessing(false);
    }
  }

  if (result) {
    return <ResultPanel files={result} onReset={reset} />;
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
                onMoveUp={i > 0 ? () => move(i, -1) : undefined}
                onMoveDown={i < files.length - 1 ? () => move(i, 1) : undefined}
              />
            ))}
          </ul>

          <Button size="lg" className="w-full" loading={processing} onClick={handleConvert}>
            <FileImage className="size-4" aria-hidden="true" />
            Buat PDF dari {files.length} gambar
          </Button>
        </>
      )}
    </div>
  );
}
