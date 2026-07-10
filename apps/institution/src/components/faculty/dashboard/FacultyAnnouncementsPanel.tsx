"use client";

import Link from "next/link";
import type { Announcement } from "@eduos/types";
import { EmptyState } from "@eduos/ui";
import { FACULTY_ROUTES } from "@eduos/constants";

const CHANNEL_LABELS: Record<string, string> = {
  in_app: "IN-APP",
  sms: "SMS",
  email: "EMAIL",
};

interface FacultyAnnouncementsPanelProps {
  announcements: Announcement[];
}

export function FacultyAnnouncementsPanel({ announcements }: FacultyAnnouncementsPanelProps) {
  const latest = announcements[0];

  return (
    <section className="eduos-panel">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
        <h2 className="eduos-section-title">Announcements</h2>
        <Link href={FACULTY_ROUTES.announcements} className="eduos-link" style={{ fontSize: "0.75rem" }}>
          View all
        </Link>
      </div>

      {!latest ? (
        <EmptyState compact title="No announcements yet" description="The latest announcement will appear here." />
      ) : (
        <div
          style={{
            padding: "0.875rem",
            background: "var(--eduos-bg)",
            borderRadius: "var(--eduos-radius)",
            border: "1px solid var(--eduos-border)",
            marginBottom: "0.875rem",
          }}
        >
          <div style={{ marginBottom: "0.5rem" }}>
            <span className="eduos-tag">{latest.targetLabel}</span>
            {latest.channels.map((c) => (
              <span key={c} className="eduos-tag">
                {CHANNEL_LABELS[c] ?? c}
              </span>
            ))}
          </div>
          <div style={{ fontWeight: 700, fontSize: "0.875rem" }}>{latest.title}</div>
          <div style={{ fontSize: "0.8125rem", color: "var(--eduos-text-muted)", marginTop: "0.35rem", lineHeight: 1.5 }}>
            {latest.body.length > 120 ? `${latest.body.slice(0, 120)}…` : latest.body}
          </div>
        </div>
      )}

      <Link
        href={FACULTY_ROUTES.announcements}
        className="eduos-btn eduos-btn-primary"
        style={{ display: "flex", width: "100%", borderRadius: "var(--eduos-radius-lg)", textDecoration: "none" }}
      >
        View all announcements
      </Link>
    </section>
  );
}
