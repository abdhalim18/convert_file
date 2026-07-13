import { PDFDocument, degrees } from "pdf-lib";

export interface NamedBlob {
  name: string;
  blob: Blob;
}

async function fileToArrayBuffer(file: File): Promise<ArrayBuffer> {
  return file.arrayBuffer();
}

function baseName(fileName: string): string {
  return fileName.replace(/\.pdf$/i, "");
}

export async function mergePdfs(files: File[]): Promise<Blob> {
  const merged = await PDFDocument.create();
  for (const file of files) {
    const bytes = await fileToArrayBuffer(file);
    const doc = await PDFDocument.load(bytes);
    const pages = await merged.copyPages(doc, doc.getPageIndices());
    pages.forEach((page) => merged.addPage(page));
  }
  const bytes = await merged.save();
  return new Blob([bytes as BlobPart], { type: "application/pdf" });
}

export interface PageRange {
  start: number;
  end: number;
}

export async function splitPdf(file: File, ranges: PageRange[]): Promise<NamedBlob[]> {
  const bytes = await fileToArrayBuffer(file);
  const source = await PDFDocument.load(bytes);
  const total = source.getPageCount();
  const name = baseName(file.name);
  const results: NamedBlob[] = [];

  for (const range of ranges) {
    const start = Math.max(1, range.start);
    const end = Math.min(total, range.end);
    if (start > end) continue;
    const indices = Array.from({ length: end - start + 1 }, (_, i) => start - 1 + i);
    const doc = await PDFDocument.create();
    const pages = await doc.copyPages(source, indices);
    pages.forEach((page) => doc.addPage(page));
    const out = await doc.save();
    const label = start === end ? `${name}_hal-${start}.pdf` : `${name}_hal-${start}-${end}.pdf`;
    results.push({ name: label, blob: new Blob([out as BlobPart], { type: "application/pdf" }) });
  }
  return results;
}

export async function splitPdfEveryPage(file: File): Promise<NamedBlob[]> {
  const bytes = await fileToArrayBuffer(file);
  const source = await PDFDocument.load(bytes);
  const total = source.getPageCount();
  const name = baseName(file.name);
  const results: NamedBlob[] = [];

  for (let i = 0; i < total; i++) {
    const doc = await PDFDocument.create();
    const [page] = await doc.copyPages(source, [i]);
    doc.addPage(page);
    const out = await doc.save();
    results.push({
      name: `${name}_hal-${i + 1}.pdf`,
      blob: new Blob([out as BlobPart], { type: "application/pdf" }),
    });
  }
  return results;
}

export async function compressPdf(file: File): Promise<Blob> {
  const bytes = await fileToArrayBuffer(file);
  const doc = await PDFDocument.load(bytes, { updateMetadata: false });
  doc.setTitle("");
  doc.setAuthor("");
  doc.setSubject("");
  doc.setKeywords([]);
  doc.setProducer("");
  doc.setCreator("");
  const out = await doc.save({ useObjectStreams: true, addDefaultPage: false });
  return new Blob([out as BlobPart], { type: "application/pdf" });
}

export async function rotatePdf(file: File, additionalDegrees: number): Promise<Blob> {
  const bytes = await fileToArrayBuffer(file);
  const doc = await PDFDocument.load(bytes);
  for (const page of doc.getPages()) {
    const current = page.getRotation().angle;
    page.setRotation(degrees(current + additionalDegrees));
  }
  const out = await doc.save();
  return new Blob([out as BlobPart], { type: "application/pdf" });
}

export async function removePages(file: File, pagesToRemove: number[]): Promise<Blob> {
  const bytes = await fileToArrayBuffer(file);
  const doc = await PDFDocument.load(bytes);
  const removeSet = new Set(pagesToRemove.map((p) => p - 1));
  const indices = doc
    .getPageIndices()
    .filter((i) => !removeSet.has(i));
  const out = await PDFDocument.create();
  const pages = await out.copyPages(doc, indices);
  pages.forEach((page) => out.addPage(page));
  const bytesOut = await out.save();
  return new Blob([bytesOut as BlobPart], { type: "application/pdf" });
}

async function toEmbeddablePng(file: File): Promise<ArrayBuffer> {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error(`Gagal memuat gambar: ${file.name}`));
      el.src = url;
    });
    const canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Kanvas tidak didukung di browser ini");
    ctx.drawImage(img, 0, 0);
    const blob: Blob = await new Promise((resolve, reject) => {
      canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Gagal mengonversi gambar"))), "image/png");
    });
    return blob.arrayBuffer();
  } finally {
    URL.revokeObjectURL(url);
  }
}

export async function imagesToPdf(files: File[]): Promise<Blob> {
  const doc = await PDFDocument.create();
  for (const file of files) {
    const isDirectlyEmbeddable = file.type === "image/png" || file.type === "image/jpeg";
    const bytes = isDirectlyEmbeddable ? await fileToArrayBuffer(file) : await toEmbeddablePng(file);
    const image =
      isDirectlyEmbeddable && file.type === "image/jpeg"
        ? await doc.embedJpg(bytes)
        : await doc.embedPng(bytes);
    const page = doc.addPage([image.width, image.height]);
    page.drawImage(image, { x: 0, y: 0, width: image.width, height: image.height });
  }
  const out = await doc.save();
  return new Blob([out as BlobPart], { type: "application/pdf" });
}

export async function getPdfPageCount(file: File): Promise<number> {
  const bytes = await fileToArrayBuffer(file);
  const doc = await PDFDocument.load(bytes);
  return doc.getPageCount();
}

export async function pdfToImages(
  file: File,
  format: "image/jpeg" | "image/png" = "image/jpeg",
  quality = 0.92,
): Promise<NamedBlob[]> {
  const pdfjsLib = await import("pdfjs-dist");
  pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

  const bytes = await fileToArrayBuffer(file);
  const loadingTask = pdfjsLib.getDocument({ data: bytes });
  const pdf = await loadingTask.promise;
  const name = baseName(file.name);
  const ext = format === "image/png" ? "png" : "jpg";
  const results: NamedBlob[] = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale: 2 });
    const canvas = document.createElement("canvas");
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) continue;
    await page.render({ canvasContext: ctx, viewport, canvas }).promise;
    const blob: Blob = await new Promise((resolve, reject) => {
      canvas.toBlob(
        (b) => (b ? resolve(b) : reject(new Error("Gagal membuat gambar"))),
        format,
        quality,
      );
    });
    results.push({ name: `${name}_hal-${i}.${ext}`, blob });
  }

  return results;
}
