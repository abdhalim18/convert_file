import type { LucideIcon } from "lucide-react";
import {
  Combine,
  Scissors,
  Minimize2,
  RotateCw,
  FileMinus,
  ImageDown,
  FileImage,
  Images,
  FileType,
  FileText,
  Presentation,
  UserSquare2,
  Eraser,
} from "lucide-react";

export type ToolCategory = "pdf" | "gambar" | "dokumen";
export type ToolStatus = "available" | "soon";

export interface ToolDef {
  slug: string;
  name: string;
  description: string;
  icon: LucideIcon;
  category: ToolCategory;
  status: ToolStatus;
  accept: string[];
  multiple: boolean;
}

export const categoryLabels: Record<ToolCategory, string> = {
  pdf: "Alat PDF",
  gambar: "Alat Gambar",
  dokumen: "Alat Dokumen",
};

export const tools: ToolDef[] = [
  {
    slug: "merge-pdf",
    name: "Gabung PDF",
    description: "Satukan beberapa file PDF menjadi satu dokumen, urutan bisa diatur bebas.",
    icon: Combine,
    category: "pdf",
    status: "available",
    accept: ["application/pdf"],
    multiple: true,
  },
  {
    slug: "split-pdf",
    name: "Pisah PDF",
    description: "Pecah PDF menjadi file per halaman atau sesuai rentang yang dipilih.",
    icon: Scissors,
    category: "pdf",
    status: "available",
    accept: ["application/pdf"],
    multiple: false,
  },
  {
    slug: "compress-pdf",
    name: "Kompres PDF",
    description: "Perkecil ukuran file PDF agar lebih mudah dibagikan dan diunggah.",
    icon: Minimize2,
    category: "pdf",
    status: "available",
    accept: ["application/pdf"],
    multiple: false,
  },
  {
    slug: "rotate-pdf",
    name: "Putar PDF",
    description: "Putar orientasi semua halaman PDF 90°, 180°, atau 270°.",
    icon: RotateCw,
    category: "pdf",
    status: "available",
    accept: ["application/pdf"],
    multiple: false,
  },
  {
    slug: "remove-pages",
    name: "Hapus Halaman",
    description: "Buang halaman yang tidak diperlukan dari dokumen PDF Anda.",
    icon: FileMinus,
    category: "pdf",
    status: "available",
    accept: ["application/pdf"],
    multiple: false,
  },
  {
    slug: "pdf-to-jpg",
    name: "PDF ke JPG",
    description: "Ubah setiap halaman PDF menjadi gambar JPG berkualitas tinggi.",
    icon: ImageDown,
    category: "pdf",
    status: "available",
    accept: ["application/pdf"],
    multiple: false,
  },
  {
    slug: "jpg-to-pdf",
    name: "JPG ke PDF",
    description: "Gabungkan satu atau beberapa gambar menjadi satu file PDF.",
    icon: FileImage,
    category: "pdf",
    status: "available",
    accept: ["image/jpeg", "image/png", "image/webp"],
    multiple: true,
  },
  {
    slug: "word-to-pdf",
    name: "Word ke PDF",
    description: "Konversi dokumen Word (.docx) menjadi PDF siap bagikan.",
    icon: FileType,
    category: "pdf",
    status: "available",
    accept: [
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ],
    multiple: false,
  },
  {
    slug: "pdf-to-word",
    name: "PDF ke Word",
    description: "Ubah PDF menjadi dokumen Word yang dapat diedit.",
    icon: FileText,
    category: "pdf",
    status: "available",
    accept: ["application/pdf"],
    multiple: false,
  },
  {
    slug: "pdf-to-powerpoint",
    name: "PDF ke PowerPoint",
    description: "Ubah PDF menjadi presentasi PowerPoint (.pptx).",
    icon: Presentation,
    category: "pdf",
    status: "available",
    accept: ["application/pdf"],
    multiple: false,
  },
  {
    slug: "image-converter",
    name: "Konversi Gambar",
    description: "Ubah format gambar antara JPG, PNG, dan WebP.",
    icon: Images,
    category: "gambar",
    status: "available",
    accept: ["image/jpeg", "image/png", "image/webp"],
    multiple: true,
  },
  {
    slug: "merge-jpg",
    name: "Gabung JPG/PNG",
    description: "Gabungkan beberapa file gambar menjadi satu gambar panjang (vertikal/horizontal).",
    icon: Combine,
    category: "gambar",
    status: "available",
    accept: ["image/jpeg", "image/png", "image/webp"],
    multiple: true,
  },
  {
    slug: "remove-bg",
    name: "Hapus Background",
    description: "Hapus latar belakang dari foto secara otomatis dengan AI, dan ganti warnanya.",
    icon: Eraser,
    category: "gambar",
    status: "available",
    accept: ["image/jpeg", "image/png", "image/webp"],
    multiple: false,
  },
  {
    slug: "compress-image",
    name: "Kompres Gambar",
    description: "Kecilkan ukuran file gambar tanpa mengorbankan kualitas visual.",
    icon: Minimize2,
    category: "gambar",
    status: "available",
    accept: ["image/jpeg", "image/png", "image/webp"],
    multiple: true,
  },
  {
    slug: "resume-builder",
    name: "Resume Builder",
    description: "Susun CV profesional dengan pratinjau langsung, unduh sebagai PDF atau Word.",
    icon: UserSquare2,
    category: "dokumen",
    status: "available",
    accept: [],
    multiple: false,
  },
];

export function getToolBySlug(slug: string): ToolDef | undefined {
  return tools.find((t) => t.slug === slug);
}
