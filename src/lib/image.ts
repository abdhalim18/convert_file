export type ImageFormat = "image/jpeg" | "image/png" | "image/webp";

export const formatExtension: Record<ImageFormat, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      resolve(img);
      URL.revokeObjectURL(url);
    };
    img.onerror = () => {
      reject(new Error(`Gagal memuat gambar: ${file.name}`));
      URL.revokeObjectURL(url);
    };
    img.src = url;
  });
}

function renderToCanvas(img: HTMLImageElement): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Kanvas tidak didukung di browser ini");
  ctx.drawImage(img, 0, 0);
  return canvas;
}

function canvasToBlob(canvas: HTMLCanvasElement, format: ImageFormat, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Gagal mengonversi gambar"))),
      format,
      quality,
    );
  });
}

function replaceExtension(fileName: string, ext: string): string {
  const dot = fileName.lastIndexOf(".");
  const base = dot === -1 ? fileName : fileName.slice(0, dot);
  return `${base}.${ext}`;
}

export interface NamedBlob {
  name: string;
  blob: Blob;
}

export async function convertImage(
  file: File,
  format: ImageFormat,
  quality = 0.9,
): Promise<NamedBlob> {
  const img = await loadImage(file);
  const canvas = renderToCanvas(img);
  const blob = await canvasToBlob(canvas, format, quality);
  return { name: replaceExtension(file.name, formatExtension[format]), blob };
}

export async function compressImage(file: File, quality = 0.6): Promise<NamedBlob> {
  const img = await loadImage(file);
  const canvas = renderToCanvas(img);
  const format: ImageFormat = file.type === "image/png" ? "image/png" : "image/jpeg";
  const blob = await canvasToBlob(canvas, format, quality);
  return { name: file.name, blob };
}
