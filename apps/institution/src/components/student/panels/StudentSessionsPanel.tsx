"use client";

import type { StudentSessionsData } from "@eduos/types";
import { Button, EmptyState, SkeletonText } from "@eduos/ui";
import { useState } from "react";
import { useApiData } from "@/lib/queries";

export function StudentSessionsPanel() {
  const { data, error: queryError, refetch } = useApiData<StudentSessionsData>(
    "/api/student/sessions",
  );
  const load = refetch;
  const [message, setMessage] = useState<string | null>(null);

  const error = queryError ? "Failed to load." : null;

  if (error) return <p className="eduos-admin-message eduos-admin-message--error">{error}</p>;
  if (!data) return <SkeletonText lines={4} />;
  if (data.sessions.length === 0)
    return <EmptyState compact title="No active sessions" description="Signed-in devices will appear here." />;

  return (
    <>
      {message ? <p className="eduos-admin-message">{message}</p> : null}
      <p className="eduos-section-desc">
        {data.concurrentSessionsAllowed
          ? "Mobile and desktop can stay signed in at the same time."
          : "Manage your signed-in devices."}
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        {data.sessions.map((s) => (
          <article key={s.sessionId} className="eduos-panel" style={{ padding: "0.75rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: "0.75rem", flexWrap: "wrap" }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: "0.875rem" }}>
                  {s.deviceLabel}
                  {s.isCurrent ? (
                    <span style={{ marginLeft: "0.35rem", fontSize: "0.6875rem", color: "var(--eduos-brand)" }}>
                      (this device)
                    </span>
                  ) : null}
                </div>
                <div style={{ fontSize: "0.75rem", color: "var(--eduos-text-muted)" }}>
                  {s.deviceType} · Last active {new Date(s.lastActiveAt).toLocaleString()}
                </div>
              </div>
              {!s.isCurrent ? (
                <Button
                  type="button"
                  className="eduos-admin-btn-sm"
                  onClick={async () => {
                    setMessage(null);
                    const res = await fetch("/api/student/sessions", {
                      method: "DELETE",
                      credentials: "include",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ sessionId: s.sessionId }),
                    });
                    const json = await res.json().catch(() => ({}));
                    if (!res.ok) {
                      setMessage((json as { error?: string }).error ?? "Could not revoke");
                      return;
                    }
                    setMessage("Session ended on that device.");
                    await load();
                  }}
                >
                  Sign out device
                </Button>
              ) : null}
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
