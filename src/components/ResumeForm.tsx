"use client";

import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/Button";
import type { ResumeData, ResumeEducation, ResumeExperience } from "@/lib/resume";

const fieldClass =
  "w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";
const labelClass = "text-sm font-medium text-foreground";
const sectionTitleClass = "text-base font-semibold text-foreground";

function newId() {
  return Math.random().toString(36).slice(2, 10);
}

export function ResumeForm({
  data,
  onChange,
}: {
  data: ResumeData;
  onChange: (data: ResumeData) => void;
}) {
  function set<K extends keyof ResumeData>(key: K, value: ResumeData[K]) {
    onChange({ ...data, [key]: value });
  }

  function addExperience() {
    const exp: ResumeExperience = { id: newId(), company: "", role: "", period: "", description: "" };
    set("experience", [...data.experience, exp]);
  }

  function updateExperience(id: string, patch: Partial<ResumeExperience>) {
    set(
      "experience",
      data.experience.map((exp) => (exp.id === id ? { ...exp, ...patch } : exp)),
    );
  }

  function removeExperience(id: string) {
    set("experience", data.experience.filter((exp) => exp.id !== id));
  }

  function addEducation() {
    const edu: ResumeEducation = { id: newId(), school: "", degree: "", period: "" };
    set("education", [...data.education, edu]);
  }

  function updateEducation(id: string, patch: Partial<ResumeEducation>) {
    set(
      "education",
      data.education.map((edu) => (edu.id === id ? { ...edu, ...patch } : edu)),
    );
  }

  function removeEducation(id: string) {
    set("education", data.education.filter((edu) => edu.id !== id));
  }

  function updateSkillsText(text: string) {
    const skills = text
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    set("skills", skills);
  }

  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <h2 className={sectionTitleClass}>Data Diri</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <input
            className={fieldClass}
            placeholder="Nama lengkap"
            value={data.fullName}
            onChange={(e) => set("fullName", e.target.value)}
          />
          <input
            className={fieldClass}
            placeholder="Jabatan / headline (mis. Frontend Developer)"
            value={data.headline}
            onChange={(e) => set("headline", e.target.value)}
          />
          <input
            className={fieldClass}
            placeholder="Email"
            type="email"
            value={data.email}
            onChange={(e) => set("email", e.target.value)}
          />
          <input
            className={fieldClass}
            placeholder="Telepon"
            value={data.phone}
            onChange={(e) => set("phone", e.target.value)}
          />
          <input
            className={fieldClass}
            placeholder="Lokasi (mis. Jakarta, Indonesia)"
            value={data.location}
            onChange={(e) => set("location", e.target.value)}
          />
          <input
            className={fieldClass}
            placeholder="Website / LinkedIn (opsional)"
            value={data.website}
            onChange={(e) => set("website", e.target.value)}
          />
        </div>
      </section>

      <section className="space-y-3">
        <h2 className={sectionTitleClass}>Ringkasan</h2>
        <textarea
          className={fieldClass}
          rows={3}
          placeholder="Ringkasan singkat tentang profil dan kekuatan Anda"
          value={data.summary}
          onChange={(e) => set("summary", e.target.value)}
        />
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className={sectionTitleClass}>Pengalaman Kerja</h2>
          <Button size="md" variant="secondary" onClick={addExperience} type="button">
            <Plus className="size-4" aria-hidden="true" />
            Tambah
          </Button>
        </div>
        {data.experience.map((exp) => (
          <div key={exp.id} className="space-y-2 rounded-xl border border-border bg-background p-3">
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <input
                className={fieldClass}
                placeholder="Jabatan"
                value={exp.role}
                onChange={(e) => updateExperience(exp.id, { role: e.target.value })}
              />
              <input
                className={fieldClass}
                placeholder="Perusahaan"
                value={exp.company}
                onChange={(e) => updateExperience(exp.id, { company: e.target.value })}
              />
            </div>
            <input
              className={fieldClass}
              placeholder="Periode (mis. Jan 2022 — Sekarang)"
              value={exp.period}
              onChange={(e) => updateExperience(exp.id, { period: e.target.value })}
            />
            <textarea
              className={fieldClass}
              rows={2}
              placeholder="Deskripsi tugas/pencapaian"
              value={exp.description}
              onChange={(e) => updateExperience(exp.id, { description: e.target.value })}
            />
            <button
              type="button"
              onClick={() => removeExperience(exp.id)}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-destructive hover:opacity-80"
            >
              <Trash2 className="size-3.5" aria-hidden="true" />
              Hapus
            </button>
          </div>
        ))}
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className={sectionTitleClass}>Pendidikan</h2>
          <Button size="md" variant="secondary" onClick={addEducation} type="button">
            <Plus className="size-4" aria-hidden="true" />
            Tambah
          </Button>
        </div>
        {data.education.map((edu) => (
          <div key={edu.id} className="space-y-2 rounded-xl border border-border bg-background p-3">
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <input
                className={fieldClass}
                placeholder="Gelar (mis. S1 Teknik Informatika)"
                value={edu.degree}
                onChange={(e) => updateEducation(edu.id, { degree: e.target.value })}
              />
              <input
                className={fieldClass}
                placeholder="Institusi"
                value={edu.school}
                onChange={(e) => updateEducation(edu.id, { school: e.target.value })}
              />
            </div>
            <input
              className={fieldClass}
              placeholder="Periode (mis. 2018 — 2022)"
              value={edu.period}
              onChange={(e) => updateEducation(edu.id, { period: e.target.value })}
            />
            <button
              type="button"
              onClick={() => removeEducation(edu.id)}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-destructive hover:opacity-80"
            >
              <Trash2 className="size-3.5" aria-hidden="true" />
              Hapus
            </button>
          </div>
        ))}
      </section>

      <section className="space-y-3">
        <h2 className={sectionTitleClass}>Keahlian</h2>
        <label className={labelClass} htmlFor="resume-skills">
          Pisahkan dengan koma
        </label>
        <input
          id="resume-skills"
          className={fieldClass}
          placeholder="mis. React, TypeScript, Figma"
          value={data.skills.join(", ")}
          onChange={(e) => updateSkillsText(e.target.value)}
        />
      </section>
    </div>
  );
}
