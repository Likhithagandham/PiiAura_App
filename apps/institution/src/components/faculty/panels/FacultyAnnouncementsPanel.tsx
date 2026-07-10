"use client";

import type { FacultyAnnouncementsData } from "@eduos/types";
import { Button, EmptyState, SkeletonText } from "@eduos/ui";
import { useApiData } from "@/lib/queries";

export function FacultyAnnouncementsPanel() {
  const { data, error: queryError, refetch } = useApiData<FacultyAnnouncementsData>(
    "/api/faculty/announcements",
  );
  const load = refetch;
  const error = queryError ? (queryError instanceof Error ? queryError.message : "Failed to load.") : null;

  const items = data?.announcements ?? [];

  if (!data && !error) return <SkeletonText lines={4} />;
  if (error) return <p className="eduos-admin-message eduos-admin-message--error">{error}</p>;

  return (
    <section className="eduos-panel">
      <div className="eduos-portal-toolbar" style={{ alignItems: "flex-start" }}>
        <div>
          <h2 className="eduos-section-title">Notices</h2>
          <p className="eduos-section-desc">Messages posted for you by your school.</p>
        </div>
        <Button type="button" variant="secondary" className="eduos-admin-btn-sm" onClick={() => load()}>
          Refresh
        </Button>
      </div>

      {items.length === 0 ? (
        <EmptyState title="No notices yet" description="Announcements from your school will appear here." />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginTop: "0.75rem" }}>
          {items.map((a) => (
            <article
              key={a.id}
              style={{
                border: "1px solid var(--eduos-border)",
                borderRadius: "var(--eduos-radius-lg)",
                padding: "1rem",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
                <div style={{ fontWeight: 800 }}>{a.title}</div>
                <span style={{ color: "var(--eduos-text-muted)", fontSize: "0.75rem" }}>
                  {new Date(a.sentAt).toLocaleString()}
                </span>
              </div>
              <div style={{ marginTop: "0.5rem", color: "var(--eduos-text-muted)", fontSize: "0.875rem" }}>
                {a.body}
              </div>
              <div style={{ marginTop: "0.5rem", color: "var(--eduos-text-muted)", fontSize: "0.75rem" }}>
                {a.targetLabel}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
