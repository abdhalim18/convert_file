"use client";

import { useCallback, useId, useRef, useState } from "react";
import type { DragEvent } from "react";
import { UploadCloud } from "lucide-react";
import clsx from "clsx";

interface DropzoneProps {
  accept: string[];
  multiple: boolean;
  onFiles: (files: File[]) => void;
  label?: string;
  hint?: string;
}

export function Dropzone({ accept, multiple, onFiles, label, hint }: DropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const inputId = useId();

  const filterAccepted = useCallback(
    (fileList: FileList | File[]) => {
      const files = Array.from(fileList);
      if (accept.length === 0) return files;
      return files.filter((file) => accept.includes(file.type));
    },
    [accept],
  );

  const handleFiles = useCallback(
    (fileList: FileList | File[]) => {
      const accepted = filterAccepted(fileList);
      if (accepted.length === 0) return;
      onFiles(multiple ? accepted : [accepted[0]]);
    },
    [filterAccepted, multiple, onFiles],
  );

  const onDrop = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);
      if (e.dataTransfer.files?.length) {
        handleFiles(e.dataTransfer.files);
      }
    },
    [handleFiles],
  );

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={label ?? "Unggah file"}
      onClick={() => inputRef.current?.click()}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          inputRef.current?.click();
        }
      }}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={onDrop}
      className={clsx(
        "flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-14 text-center transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        isDragging
          ? "border-primary bg-muted"
          : "border-border bg-surface hover:border-primary hover:bg-muted",
      )}
    >
      <span className="flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
        <UploadCloud className="size-7" aria-hidden="true" />
      </span>
      <p className="mt-4 text-base font-semibold text-foreground">
        {label ?? "Seret file ke sini, atau klik untuk memilih"}
      </p>
      {hint && <p className="mt-1 text-sm text-muted-foreground">{hint}</p>}
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        multiple={multiple}
        accept={accept.join(",")}
        className="sr-only"
        onChange={(e) => {
          if (e.target.files?.length) handleFiles(e.target.files);
          e.target.value = "";
        }}
      />
    </div>
  );
}
