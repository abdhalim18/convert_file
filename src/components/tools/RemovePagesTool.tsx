"use client";

import { useEffect, useState } from "react";
import { FileMinus } from "lucide-react";
import { Dropzone } from "@/components/Dropzone";
import { FileListItem } from "@/components/FileListItem";
import { Button } from "@/components/Button";
import { ErrorBanner } from "@/components/ErrorBanner";
import { ResultPanel, type ResultFile } from "@/components/ResultPanel";
import { getPdfPageCount, removePages } from "@/lib/pdf";

function parsePages(input: string, maxPage: number): number[] | null {
  const parts = input
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean);
  if (parts.length === 0) return null;

  const pages = new Set<number>();
  for (const part of parts) {
    if (!/^\d+$/.test(part)) return null;
    const n = Number(part);
    if (n < 1 || n > maxPage) return null;
    pages.add(n);
  }
  return [...pages];
}

export function RemovePagesTool() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number | null>(null);
  const [pagesInput, setPagesInput] = useState("");
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ResultFile[] | null>(null);

  useEffect(() => {
    if (!file) return;
    let cancelled = false;
    getPdfPageCount(file)
      .then((count) => !cancelled && setPageCount(count))
      .catch(() => !cancelled && setError("File PDF tidak dapat dibaca."));
    return () => {
      cancelled = true;
    };
  }, [file]);

  function reset() {
    setFile(null);
    setPageCount(null);
    setPagesInput("");
    setResult(null);
    setError(null);
  }

  async function handleRemove() {
    if (!file || !pageCount) return;
    const pages = parsePages(pagesInput, pageCount);
    if (!pages) {
      setError(`Masukkan nomor halaman yang valid, contoh: 2, 4, 7 (1-${pageCount}).`);
      return;
    }
    if (pages.length >= pageCount) {
      setError("Tidak bisa menghapus seluruh halaman dokumen.");
      return;
    }
    setProcessing(true);
    setError(null);
    try {
      const blob = await removePages(file, pages);
      setResult([{ name: file.name.replace(/\.pdf$/i, "_edit.pdf"), blob }]);
    } catch {
      setError("Gagal menghapus halaman. Pastikan file valid dan tidak rusak.");
    } finally {
      setProcessing(false);
    }
  }

  if (result) {
    return <ResultPanel files={result} onReset={reset} />;
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

          {pageCount && (
            <div className="space-y-2 rounded-2xl border border-border bg-surface p-5">
              <p className="text-sm text-muted-foreground">
                Dokumen memiliki <span className="font-semibold text-foreground">{pageCount}</span> halaman.
              </p>
              <label htmlFor="pages-to-remove" className="block text-sm font-medium text-foreground">
                Nomor halaman yang dihapus
              </label>
              <input
                id="pages-to-remove"
                type="text"
                value={pagesInput}
                onChange={(e) => setPagesInput(e.target.value)}
                placeholder={`contoh: 2, 4, 7`}
                className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
          )}

          <Button size="lg" className="w-full" loading={processing} onClick={handleRemove}>
            <FileMinus className="size-4" aria-hidden="true" />
            Hapus Halaman
          </Button>
        </>
      )}
    </div>
  );
}
