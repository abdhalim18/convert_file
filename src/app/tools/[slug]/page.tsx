import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ToolShell } from "@/components/ToolShell";
import { ComingSoon } from "@/components/ComingSoon";
import { getToolBySlug, tools } from "@/lib/tools";
import { MergePdfTool } from "@/components/tools/MergePdfTool";
import { SplitPdfTool } from "@/components/tools/SplitPdfTool";
import { CompressPdfTool } from "@/components/tools/CompressPdfTool";
import { RotatePdfTool } from "@/components/tools/RotatePdfTool";
import { RemovePagesTool } from "@/components/tools/RemovePagesTool";
import { PdfToJpgTool } from "@/components/tools/PdfToJpgTool";
import { JpgToPdfTool } from "@/components/tools/JpgToPdfTool";
import { ImageConverterTool } from "@/components/tools/ImageConverterTool";
import { CompressImageTool } from "@/components/tools/CompressImageTool";
import { WordToPdfTool } from "@/components/tools/WordToPdfTool";
import { PdfToWordTool } from "@/components/tools/PdfToWordTool";
import { PdfToPowerpointTool } from "@/components/tools/PdfToPowerpointTool";
import { ResumeBuilderTool } from "@/components/tools/ResumeBuilderTool";

const toolComponents: Record<string, React.ComponentType> = {
  "merge-pdf": MergePdfTool,
  "split-pdf": SplitPdfTool,
  "compress-pdf": CompressPdfTool,
  "rotate-pdf": RotatePdfTool,
  "remove-pages": RemovePagesTool,
  "pdf-to-jpg": PdfToJpgTool,
  "jpg-to-pdf": JpgToPdfTool,
  "image-converter": ImageConverterTool,
  "compress-image": CompressImageTool,
  "word-to-pdf": WordToPdfTool,
  "pdf-to-word": PdfToWordTool,
  "pdf-to-powerpoint": PdfToPowerpointTool,
  "resume-builder": ResumeBuilderTool,
};

export function generateStaticParams() {
  return tools.map((tool) => ({ slug: tool.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const tool = getToolBySlug(slug);
  if (!tool) return {};
  return {
    title: `${tool.name} — Konverta`,
    description: tool.description,
  };
}

export default async function ToolPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const tool = getToolBySlug(slug);
  if (!tool) notFound();

  const ToolComponent = toolComponents[tool.slug];

  return (
    <ToolShell tool={tool}>
      {tool.status === "soon" || !ToolComponent ? (
        <ComingSoon toolName={tool.name} />
      ) : (
        <ToolComponent />
      )}
    </ToolShell>
  );
}
