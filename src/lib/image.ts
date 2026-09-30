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
  
  let format: ImageFormat = "image/jpeg";
  let ext = "jpg";

  if (file.type === "image/png" || file.type === "image/webp") {
    format = "image/webp";
    ext = "webp";
  } else {
    format = "image/jpeg";
    ext = "jpg";
  }
  
  const blob = await canvasToBlob(canvas, format, quality);
  // Only change extension if we changed format from png to webp
  const name = file.type === "image/png" ? replaceExtension(file.name, ext) : file.name;
  
  return { name, blob };
}

export async function mergeImages(files: File[], direction: 'vertical' | 'horizontal' = 'vertical'): Promise<NamedBlob> {
  const images = await Promise.all(files.map(loadImage));
  const canvas = document.createElement("canvas");
  
  let width = 0;
  let height = 0;
  
  if (direction === 'vertical') {
    width = Math.max(...images.map(img => img.naturalWidth));
    height = images.reduce((sum, img) => sum + img.naturalHeight, 0);
  } else {
    height = Math.max(...images.map(img => img.naturalHeight));
    width = images.reduce((sum, img) => sum + img.naturalWidth, 0);
  }
  
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Kanvas tidak didukung di browser ini");
  
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);
  
  let currentX = 0;
  let currentY = 0;
  
  for (const img of images) {
    if (direction === 'vertical') {
      ctx.drawImage(img, 0, currentY);
      currentY += img.naturalHeight;
    } else {
      ctx.drawImage(img, currentX, 0);
      currentX += img.naturalWidth;
    }
  }
  
  const blob = await canvasToBlob(canvas, "image/jpeg", 0.9);
  return { name: "gambar-gabungan.jpg", blob };
}
