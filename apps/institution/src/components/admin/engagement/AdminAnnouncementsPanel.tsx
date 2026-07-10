"use client";

import { useState } from "react";
import type { Announcement } from "@eduos/types";
import { Button, EmptyState, SkeletonText } from "@eduos/ui";
import { SendAnnouncementModal } from "@/components/admin/dashboard/SendAnnouncementModal";
import { useApiData } from "@/lib/queries";

const CHANNEL_LABELS: Record<string, string> = {
  in_app: "In-app",
  sms: "SMS",
  email: "Email",
};

type AudienceOptions = Record<string, { value: string; label: string }[]>;

export function AdminAnnouncementsPanel() {
  const { data, error: queryError, refetch } = useApiData<{
    announcements?: Announcement[];
    options?: AudienceOptions;
  }>("/api/admin/announcements");
  const [showModal, setShowModal] = useState(false);

  const items = queryError ? [] : data?.announcements ?? null;
  const options = data?.options ?? {};
  const error = queryError ? (queryError instanceof Error ? queryError.message : "Failed to load notices") : null;

  if (items === null) return <SkeletonText lines={4} />;
  if (error) return <p className="eduos-admin-message eduos-admin-message--error">{error}</p>;

  return (
    <>
      <section className="eduos-panel">
        <div className="eduos-portal-toolbar" style={{ alignItems: "flex-start" }}>
          <div>
            <h2 className="eduos-section-title">Notices</h2>
            <p className="eduos-section-desc">
              Publish school-wide messages. Students and parents see these under Notices in their portal.
            </p>
          </div>
          <Button type="button" className="eduos-admin-btn-sm" onClick={() => setShowModal(true)}>
            New notice
          </Button>
        </div>
      </section>

      {items.length === 0 ? (
        <EmptyState
          title="No notices yet"
          description="Publish your first notice to reach students, parents, and staff."
        />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {items.map((a) => (
            <article key={a.id} className="eduos-panel">
              <div style={{ display: "flex", justifyContent: "space-between", gap: "0.75rem", flexWrap: "wrap" }}>
                <h3 className="eduos-subsection-title" style={{ margin: 0 }}>
                  {a.title}
                </h3>
                <span style={{ fontSize: "0.75rem", color: "var(--eduos-text-muted)" }}>
                  {new Date(a.sentAt).toLocaleString()}
                </span>
              </div>
              <p className="eduos-body-sm" style={{ marginTop: "0.5rem", lineHeight: 1.5 }}>
                {a.body}
              </p>
              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginTop: "0.75rem" }}>
                <span className="eduos-tag">{a.targetLabel}</span>
                {a.channels.map((c) => (
                  <span key={c} className="eduos-tag">
                    {CHANNEL_LABELS[c] ?? c}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
      )}

      {showModal ? (
        <SendAnnouncementModal
          options={options}
          onClose={() => setShowModal(false)}
          onSent={() => {
            setShowModal(false);
            void refetch();
          }}
        />
      ) : null}
    </>
  );
}
