"use client";

import { FacultyShell } from "@/components/faculty/FacultyShell";

export default function FacultyError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <FacultyShell title="Error">
      <div className="eduos-empty-state">
        <p style={{ color: "var(--color-danger, #dc2626)", marginBottom: "1rem" }}>
          {error.message || "Something went wrong."}
        </p>
        <button className="eduos-btn eduos-btn-primary" onClick={reset}>
          Try again
        </button>
      </div>
    </FacultyShell>
  );
}
