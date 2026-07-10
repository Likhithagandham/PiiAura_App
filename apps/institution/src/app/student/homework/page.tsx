"use client";

import type { DailyHomeworkEntry } from "@eduos/types";
import { EmptyState, SkeletonText } from "@eduos/ui";
import { StudentShell } from "@/components/student/StudentShell";
import { useApiData } from "@/lib/queries";

function formatDate(value?: string): string {
  if (!value) return "";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? value : d.toLocaleDateString();
}

export default function StudentHomeworkPage() {
  const { data, error: queryError } = useApiData<{ homework?: DailyHomeworkEntry[] }>(
    "/api/student/homework",
  );
  const items = queryError ? [] : data?.homework ?? null;
  const error = queryError ? (queryError instanceof Error ? queryError.message : "Failed to load") : null;

  return (
    <StudentShell title="Homework">
      <p className="eduos-section-desc">Homework assigned to your class.</p>
      {error ? <p className="eduos-admin-message eduos-admin-message--error">{error}</p> : null}
      {items === null ? (
        <SkeletonText lines={4} />
      ) : items.length === 0 ? (
        <EmptyState title="No homework" description="Homework assigned to your class will appear here." />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {items.map((h) => (
            <article key={h.id} className="eduos-panel">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: "0.75rem",
                  alignItems: "baseline",
                }}
              >
                <h3 className="eduos-subsection-title" style={{ margin: 0 }}>
                  {h.title}
                </h3>
                <span style={{ fontSize: "0.75rem", color: "var(--eduos-text-muted)" }}>
                  {formatDate(h.date)}
                </span>
              </div>
              {h.details ? (
                <p className="eduos-body-sm" style={{ marginTop: "0.5rem", lineHeight: 1.5 }}>
                  {h.details}
                </p>
              ) : null}
              <div style={{ marginTop: "0.5rem", fontSize: "0.75rem", color: "var(--eduos-text-muted)" }}>
                {h.classLabel}
              </div>
            </article>
          ))}
        </div>
      )}
    </StudentShell>
  );
}
