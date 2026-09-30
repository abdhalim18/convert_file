"use client";

import { useState } from "react";
import { Eraser } from "lucide-react";
import { Dropzone } from "@/components/Dropzone";
import { FileListItem } from "@/components/FileListItem";
import { Button } from "@/components/Button";
import { ErrorBanner } from "@/components/ErrorBanner";
import { ResultPanel, type ResultFile } from "@/components/ResultPanel";
import { removeBackground } from "@imgly/background-removal";

export function RemoveBgTool() {
  const [file, setFile] = useState<File | null>(null);
  const [bgColor, setBgColor] = useState("transparent");
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ResultFile[] | null>(null);
  const [statusText, setStatusText] = useState("");

  function reset() {
    setFile(null);
    setResult(null);
    setError(null);
    setStatusText("");
  }

  async function handleProcess() {
    if (!file) return;
    setProcessing(true);
    setError(null);
    setStatusText("Mengunduh model AI (hanya saat pertama kali)...");
    
    try {
      const blob = await removeBackground(file, {
        progress: (key, current, total) => {
          if (key === "compute:inference") {
            setStatusText("Memproses gambar...");
          } else {
            setStatusText(`Mempersiapkan model AI...`);
          }
        }
      });
      
      let finalBlob = blob;
      let ext = "png";
      
      if (bgColor !== "transparent") {
        setStatusText("Menerapkan warna background...");
        const url = URL.createObjectURL(blob);
        const img = await new Promise<HTMLImageElement>((resolve, reject) => {
          const el = new Image();
          el.onload = () => resolve(el);
          el.onerror = () => reject(new Error("Gagal memuat gambar"));
          el.src = url;
        });
        
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("Canvas tidak didukung");
        
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        
        finalBlob = await new Promise<Blob>((resolve, reject) => {
          canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Gagal konversi"))), "image/jpeg", 0.95);
        });
        
        URL.revokeObjectURL(url);
        ext = "jpg";
      }
      
      const outName = file.name.replace(/\.[^/.]+$/, "") + (bgColor === "transparent" ? "_nobg." : "_bg.") + ext;
      setResult([{ name: outName, blob: finalBlob }]);
    } catch (err: any) {
      console.error(err);
      setError("Gagal menghapus background. Pastikan gambar jelas dan valid.");
    } finally {
      setProcessing(false);
      setStatusText("");
    }
  }

  if (result) {
    return <ResultPanel files={result} onReset={reset} />;
  }

  return (
    <div className="space-y-5">
      {!file && (
        <Dropzone
          accept={["image/jpeg", "image/png", "image/webp"]}
          multiple={false}
          onFiles={(f) => setFile(f[0])}
          label="Seret gambar ke sini, atau klik untuk memilih"
          hint="Format yang didukung: JPG, PNG, WebP"
        />
      )}

      {error && <ErrorBanner message={error} />}

      {file && (
        <>
          <ul className="space-y-2">
            <FileListItem file={file} onRemove={reset} />
          </ul>

          <div className="rounded-2xl border border-border bg-surface p-5">
            <label className="mb-3 block text-sm font-medium text-foreground">
              Warna Latar Belakang
            </label>
            <div className="flex flex-wrap items-center gap-3">
              <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm transition-colors hover:bg-muted">
                <input
                  type="radio"
                  name="bg"
                  value="transparent"
                  checked={bgColor === "transparent"}
                  onChange={() => setBgColor("transparent")}
                  className="size-4 accent-primary"
                />
                <span className="block size-5 rounded-full border border-border" style={{ backgroundImage: "url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAAXNSR0IArs4c6QAAACVJREFUKFNjZCASMDKgAnv37v3/n4QMQDWDZACtFBoZGCgL0EwGABJNDzFj2H5cAAAAAElFTkSuQmCC')" }} />
                Transparan
              </label>
              
              <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm transition-colors hover:bg-muted">
                <input
                  type="radio"
                  name="bg"
                  value="#ffffff"
                  checked={bgColor === "#ffffff"}
                  onChange={() => setBgColor("#ffffff")}
                  className="size-4 accent-primary"
                />
                <span className="block size-5 rounded-full border border-border bg-[#ffffff]" />
                Putih
              </label>
              
              <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm transition-colors hover:bg-muted">
                <input
                  type="radio"
                  name="bg"
                  value="#000000"
                  checked={bgColor === "#000000"}
                  onChange={() => setBgColor("#000000")}
                  className="size-4 accent-primary"
                />
                <span className="block size-5 rounded-full border border-border bg-[#000000]" />
                Hitam
              </label>

              <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm transition-colors hover:bg-muted">
                <input
                  type="radio"
                  name="bg"
                  value="custom"
                  checked={!["transparent", "#ffffff", "#000000"].includes(bgColor)}
                  onChange={() => setBgColor("#ff0000")}
                  className="size-4 accent-primary"
                />
                <span className="block size-5 rounded-full border border-border bg-gradient-to-br from-red-500 via-green-500 to-blue-500" />
                Khusus
              </label>
              
              {!["transparent", "#ffffff", "#000000"].includes(bgColor) && (
                <input
                  type="color"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="h-9 w-12 cursor-pointer rounded bg-background px-1 shadow-sm border border-input"
                  title="Pilih Warna"
                />
              )}
            </div>
          </div>

          <Button size="lg" className="w-full" loading={processing} onClick={handleProcess}>
            <Eraser className="size-4" aria-hidden="true" />
            {processing && statusText ? statusText : "Hapus Background"}
          </Button>
        </>
      )}
    </div>
  );
}
