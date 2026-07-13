"use client";

import { useRef, useState } from "react";
import { FileType, FileText } from "lucide-react";
import { Button } from "@/components/Button";
import { ErrorBanner } from "@/components/ErrorBanner";
import { ResumeForm } from "@/components/ResumeForm";
import { ResumePreview } from "@/components/ResumePreview";
import { downloadBlob } from "@/lib/download";
import { createEmptyResume, exportResumeToDocx, exportResumeToPdf } from "@/lib/resume";

export function ResumeBuilderTool() {
  const [data, setData] = useState(createEmptyResume());
  const [exporting, setExporting] = useState<"pdf" | "docx" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  const canExport = data.fullName.trim().length > 0;
  const fileBase = data.fullName.trim() ? data.fullName.trim().replace(/\s+/g, "-") : "resume";

  async function handleExportPdf() {
    if (!previewRef.current) return;
    setExporting("pdf");
    setError(null);
    try {
      const blob = await exportResumeToPdf(previewRef.current);
      downloadBlob(blob, `${fileBase}.pdf`);
    } catch {
      setError("Gagal membuat PDF. Coba lagi.");
    } finally {
      setExporting(null);
    }
  }

  async function handleExportDocx() {
    setExporting("docx");
    setError(null);
    try {
      const blob = await exportResumeToDocx(data);
      downloadBlob(blob, `${fileBase}.docx`);
    } catch {
      setError("Gagal membuat file Word. Coba lagi.");
    } finally {
      setExporting(null);
    }
  }

  return (
    <div className="space-y-5">
      {error && <ErrorBanner message={error} />}

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div>
          <ResumeForm data={data} onChange={setData} />

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Button
              size="lg"
              className="w-full sm:w-auto"
              disabled={!canExport}
              loading={exporting === "pdf"}
              onClick={handleExportPdf}
            >
              <FileType className="size-4" aria-hidden="true" />
              Unduh sebagai PDF
            </Button>
            <Button
              size="lg"
              variant="secondary"
              className="w-full sm:w-auto"
              disabled={!canExport}
              loading={exporting === "docx"}
              onClick={handleExportDocx}
            >
              <FileText className="size-4" aria-hidden="true" />
              Unduh sebagai Word
            </Button>
          </div>
        </div>

        <div className="lg:sticky lg:top-6 lg:self-start">
          <div className="rounded-2xl border border-border bg-muted p-4">
            <div className="overflow-hidden rounded-lg shadow-sm">
              <ResumePreview ref={previewRef} data={data} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
