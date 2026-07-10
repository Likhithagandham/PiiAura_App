"use client";

import type { FacultyInvigilationData } from "@eduos/types";
import { FacultyShell } from "@/components/faculty/FacultyShell";
import { Button, InlineLoading } from "@eduos/ui";
import { useApiData } from "@/lib/queries";

const cardStyle: React.CSSProperties = {
  background: "var(--eduos-card)",
  border: "1px solid var(--eduos-border)",
  borderRadius: "var(--eduos-radius-lg)",
  padding: "1.25rem",
};

const tableStyle: React.CSSProperties = { width: "100%", borderCollapse: "collapse", fontSize: "0.8125rem" };
const thStyle: React.CSSProperties = {
  textAlign: "left",
  padding: "0.5rem 0.75rem",
  borderBottom: "1px solid var(--eduos-border)",
  color: "var(--eduos-text-muted)",
  fontWeight: 700,
};
const tdStyle: React.CSSProperties = { padding: "0.5rem 0.75rem", borderBottom: "1px solid var(--eduos-border)" };

export default function FacultyInvigilationPage() {
  const { data, error: queryError, refetch } = useApiData<FacultyInvigilationData>(
    "/api/faculty/invigilation",
  );
  const load = refetch;
  const error = queryError ? (queryError instanceof Error ? queryError.message : "Failed to load.") : null;

  return (
    <FacultyShell title="Invigilation">
      {error ? <p style={{ color: "var(--eduos-danger)" }}>{error}</p> : null}
      <section style={cardStyle}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: "0.75rem", flexWrap: "wrap" }}>
          <div>
            <h2 style={{ margin: 0, fontSize: "1rem", fontWeight: 800 }}>My invigilation duties</h2>
            <p style={{ margin: "0.35rem 0 0", fontSize: "0.8125rem", color: "var(--eduos-text-muted)" }}>
              Assigned by admin from the examinations module.
            </p>
          </div>
          <Button type="button" variant="secondary" onClick={() => void load()}>
            Refresh
          </Button>
        </div>

        {!data ? (
          <InlineLoading size="sm" minHeight="4rem" />
        ) : (
        <table style={{ ...tableStyle, marginTop: "0.75rem" }}>
          <thead>
            <tr>
              <th style={thStyle}>Exam slot</th>
              <th style={thStyle}>Assigned at</th>
              <th style={thStyle}>Assigned by</th>
            </tr>
          </thead>
          <tbody>
            {data.assignments.length === 0 ? (
              <tr>
                <td colSpan={3} style={{ ...tdStyle, color: "var(--eduos-text-muted)" }}>
                  No assignments yet.
                </td>
              </tr>
            ) : (
              data.assignments.map((a) => (
                <tr key={a.examSlotId}>
                  <td style={tdStyle}>{a.slotLabel ?? a.examSlotId}</td>
                  <td style={tdStyle}>{new Date(a.assignedAt).toLocaleString()}</td>
                  <td style={tdStyle}>{a.assignedBy}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        )}
      </section>
    </FacultyShell>
  );
}

