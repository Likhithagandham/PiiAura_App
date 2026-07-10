"use client";

import { useEffect } from "react";
import type { Announcement } from "@eduos/types";
import Link from "next/link";
import { InlineLoading } from "@eduos/ui";
import { ADMIN_ROUTES } from "@eduos/constants";
import { useApiData } from "@/lib/queries";

interface RecentAnnouncementsPanelProps {
  refreshKey?: number;
  onNewAnnouncement?: () => void;
}

const CHANNEL_LABELS: Record<string, string> = {
  in_app: "IN-APP",
  sms: "SMS",
  email: "EMAIL",
};

export function RecentAnnouncementsPanel({
  refreshKey = 0,
  onNewAnnouncement,
}: RecentAnnouncementsPanelProps) {
  const { data, isPending: loading, refetch } = useApiData<{ announcements?: Announcement[] }>(
    "/api/admin/announcements",
  );
  const items = (data?.announcements ?? []).slice(0, 3);

  // Parent bumps refreshKey after posting an announcement → pull fresh data.
  useEffect(() => {
    if (refreshKey) void refetch();
  }, [refreshKey, refetch]);

  const latest = items[0];

  return (
    <section className="eduos-panel">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
        <h2 className="eduos-section-title">Recent notices</h2>
        <Link href={ADMIN_ROUTES.notices} style={{ fontSize: "0.75rem", color: "var(--eduos-primary)", fontWeight: 600 }}>
          View all
        </Link>
      </div>

      {loading ? (
        <InlineLoading size="sm" minHeight="4rem" />
      ) : !latest ? (
        <p style={{ fontSize: "0.875rem", color: "var(--eduos-text-muted)" }}>No notices yet.</p>
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

      <button
        type="button"
        className="eduos-btn eduos-btn-primary"
        style={{ width: "100%", borderRadius: "var(--eduos-radius-lg)" }}
        onClick={onNewAnnouncement}
      >
        + New notice
      </button>
    </section>
  );
}
