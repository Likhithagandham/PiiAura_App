"use client";

import { useCallback, useEffect, useState } from "react";
import type { ParentAnnouncementsData } from "@eduos/types";
import { EmptyState, SkeletonText } from "@eduos/ui";
import { parentApiUrl, useParentChild } from "@/lib/parent/parent-child-context";

export function ParentAnnouncementsPanel() {
  const { childId } = useParentChild();
  const [data, setData] = useState<ParentAnnouncementsData | null>(null);

  const load = useCallback(async () => {
    if (!childId) return;
    const res = await fetch(parentApiUrl("/api/parent/announcements", childId), {
      credentials: "include",
    });
    const json = await res.json().catch(() => ({}));
    if (res.ok) setData(json as ParentAnnouncementsData);
  }, [childId]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <section className="eduos-panel">
      <h2 className="eduos-section-title">School notices</h2>
      <p className="eduos-section-desc">Announcements targeted to parents.</p>
      {!data ? (
        <SkeletonText lines={4} />
      ) : data.announcements.length === 0 ? (
        <EmptyState compact title="No announcements" description="Notices targeted to parents will appear here." />
      ) : (
        <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
          {data.announcements.map((a) => (
            <li
              key={a.id}
              style={{
                padding: "0.75rem 0",
                borderBottom: "1px solid var(--eduos-border)",
                fontSize: "0.8125rem",
              }}
            >
              <strong>{a.title}</strong>
              <div style={{ color: "var(--eduos-text-muted)", marginTop: "0.25rem" }}>{a.body}</div>
              <div style={{ fontSize: "0.75rem", color: "var(--eduos-text-muted)", marginTop: "0.25rem" }}>
                {a.targetLabel} · {new Date(a.sentAt).toLocaleString()}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
