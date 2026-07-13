"use client";

import { useState } from "react";
import { RotateCw } from "lucide-react";
import { Dropzone } from "@/components/Dropzone";
import { FileListItem } from "@/components/FileListItem";
import { Button } from "@/components/Button";
import { ErrorBanner } from "@/components/ErrorBanner";
import { ResultPanel, type ResultFile } from "@/components/ResultPanel";
import { rotatePdf } from "@/lib/pdf";
import clsx from "clsx";

const ANGLES = [90, 180, 270] as const;

export function RotatePdfTool() {
  const [file, setFile] = useState<File | null>(null);
  const [angle, setAngle] = useState<(typeof ANGLES)[number]>(90);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ResultFile[] | null>(null);

  function reset() {
    setFile(null);
    setResult(null);
    setError(null);
  }

  async function handleRotate() {
    if (!file) return;
    setProcessing(true);
    setError(null);
    try {
      const blob = await rotatePdf(file, angle);
      setResult([{ name: file.name.replace(/\.pdf$/i, "_putar.pdf"), blob }]);
    } catch {
      setError("Gagal memutar PDF. Pastikan file valid dan tidak rusak.");
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

          <div>
            <p className="mb-2 text-sm font-medium text-foreground">Pilih sudut putar</p>
            <div className="flex gap-2">
              {ANGLES.map((a) => (
                <button
                  key={a}
                  type="button"
                  onClick={() => setAngle(a)}
                  className={clsx(
                    "flex-1 cursor-pointer rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    angle === a
                      ? "border-primary bg-muted text-primary"
                      : "border-border text-foreground hover:bg-muted",
                  )}
                >
                  {a}°
                </button>
              ))}
            </div>
          </div>

          <Button size="lg" className="w-full" loading={processing} onClick={handleRotate}>
            <RotateCw className="size-4" aria-hidden="true" />
            Putar PDF
          </Button>
        </>
      )}
    </div>
  );
}
