"use client";

import type { Announcement } from "@eduos/types";
import { EmptyState } from "@eduos/ui";
import { useApiData } from "@/lib/queries";

export function StudentAnnouncementsPanel() {
  const { data, error: queryError } = useApiData<{ announcements?: Announcement[] }>(
    "/api/student/announcements",
  );
  const items = data?.announcements ?? [];
  const error = queryError ? (queryError instanceof Error ? queryError.message : "Failed to load") : null;

  if (error) return <p className="eduos-admin-message eduos-admin-message--error">{error}</p>;
  if (items.length === 0)
    return <EmptyState title="No announcements" description="School notices will appear here." />;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
      {items.map((a) => (
        <article key={a.id} className="eduos-panel" style={{ padding: "0.75rem" }}>
          <div style={{ fontWeight: 700 }}>{a.title}</div>
          <div style={{ fontSize: "0.6875rem", color: "var(--eduos-text-muted)", margin: "0.2rem 0" }}>
            {new Date(a.sentAt).toLocaleString()} · {a.targetLabel}
          </div>
          <p style={{ margin: 0, fontSize: "0.8125rem" }}>{a.body}</p>
        </article>
      ))}
    </div>
  );
}
