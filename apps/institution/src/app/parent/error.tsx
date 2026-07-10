"use client";

import { ParentShell } from "@/components/parent/ParentShell";

export default function ParentError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ParentShell>
      <div className="eduos-empty-state">
        <p style={{ color: "var(--color-danger, #dc2626)", marginBottom: "1rem" }}>
          {error.message || "Something went wrong."}
        </p>
        <button className="eduos-btn eduos-btn-primary" onClick={reset}>
          Try again
        </button>
      </div>
    </ParentShell>
  );
}
