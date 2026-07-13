export interface ResumeExperience {
  id: string;
  company: string;
  role: string;
  period: string;
  description: string;
}

export interface ResumeEducation {
  id: string;
  school: string;
  degree: string;
  period: string;
}

export interface ResumeData {
  fullName: string;
  headline: string;
  email: string;
  phone: string;
  location: string;
  website: string;
  summary: string;
  experience: ResumeExperience[];
  education: ResumeEducation[];
  skills: string[];
}

export function createEmptyResume(): ResumeData {
  return {
    fullName: "",
    headline: "",
    email: "",
    phone: "",
    location: "",
    website: "",
    summary: "",
    experience: [],
    education: [],
    skills: [],
  };
}

export async function exportResumeToPdf(previewEl: HTMLElement): Promise<Blob> {
  const { jsPDF } = await import("jspdf");

  // Same off-screen clone technique as convertWordToPdf (src/lib/word.ts):
  // jsPDF's `.html()` clones the target node into its own overlay, so the
  // clone must live in normal document flow at a fixed width for consistent
  // pagination regardless of the on-screen (responsive) layout.
  const wrapper = document.createElement("div");
  wrapper.style.cssText = "position:fixed; left:-99999px; top:0; pointer-events:none;";

  const container = previewEl.cloneNode(true) as HTMLElement;
  container.style.width = "780px";

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

export async function exportResumeToDocx(data: ResumeData): Promise<Blob> {
  const { Document, Packer, Paragraph, TextRun, HeadingLevel } = await import("docx");

  const contactLine = [data.email, data.phone, data.location, data.website]
    .filter(Boolean)
    .join("  •  ");

  const children = [
    new Paragraph({
      heading: HeadingLevel.TITLE,
      children: [new TextRun({ text: data.fullName || "Tanpa Nama", bold: true })],
    }),
  ];

  if (data.headline) {
    children.push(
      new Paragraph({ children: [new TextRun({ text: data.headline, italics: true })] }),
    );
  }
  if (contactLine) {
    children.push(new Paragraph({ children: [new TextRun({ text: contactLine })] }));
  }

  if (data.summary) {
    children.push(
      new Paragraph({ heading: HeadingLevel.HEADING_2, text: "Ringkasan", spacing: { before: 300 } }),
      new Paragraph({ children: [new TextRun({ text: data.summary })] }),
    );
  }

  if (data.experience.length > 0) {
    children.push(
      new Paragraph({ heading: HeadingLevel.HEADING_2, text: "Pengalaman Kerja", spacing: { before: 300 } }),
    );
    for (const exp of data.experience) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: `${exp.role || "Jabatan"} — ${exp.company || "Perusahaan"}`, bold: true }),
          ],
          spacing: { before: 200 },
        }),
      );
      if (exp.period) {
        children.push(new Paragraph({ children: [new TextRun({ text: exp.period, italics: true })] }));
      }
      if (exp.description) {
        children.push(new Paragraph({ text: exp.description, bullet: { level: 0 } }));
      }
    }
  }

  if (data.education.length > 0) {
    children.push(
      new Paragraph({ heading: HeadingLevel.HEADING_2, text: "Pendidikan", spacing: { before: 300 } }),
    );
    for (const edu of data.education) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: `${edu.degree || "Gelar"} — ${edu.school || "Institusi"}`, bold: true }),
          ],
          spacing: { before: 200 },
        }),
      );
      if (edu.period) {
        children.push(new Paragraph({ children: [new TextRun({ text: edu.period, italics: true })] }));
      }
    }
  }

  if (data.skills.length > 0) {
    children.push(
      new Paragraph({ heading: HeadingLevel.HEADING_2, text: "Keahlian", spacing: { before: 300 } }),
      new Paragraph({ text: data.skills.join(", ") }),
    );
  }

  const doc = new Document({ sections: [{ children }] });
  return Packer.toBlob(doc);
}
