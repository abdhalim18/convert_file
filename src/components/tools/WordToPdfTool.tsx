"use client";

import { useState } from "react";
import { FileType, Info } from "lucide-react";
import { Dropzone } from "@/components/Dropzone";
import { FileListItem } from "@/components/FileListItem";
import { Button } from "@/components/Button";
import { ErrorBanner } from "@/components/ErrorBanner";
import { ResultPanel, type ResultFile } from "@/components/ResultPanel";
import { convertWordToPdf } from "@/lib/word";

const DOCX_TYPE =
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

export function WordToPdfTool() {
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
      const blob = await convertWordToPdf(file);
      setResult([{ name: file.name.replace(/\.docx$/i, ".pdf"), blob }]);
    } catch {
      setError(
        "Gagal mengonversi dokumen. Pastikan file berformat .docx dan tidak rusak.",
      );
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
          Hanya mendukung file <span className="font-medium text-foreground">.docx</span>.
          Tata letak kompleks (kolom, header/footer, tabel rumit) bisa sedikit berbeda
          dari dokumen asli.
        </span>
      </div>

      {!file && (
        <Dropzone
          accept={[DOCX_TYPE]}
          multiple={false}
          onFiles={(f) => setFile(f[0])}
          label="Seret satu file .docx ke sini, atau klik untuk memilih"
        />
      )}

      {error && <ErrorBanner message={error} />}

      {file && (
        <>
          <ul className="space-y-2">
            <FileListItem file={file} onRemove={reset} />
          </ul>

          <Button size="lg" className="w-full" loading={processing} onClick={handleConvert}>
            <FileType className="size-4" aria-hidden="true" />
            Konversi ke PDF
          </Button>
        </>
      )}
    </div>
  );
}
