"use client";

import { AdminShell } from "@/components/admin/AdminShell";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <AdminShell title="Error">
      <div className="eduos-empty-state">
        <p style={{ color: "var(--color-danger, #dc2626)", marginBottom: "1rem" }}>
          {error.message || "Something went wrong."}
        </p>
        <button className="eduos-btn eduos-btn-primary" onClick={reset}>
          Try again
        </button>
      </div>
    </AdminShell>
  );
}
