"use client";

import { EmptyState, SkeletonTable } from "@eduos/ui";
import { useSuperAdminOperationsOverviewQuery } from "@/lib/queries";

const ROLE_CHIPS = [
  { key: "admins" as const, label: "Admins", color: "#805ad5" },
  { key: "faculty" as const, label: "Faculty", color: "#3182ce" },
  { key: "students" as const, label: "Students", color: "#38a169" },
  { key: "parents" as const, label: "Parents", color: "#d69e2e" },
];

export function SuperAdminOperationsOverview({
  onSelectBranch,
}: {
  onSelectBranch: (branchId: string) => void;
}) {
  const { data, error } = useSuperAdminOperationsOverviewQuery();

  if (error) {
    return (
      <p className="eduos-admin-message eduos-admin-message--error">
        {error instanceof Error ? error.message : "Failed to load overview"}
      </p>
    );
  }

  if (!data) {
    return <SkeletonTable rows={3} columns={4} label="Loading branch overview…" />;
  }

  if (data.branches.length === 0) {
    return (
      <EmptyState
        title="No branches yet"
        description="Create a branch under the Branches tab to start managing people across your institution."
      />
    );
  }

  return (
    <div>
      <section
        className="eduos-panel"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(8rem, 1fr))",
          gap: "0.75rem",
          marginBottom: "1rem",
        }}
      >
        {ROLE_CHIPS.map((chip) => (
          <div key={chip.key} style={{ textAlign: "center" }}>
            <div style={{ fontSize: "1.5rem", fontWeight: 800 }}>{data.totals[chip.key]}</div>
            <div
              style={{
                fontSize: "0.75rem",
                fontWeight: 600,
                color: chip.color,
                textTransform: "uppercase",
                letterSpacing: "0.04em",
              }}
            >
              {chip.label}
            </div>
          </div>
        ))}
      </section>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(16rem, 1fr))",
          gap: "1rem",
        }}
      >
        {data.branches.map((b) => (
          <button
            key={b.branchId}
            type="button"
            onClick={() => onSelectBranch(b.branchId)}
            className="eduos-panel"
            style={{
              textAlign: "left",
              cursor: "pointer",
              border: "1px solid var(--eduos-border)",
              transition: "box-shadow 0.15s",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", gap: "0.5rem" }}>
              <div>
                <div style={{ fontWeight: 800, fontSize: "1rem" }}>{b.branchName}</div>
                <div style={{ fontSize: "0.75rem", color: "var(--eduos-text-muted)" }}>
                  {b.code} · {b.city}
                </div>
              </div>
              <span
                style={{
                  fontSize: "0.65rem",
                  fontWeight: 700,
                  padding: "0.2rem 0.45rem",
                  borderRadius: "999px",
                  background: b.isActive ? "var(--eduos-primary-light)" : "var(--eduos-border)",
                  color: b.isActive ? "var(--eduos-primary)" : "var(--eduos-text-muted)",
                  alignSelf: "flex-start",
                }}
              >
                {b.isActive ? "Active" : "Inactive"}
              </span>
            </div>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "0.35rem",
                marginTop: "0.75rem",
              }}
            >
              {ROLE_CHIPS.map((chip) => (
                <span
                  key={chip.key}
                  style={{
                    fontSize: "0.7rem",
                    fontWeight: 600,
                    padding: "0.2rem 0.5rem",
                    borderRadius: "999px",
                    color: "#fff",
                    background: chip.color,
                  }}
                >
                  {b[chip.key]} {chip.label}
                </span>
              ))}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
