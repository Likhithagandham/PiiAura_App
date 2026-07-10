"use client";

import type { AuditLogDiffLine, AuditLogEntry } from "@eduos/types";
import { EmptyState, SkeletonText } from "@eduos/ui";
import { useApiData } from "@/lib/queries";

export function AuditLogPanel() {
  const { data, error: queryError } = useApiData<{ entries?: AuditLogEntry[] }>("/api/admin/audit");
  const entries = queryError ? [] : data?.entries ?? null;
  const error = queryError ? (queryError instanceof Error ? queryError.message : "Failed to load audit log") : null;

  if (entries === null) return <SkeletonText lines={4} />;
  if (error) return <p className="eduos-admin-message eduos-admin-message--error">{error}</p>;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <div>
        <h3 className="eduos-subsection-title">Audit log</h3>
        <p style={{ fontSize: "0.875rem", color: "var(--eduos-text-muted)", margin: 0 }}>
          Sensitive changes across admin modules — who did what, when, and from which IP.
        </p>
      </div>
      {entries.length === 0 ? (
        <EmptyState title="No audit entries yet" description="Admin actions will be recorded here." />
      ) : (
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {entries.map((e) => (
            <li
              key={e.id}
              style={{
                padding: "0.875rem 0",
                borderBottom: "1px solid var(--eduos-border)",
                fontSize: "0.8125rem",
              }}
            >
              <div style={{ fontWeight: 600 }}>
                {e.action} · {e.entityType}/{e.entityId}
              </div>
              <div style={{ color: "var(--eduos-text-muted)", marginTop: "0.25rem" }}>
                {e.actorName} ({e.actorRole}) · {e.ipAddress} · {new Date(e.at).toLocaleString()}
              </div>
              {e.diff.length ? (
                <ul style={{ marginTop: "0.5rem", paddingLeft: "1.25rem" }}>
                  {e.diff.map((d: AuditLogDiffLine) => (
                    <li key={`${e.id}-${d.field}`}>
                      <code>{d.field}</code>: {d.before ?? "—"} → {d.after ?? "—"}
                    </li>
                  ))}
                </ul>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
