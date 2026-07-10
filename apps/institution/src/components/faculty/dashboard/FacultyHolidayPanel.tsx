"use client";

import type { Holiday } from "@eduos/types";
import { EmptyState } from "@eduos/ui";

interface FacultyHolidayPanelProps {
  holidays: Holiday[];
}

function parseHolidayDate(date: string): { month: string; day: string } {
  const d = new Date(date + "T12:00:00");
  return {
    month: d.toLocaleDateString("en-IN", { month: "short" }).toUpperCase(),
    day: String(d.getDate()),
  };
}

export function FacultyHolidayPanel({ holidays }: FacultyHolidayPanelProps) {
  return (
    <section className="eduos-panel">
      <h2 className="eduos-section-title">Holiday calendar</h2>
      <p className="eduos-section-desc" style={{ marginBottom: "1rem" }}>
        Attendance cannot be marked on declared institution holidays.
      </p>
      {holidays.length === 0 ? (
        <EmptyState compact title="No upcoming holidays" description="Declared institution holidays will appear here." />
      ) : (
        <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: "0.625rem" }}>
          {holidays.map((h) => {
            const { month, day } = parseHolidayDate(h.date);
            return (
              <li
                key={h.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  padding: "0.5rem 0",
                  borderBottom: "1px solid var(--eduos-border)",
                }}
              >
                <div className="eduos-holiday-date">
                  <div className="eduos-holiday-date__month">{month}</div>
                  <div className="eduos-holiday-date__day">{day}</div>
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: "0.875rem" }}>{h.name}</div>
                  <div style={{ fontSize: "0.75rem", color: "var(--eduos-text-muted)", marginTop: "0.15rem" }}>
                    {h.scope === "institution" ? "Institution-wide" : "Selected classes"}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
