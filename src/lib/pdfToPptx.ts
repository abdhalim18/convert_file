import { pdfToImages } from "@/lib/pdf";

const DPI = 96;

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Gagal membaca gambar halaman"));
    reader.readAsDataURL(blob);
  });
}

function getImageSize(dataUrl: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = () => reject(new Error("Gagal membaca dimensi gambar"));
    img.src = dataUrl;
  });
}

export async function convertPdfToPptx(file: File): Promise<Blob> {
  const [{ default: PptxGenJS }, pageImages] = await Promise.all([
    import("pptxgenjs"),
    pdfToImages(file, "image/jpeg", 0.9),
  ]);

  if (pageImages.length === 0) {
    throw new Error("PDF tidak memiliki halaman untuk dikonversi");
  }

  const dataUrls = await Promise.all(pageImages.map((p) => blobToDataUrl(p.blob)));
  const sizes = await Promise.all(dataUrls.map(getImageSize));

  // PPTX slide size is presentation-wide (fixed for all slides), so we size the
  // layout to the first page and letterbox any pages with a different ratio.
  const slideWidthIn = sizes[0].width / DPI;
  const slideHeightIn = sizes[0].height / DPI;

  const pptx = new PptxGenJS();
  pptx.defineLayout({ name: "PDF_PAGE", width: slideWidthIn, height: slideHeightIn });
  pptx.layout = "PDF_PAGE";

  dataUrls.forEach((dataUrl, i) => {
    const { width, height } = sizes[i];
    const scale = Math.min(slideWidthIn / (width / DPI), slideHeightIn / (height / DPI));
    const w = (width / DPI) * scale;
    const h = (height / DPI) * scale;
    const x = (slideWidthIn - w) / 2;
    const y = (slideHeightIn - h) / 2;

    const slide = pptx.addSlide();
    slide.addImage({ data: dataUrl, x, y, w, h });
  });

  const output = await pptx.write({ outputType: "blob" });
  return output as Blob;
}
