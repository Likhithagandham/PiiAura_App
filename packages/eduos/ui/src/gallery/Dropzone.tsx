"use client";

import { useCallback, useRef, useState } from "react";

export interface DropzoneProps {
  accept?: string;
  multiple?: boolean;
  disabled?: boolean;
  label?: string;
  onFiles: (files: File[]) => void;
}

export function Dropzone({
  accept = "image/jpeg,image/png,image/webp",
  multiple = true,
  disabled = false,
  label = "Drag & drop photos here, or click to browse",
  onFiles,
}: DropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFiles = useCallback(
    (list: FileList | null) => {
      if (!list?.length) return;
      onFiles(Array.from(list));
    },
    [onFiles],
  );

  return (
    <div
      role="button"
      tabIndex={0}
      className={`eduos-panel${dragOver ? " eduos-dropzone--active" : ""}`}
      style={{
        border: "2px dashed var(--eduos-border)",
        padding: "2rem 1rem",
        textAlign: "center",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.6 : 1,
        background: dragOver ? "var(--eduos-surface-muted, #f8faf9)" : undefined,
      }}
      onClick={() => !disabled && inputRef.current?.click()}
      onKeyDown={(e) => e.key === "Enter" && !disabled && inputRef.current?.click()}
      onDragOver={(e) => {
        e.preventDefault();
        if (!disabled) setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        if (!disabled) handleFiles(e.dataTransfer.files);
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        hidden
        disabled={disabled}
        onChange={(e) => handleFiles(e.target.files)}
      />
      <p style={{ margin: 0, color: "var(--eduos-text-muted)", fontSize: "0.875rem" }}>{label}</p>
    </div>
  );
}
