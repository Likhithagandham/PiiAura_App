"use client";

import type { AcademicsData } from "@eduos/types";

export function CalendarFreezeBanner({ data }: { data: AcademicsData }) {
  const frozen = data.attendanceFrozenThrough;
  const recent = (data.calendarChanges ?? []).slice(0, 3);

  if (!frozen && recent.length === 0) return null;

  return (
    <div
      style={{
        marginBottom: "1rem",
        padding: "0.85rem 1rem",
        background: "#f0f9ff",
        border: "1px solid #7dd3fc",
        borderRadius: "var(--eduos-radius-lg)",
        fontSize: "0.8125rem",
      }}
    >
      {frozen ? (
        <p style={{ margin: "0 0 0.5rem", fontWeight: 600 }}>
          Attendance frozen through {frozen} — past records are not recalculated on calendar changes.
        </p>
      ) : null}
      {recent.length > 0 ? (
        <ul style={{ margin: 0, paddingLeft: "1.1rem", color: "var(--eduos-text-muted)" }}>
          {recent.map((c) => (
            <li key={c.id}>
              {c.description} ({c.effectiveDate})
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
