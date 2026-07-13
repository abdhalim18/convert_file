export async function convertWordToPdf(file: File): Promise<Blob> {
  const [mammoth, { jsPDF }] = await Promise.all([import("mammoth"), import("jspdf")]);

  const arrayBuffer = await file.arrayBuffer();
  const { value: html } = await mammoth.convertToHtml({ arrayBuffer });

  // jsPDF clones `container` (not `wrapper`) into its own off-screen overlay, so
  // `container` itself must stay in normal flow — a `position: fixed` root here
  // would carry into the clone and render the content outside the capture area.
  const wrapper = document.createElement("div");
  wrapper.style.cssText = "position:fixed; left:-99999px; top:0; pointer-events:none;";

  const container = document.createElement("div");
  container.innerHTML = html;
  container.style.cssText =
    "width:780px; font-family:Helvetica,Arial,sans-serif; font-size:12px; line-height:1.5; color:#111;";

  const headingSizes: Record<string, string> = {
    H1: "22px",
    H2: "18px",
    H3: "15px",
  };
  container.querySelectorAll("h1, h2, h3, h4, h5, h6").forEach((heading) => {
    const el = heading as HTMLElement;
    el.style.fontWeight = "700";
    el.style.fontSize = headingSizes[el.tagName] ?? "13px";
    el.style.margin = "0.6em 0";
  });
  container.querySelectorAll("strong, b").forEach((el) => {
    (el as HTMLElement).style.fontWeight = "700";
  });
  container.querySelectorAll("em, i").forEach((el) => {
    (el as HTMLElement).style.fontStyle = "italic";
  });
  container.querySelectorAll("img").forEach((img) => {
    (img as HTMLImageElement).style.maxWidth = "100%";
  });
  container.querySelectorAll("table").forEach((table) => {
    (table as HTMLElement).style.borderCollapse = "collapse";
    (table as HTMLElement).style.width = "100%";
  });
  container.querySelectorAll("td, th").forEach((cell) => {
    (cell as HTMLElement).style.border = "1px solid #ccc";
    (cell as HTMLElement).style.padding = "4px 8px";
  });

  wrapper.appendChild(container);
  document.body.appendChild(wrapper);

  try {
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const blob = await new Promise<Blob>((resolve, reject) => {
      const worker = doc.html(container, {
        margin: [40, 40, 40, 40],
        autoPaging: "text",
        width: 515,
        windowWidth: 780,
        callback: (pdf) => resolve(pdf.output("blob")),
      });
      worker.catch(reject);
    });
    return blob;
  } finally {
    document.body.removeChild(wrapper);
  }
}
