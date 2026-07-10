"use client";

import { parseFacultyMarksInput } from "@/lib/faculty/marks-validation";
import { useEffect, useState } from "react";

export function MarksInput({
  value,
  maxMarks,
  disabled,
  onCommit,
}: {
  value: number | null;
  maxMarks: number;
  disabled?: boolean;
  onCommit: (marks: number | null) => void;
}) {
  const [local, setLocal] = useState(value == null ? "" : String(value));
  const [fieldError, setFieldError] = useState<string | null>(null);

  useEffect(() => {
    setLocal(value == null ? "" : String(value));
    setFieldError(null);
  }, [value]);

  function commit(raw: string) {
    if (disabled) return;
    const parsed = parseFacultyMarksInput(raw, maxMarks);
    if (!parsed.ok) {
      setFieldError(parsed.error);
      return;
    }
    setFieldError(null);
    if (parsed.marks === value || (parsed.marks == null && value == null)) return;
    onCommit(parsed.marks);
  }

  return (
    <div>
      <input
        type="number"
        min={0}
        max={maxMarks}
        step={1}
        className={`eduos-input eduos-input--compact${fieldError ? " eduos-input-error" : ""}`}
        value={local}
        disabled={disabled}
        onChange={(e) => {
          setLocal(e.target.value);
          setFieldError(null);
        }}
        onBlur={(e) => commit(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.currentTarget.blur();
          }
        }}
      />
      {fieldError ? (
        <div style={{ fontSize: "0.6875rem", color: "var(--eduos-danger)", marginTop: "0.15rem" }}>{fieldError}</div>
      ) : (
        <div className="eduos-empty eduos-empty--sm" style={{ marginTop: "0.1rem" }}>
          / {maxMarks}
        </div>
      )}
    </div>
  );
}
