"use client";

import { Button, SkeletonText } from "@eduos/ui";
import { useState } from "react";
import { useApiData } from "@/lib/queries";

type Session = {
  id: string;
  device_info: string;
  ip_address: string | null;
  created_at: string;
  expires_at: string;
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function ActiveSessionsPanel() {
  const { data, error: queryError, refetch } = useApiData<{ sessions: Session[] }>(
    "/api/auth/sessions",
  );
  const load = refetch;
  const sessions = data?.sessions ?? null;
  const [mutationError, setMutationError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState<string | null>(null);

  const error = mutationError ?? (queryError ? "Failed to load sessions." : null);

  const revokeOne = async (id: string) => {
    setLoading(id);
    setMessage(null);
    setMutationError(null);
    const res = await fetch(`/api/auth/sessions/${encodeURIComponent(id)}`, {
      method: "DELETE",
      credentials: "include",
    });
    setLoading(null);
    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      setMutationError((json as { error?: string }).error ?? "Could not revoke session.");
      return;
    }
    setMessage("Session ended.");
    await load();
  };

  const revokeAll = async () => {
    setLoading("all");
    setMessage(null);
    setMutationError(null);
    const res = await fetch("/api/auth/logout-all", {
      method: "POST",
      credentials: "include",
    });
    setLoading(null);
    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      setMutationError((json as { error?: string }).error ?? "Sign out all failed.");
      return;
    }
    window.location.assign("/login");
  };

  if (!sessions && !error) return <SkeletonText lines={4} />;

  return (
    <section className="eduos-panel">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.5rem", marginBottom: "0.75rem" }}>
        <h2 className="eduos-section-title" style={{ margin: 0 }}>Active sessions</h2>
        {sessions && sessions.length > 1 ? (
          <Button
            type="button"
            className="eduos-admin-btn-sm"
            disabled={loading === "all"}
            onClick={revokeAll}
          >
            {loading === "all" ? "Signing out…" : "Sign out all devices"}
          </Button>
        ) : null}
      </div>
      <p className="eduos-section-desc" style={{ marginTop: 0 }}>
        Manage where you are currently signed in.
      </p>
      {message ? <p className="eduos-admin-message">{message}</p> : null}
      {error ? <p className="eduos-admin-message eduos-admin-message--error">{error}</p> : null}
      {sessions && sessions.length === 0 ? (
        <p style={{ fontSize: "0.875rem", color: "var(--eduos-muted, #64748b)" }}>No active sessions found.</p>
      ) : null}
      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        {sessions?.map((s) => (
          <article
            key={s.id}
            style={{
              background: "var(--eduos-surface-2, #f8fafc)",
              borderRadius: "0.5rem",
              padding: "0.75rem",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              gap: "0.75rem",
              flexWrap: "wrap",
            }}
          >
            <div>
              <div style={{ fontWeight: 600, fontSize: "0.875rem" }}>
                {s.device_info || "Unknown device"}
              </div>
              <div style={{ fontSize: "0.75rem", color: "var(--eduos-muted, #64748b)", marginTop: "0.15rem" }}>
                {s.ip_address ? `IP: ${s.ip_address} · ` : ""}
                Signed in {formatDate(s.created_at)}
              </div>
            </div>
            <Button
              type="button"
              className="eduos-admin-btn-sm"
              disabled={loading === s.id}
              onClick={() => revokeOne(s.id)}
            >
              {loading === s.id ? "Ending…" : "Sign out"}
            </Button>
          </article>
        ))}
      </div>
    </section>
  );
}
