"use client";

import type { FacultyCalendarDaySummary } from "@eduos/types";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function cellColor(day: FacultyCalendarDaySummary, today: string): string {
  if (day.dayKind === "holiday") return "#dbeafe";
  if (day.dayKind === "leave") return "#fee2e2";
  if (day.dayKind === "off") return "var(--eduos-bg)";
  if (day.staffStatus === "present") return "#dcfce7";
  if (day.staffStatus === "absent") return "#fee2e2";
  if (day.staffStatus === "leave") return "#fee2e2";
  if (day.date <= today) return "#fef9c3";
  return "var(--eduos-card)";
}

function cellBorder(day: FacultyCalendarDaySummary, selected: boolean): string {
  if (selected) return "2px solid var(--eduos-brand)";
  if (day.dayKind === "holiday") return "1px solid #93c5fd";
  if (day.dayKind === "leave" || day.staffStatus === "absent") return "1px solid #fca5a5";
  return "1px solid var(--eduos-border)";
}

function dayLabel(day: FacultyCalendarDaySummary, today: string): string | null {
  if (day.dayKind === "holiday") return day.holidayName ?? "Holiday";
  if (day.dayKind === "leave") return "Leave";
  if (day.dayKind === "off") return null;
  if (day.staffStatus === "present") return "Present";
  if (day.staffStatus === "absent") return "Absent";
  if (day.staffStatus === "leave") return "Leave";
  if (day.date > today) return null;
  return "Not marked";
}

function dotColor(day: FacultyCalendarDaySummary, today: string): string | null {
  if (day.dayKind === "holiday") return "#2563eb";
  if (day.dayKind === "leave") return "#dc2626";
  if (day.staffStatus === "present") return "#16a34a";
  if (day.staffStatus === "absent" || day.staffStatus === "leave") return "#dc2626";
  if (day.dayKind === "working" && day.date <= today) return "#ca8a04";
  return null;
}

interface FacultyCalendarViewProps {
  year: number;
  month: number;
  days: FacultyCalendarDaySummary[];
  selectedDate: string | null;
  onSelectDate: (date: string) => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
}

export function FacultyCalendarView({
  year,
  month,
  days,
  selectedDate,
  onSelectDate,
  onPrevMonth,
  onNextMonth,
}: FacultyCalendarViewProps) {
  const monthLabel = new Date(year, month - 1, 1).toLocaleString("en", { month: "long", year: "numeric" });
  const first = new Date(year, month - 1, 1);
  const lastDay = new Date(year, month, 0).getDate();
  const startPad = first.getDay();
  const dayMap = new Map(days.map((d) => [d.date, d]));
  const today = new Date().toISOString().slice(0, 10);

  const cells: (FacultyCalendarDaySummary | null)[] = [];
  for (let i = 0; i < startPad; i++) cells.push(null);
  for (let d = 1; d <= lastDay; d++) {
    const date = `${year}-${String(month).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    cells.push(dayMap.get(date) ?? {
      date,
      dayKind: "working",
    });
  }

  return (
    <section className="eduos-panel">
      <div className="eduos-portal-toolbar">
        <h2 className="eduos-section-title" style={{ margin: 0 }}>{monthLabel}</h2>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button type="button" className="eduos-btn eduos-btn-secondary eduos-admin-btn-sm" onClick={onPrevMonth}>
            Previous
          </button>
          <button type="button" className="eduos-btn eduos-btn-secondary eduos-admin-btn-sm" onClick={onNextMonth}>
            Next
          </button>
        </div>
      </div>

      <p className="eduos-section-desc" style={{ marginTop: "0.5rem", marginBottom: 0 }}>
        Your personal attendance — present, absent, leave, and holidays.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          gap: "0.35rem",
          marginTop: "0.75rem",
          fontSize: "0.75rem",
        }}
      >
        {WEEKDAYS.map((w) => (
          <div key={w} style={{ textAlign: "center", fontWeight: 700, color: "var(--eduos-text-muted)", padding: "0.25rem" }}>
            {w}
          </div>
        ))}
        {cells.map((day, i) => {
          if (!day) return <div key={`pad-${i}`} />;
          const selected = selectedDate === day.date;
          const dot = dotColor(day, today);
          const label = dayLabel(day, today);
          return (
            <button
              key={day.date}
              type="button"
              onClick={() => onSelectDate(day.date)}
              style={{
                minHeight: "4.5rem",
                padding: "0.35rem",
                borderRadius: "var(--eduos-radius)",
                border: cellBorder(day, selected),
                background: cellColor(day, today),
                cursor: "pointer",
                textAlign: "left",
                display: "flex",
                flexDirection: "column",
                gap: "0.15rem",
              }}
            >
              <span style={{ fontWeight: day.date === today ? 800 : 600, color: day.date === today ? "var(--eduos-brand)" : undefined }}>
                {Number(day.date.slice(8))}
              </span>
              {label ? (
                <span style={{ fontSize: "0.625rem", color: "var(--eduos-text-muted)", lineHeight: 1.2 }}>{label}</span>
              ) : null}
              {dot ? (
                <span
                  style={{
                    width: "0.5rem",
                    height: "0.5rem",
                    borderRadius: "50%",
                    background: dot,
                    marginTop: "auto",
                  }}
                />
              ) : null}
            </button>
          );
        })}
      </div>

      <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginTop: "0.75rem", fontSize: "0.6875rem", color: "var(--eduos-text-muted)" }}>
        <span><span style={{ color: "#16a34a" }}>●</span> Present</span>
        <span><span style={{ color: "#ca8a04" }}>●</span> Not marked</span>
        <span><span style={{ color: "#dc2626" }}>●</span> Absent / leave</span>
        <span><span style={{ color: "#2563eb" }}>●</span> Holiday</span>
      </div>
    </section>
  );
}
