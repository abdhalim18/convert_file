export async function convertPdfToWord(file: File): Promise<Blob> {
  const [pdfjsLib, { Document, Packer, Paragraph, TextRun, PageBreak }] = await Promise.all([
    import("pdfjs-dist"),
    import("docx"),
  ]);
  pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

  const bytes = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: bytes }).promise;

  const children: InstanceType<typeof Paragraph>[] = [];

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const textContent = await page.getTextContent();
    let currentLine = "";

    for (const item of textContent.items) {
      if (!("str" in item)) continue;
      currentLine += item.str;
      if (item.hasEOL) {
        children.push(new Paragraph({ children: [new TextRun(currentLine)] }));
        currentLine = "";
      }
    }
    if (currentLine) {
      children.push(new Paragraph({ children: [new TextRun(currentLine)] }));
    }

    if (pageNum < pdf.numPages) {
      children.push(new Paragraph({ children: [new PageBreak()] }));
    }
  }

  if (children.length === 0) {
    children.push(new Paragraph({ children: [new TextRun("")] }));
  }

  const doc = new Document({ sections: [{ children }] });
  return Packer.toBlob(doc);
}
