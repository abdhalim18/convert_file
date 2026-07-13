import { forwardRef } from "react";
import type { ResumeData } from "@/lib/resume";

// Inline (non-Tailwind) styles on purpose: this node is cloned and captured
// by jsPDF's html renderer (see exportResumeToPdf in src/lib/resume.ts), which
// cannot resolve Tailwind's CSS-variable-based color tokens or dark mode —
// the resume must always render as fixed black-on-white paper.
const paper: React.CSSProperties = {
  width: "780px",
  maxWidth: "100%",
  margin: "0 auto",
  padding: "48px",
  background: "#ffffff",
  color: "#111111",
  fontFamily: "Helvetica, Arial, sans-serif",
  fontSize: "13px",
  lineHeight: 1.5,
  boxSizing: "border-box",
};

const heading2: React.CSSProperties = {
  fontSize: "14px",
  fontWeight: 700,
  color: "#1d4ed8",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  borderBottom: "1px solid #d1d5db",
  paddingBottom: "4px",
  marginTop: "20px",
  marginBottom: "8px",
};

export const ResumePreview = forwardRef<HTMLDivElement, { data: ResumeData }>(
  function ResumePreview({ data }, ref) {
    const contact = [data.email, data.phone, data.location, data.website].filter(Boolean);

    return (
      <div ref={ref} style={paper}>
        <div style={{ fontSize: "26px", fontWeight: 700 }}>
          {data.fullName || "Nama Lengkap"}
        </div>
        {data.headline && (
          <div style={{ fontSize: "15px", color: "#374151", marginTop: "2px" }}>
            {data.headline}
          </div>
        )}
        {contact.length > 0 && (
          <div style={{ fontSize: "12px", color: "#4b5563", marginTop: "8px" }}>
            {contact.join("  •  ")}
          </div>
        )}

        {data.summary && (
          <>
            <div style={heading2}>Ringkasan</div>
            <p style={{ margin: 0, whiteSpace: "pre-wrap" }}>{data.summary}</p>
          </>
        )}

        {data.experience.length > 0 && (
          <>
            <div style={heading2}>Pengalaman Kerja</div>
            {data.experience.map((exp) => (
              <div key={exp.id} style={{ marginBottom: "10px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700 }}>
                  <span>
                    {exp.role || "Jabatan"} — {exp.company || "Perusahaan"}
                  </span>
                  {exp.period && (
                    <span style={{ fontWeight: 400, color: "#6b7280", whiteSpace: "nowrap" }}>
                      {exp.period}
                    </span>
                  )}
                </div>
                {exp.description && (
                  <p style={{ margin: "2px 0 0", whiteSpace: "pre-wrap" }}>{exp.description}</p>
                )}
              </div>
            ))}
          </>
        )}

        {data.education.length > 0 && (
          <>
            <div style={heading2}>Pendidikan</div>
            {data.education.map((edu) => (
              <div key={edu.id} style={{ marginBottom: "8px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700 }}>
                  <span>
                    {edu.degree || "Gelar"} — {edu.school || "Institusi"}
                  </span>
                  {edu.period && (
                    <span style={{ fontWeight: 400, color: "#6b7280", whiteSpace: "nowrap" }}>
                      {edu.period}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </>
        )}

        {data.skills.length > 0 && (
          <>
            <div style={heading2}>Keahlian</div>
            <p style={{ margin: 0 }}>{data.skills.join(", ")}</p>
          </>
        )}
      </div>
    );
  },
);
