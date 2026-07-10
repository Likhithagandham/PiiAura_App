"use client";

import type { FacultyTimetableSummary } from "@eduos/types";

const cardStyle: React.CSSProperties = {
  flex: "1 1 8rem",
  padding: "0.875rem 1rem",
  borderRadius: "var(--eduos-radius-lg)",
  border: "1px solid var(--eduos-border)",
  background: "var(--eduos-card)",
};

export function FacultyTimetableSummary({ summary }: { summary: FacultyTimetableSummary }) {
  const items = [
    { label: "Present", value: `${summary.presentDays} days`, color: "#16a34a" },
    { label: "Absent", value: `${summary.absentDays} days`, color: "var(--eduos-danger)" },
    { label: "Leave", value: `${summary.leaveDays} days`, color: "#dc2626" },
    { label: "Attendance", value: `${summary.attendancePercent}%`, color: "var(--eduos-brand)" },
  ];

  return (
    <section>
      <p className="eduos-section-desc" style={{ marginBottom: "0.5rem" }}>
        Your attendance — {summary.monthLabel}
      </p>
      <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
        {items.map((item) => (
          <div key={item.label} style={cardStyle}>
            <div style={{ fontSize: "0.6875rem", fontWeight: 700, color: "var(--eduos-text-muted)", textTransform: "uppercase" }}>
              {item.label}
            </div>
            <div style={{ fontSize: "1.25rem", fontWeight: 800, marginTop: "0.25rem", color: item.color }}>
              {item.value}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
