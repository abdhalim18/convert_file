"use client";

import { useState } from "react";
import { Combine } from "lucide-react";
import { Dropzone } from "@/components/Dropzone";
import { FileListItem } from "@/components/FileListItem";
import { Button } from "@/components/Button";
import { ErrorBanner } from "@/components/ErrorBanner";
import { ResultPanel, type ResultFile } from "@/components/ResultPanel";
import { mergeImages } from "@/lib/image";

export function MergeJpgTool() {
  const [files, setFiles] = useState<File[]>([]);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ResultFile[] | null>(null);
  const [direction, setDirection] = useState<'vertical' | 'horizontal'>('vertical');

  function reset() {
    setFiles([]);
    setResult(null);
    setError(null);
  }

  function move(index: number, directionIndex: -1 | 1) {
    setFiles((prev) => {
      const next = [...prev];
      const target = index + directionIndex;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  async function handleMerge() {
    setProcessing(true);
    setError(null);
    try {
      const { name, blob } = await mergeImages(files, direction);
      setResult([{ name, blob }]);
    } catch {
      setError("Gagal menggabungkan gambar. Pastikan semua gambar valid.");
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

          <div className="flex items-center gap-4 py-2">
            <label className="text-sm font-medium text-foreground">Arah Gabung:</label>
            <select 
              value={direction} 
              onChange={(e) => setDirection(e.target.value as 'vertical' | 'horizontal')}
              className="rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="vertical">Vertikal (Atas ke Bawah)</option>
              <option value="horizontal">Horizontal (Kiri ke Kanan)</option>
            </select>
          </div>

          <Button size="lg" className="w-full" loading={processing} onClick={handleMerge}>
            <Combine className="size-4" aria-hidden="true" />
            Gabung {files.length} gambar
          </Button>
        </>
      )}
    </div>
  );
}
