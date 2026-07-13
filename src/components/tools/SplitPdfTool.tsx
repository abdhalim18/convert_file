"use client";

import { useEffect, useState } from "react";
import { Scissors } from "lucide-react";
import { Dropzone } from "@/components/Dropzone";
import { FileListItem } from "@/components/FileListItem";
import { Button } from "@/components/Button";
import { ErrorBanner } from "@/components/ErrorBanner";
import { ResultPanel, type ResultFile } from "@/components/ResultPanel";
import { getPdfPageCount, splitPdf, splitPdfEveryPage, type PageRange } from "@/lib/pdf";

type Mode = "every-page" | "custom";

function parseRanges(input: string, maxPage: number): PageRange[] | null {
  const parts = input
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean);
  if (parts.length === 0) return null;

  const ranges: PageRange[] = [];
  for (const part of parts) {
    const match = part.match(/^(\d+)(?:-(\d+))?$/);
    if (!match) return null;
    const start = Number(match[1]);
    const end = match[2] ? Number(match[2]) : start;
    if (start < 1 || end > maxPage || start > end) return null;
    ranges.push({ start, end });
  }
  return ranges;
}

export function SplitPdfTool() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number | null>(null);
  const [mode, setMode] = useState<Mode>("every-page");
  const [rangeInput, setRangeInput] = useState("");
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
    setRangeInput("");
    setMode("every-page");
    setResult(null);
    setError(null);
  }

  async function handleSplit() {
    if (!file) return;
    setError(null);

    if (mode === "custom") {
      const ranges = pageCount ? parseRanges(rangeInput, pageCount) : null;
      if (!ranges) {
        setError(
          `Format rentang tidak valid. Gunakan contoh "1-3, 5, 7-${pageCount ?? "N"}".`,
        );
        return;
      }
      setProcessing(true);
      try {
        const files = await splitPdf(file, ranges);
        setResult(files);
      } catch {
        setError("Gagal memisah PDF. Pastikan file valid dan tidak rusak.");
      } finally {
        setProcessing(false);
      }
      return;
    }

    setProcessing(true);
    try {
      const files = await splitPdfEveryPage(file);
      setResult(files);
    } catch {
      setError("Gagal memisah PDF. Pastikan file valid dan tidak rusak.");
    } finally {
      setProcessing(false);
    }
  }

  if (result) {
    return (
      <ResultPanel files={result} onReset={reset} zipName="hasil-pisah-pdf.zip" />
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

          {pageCount && (
            <div className="space-y-4 rounded-2xl border border-border bg-surface p-5">
              <p className="text-sm text-muted-foreground">
                Dokumen memiliki <span className="font-semibold text-foreground">{pageCount}</span> halaman.
              </p>

              <div className="space-y-3">
                <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-border p-3 has-[:checked]:border-primary has-[:checked]:bg-muted">
                  <input
                    type="radio"
                    name="split-mode"
                    className="mt-1 accent-primary"
                    checked={mode === "every-page"}
                    onChange={() => setMode("every-page")}
                  />
                  <span>
                    <span className="block text-sm font-medium text-foreground">
                      Pisah setiap halaman
                    </span>
                    <span className="block text-sm text-muted-foreground">
                      Menghasilkan {pageCount} file PDF terpisah (satu per halaman).
                    </span>
                  </span>
                </label>

                <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-border p-3 has-[:checked]:border-primary has-[:checked]:bg-muted">
                  <input
                    type="radio"
                    name="split-mode"
                    className="mt-1 accent-primary"
                    checked={mode === "custom"}
                    onChange={() => setMode("custom")}
                  />
                  <span className="w-full">
                    <span className="block text-sm font-medium text-foreground">Rentang kustom</span>
                    <span className="mt-1.5 block text-sm text-muted-foreground">
                      Pisahkan berdasarkan nomor halaman, contoh: 1-3, 5, 7-{pageCount}
                    </span>
                    {mode === "custom" && (
                      <input
                        type="text"
                        value={rangeInput}
                        onChange={(e) => setRangeInput(e.target.value)}
                        placeholder={`contoh: 1-3, 5, 7-${pageCount}`}
                        className="mt-2 h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      />
                    )}
                  </span>
                </label>
              </div>
            </div>
          )}

          <Button size="lg" className="w-full" loading={processing} onClick={handleSplit}>
            <Scissors className="size-4" aria-hidden="true" />
            Pisah PDF
          </Button>
        </>
      )}
    </div>
  );
}
