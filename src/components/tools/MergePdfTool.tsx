"use client";

import { useState } from "react";
import { Combine } from "lucide-react";
import { Dropzone } from "@/components/Dropzone";
import { FileListItem } from "@/components/FileListItem";
import { Button } from "@/components/Button";
import { ErrorBanner } from "@/components/ErrorBanner";
import { ResultPanel, type ResultFile } from "@/components/ResultPanel";
import { mergePdfs } from "@/lib/pdf";

export function MergePdfTool() {
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

  async function handleMerge() {
    setProcessing(true);
    setError(null);
    try {
      const blob = await mergePdfs(files);
      setResult([{ name: "dokumen-gabungan.pdf", blob }]);
    } catch {
      setError("Gagal menggabungkan PDF. Pastikan semua file valid dan tidak rusak.");
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
        accept={["application/pdf"]}
        multiple
        onFiles={(f) => setFiles((prev) => [...prev, ...f])}
        label="Seret beberapa PDF ke sini, atau klik untuk memilih"
        hint="Anda bisa memilih lebih dari satu file sekaligus"
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

          <Button
            size="lg"
            className="w-full"
            disabled={files.length < 2}
            loading={processing}
            onClick={handleMerge}
          >
            <Combine className="size-4" aria-hidden="true" />
            Gabung {files.length} PDF
          </Button>
          {files.length < 2 && (
            <p className="text-center text-sm text-muted-foreground">
              Tambahkan minimal 2 file PDF untuk digabungkan.
            </p>
          )}
        </>
      )}
    </div>
  );
}
