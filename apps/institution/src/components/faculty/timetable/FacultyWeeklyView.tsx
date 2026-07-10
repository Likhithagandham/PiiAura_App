"use client";

import type { FacultyTimetableDay, FacultyTimetableHolidayItem } from "@eduos/types";

function hhmm(value: string): string {
  return value ? value.slice(0, 5) : "";
}

interface FacultyWeeklyViewProps {
  days: FacultyTimetableDay[];
  holidays: FacultyTimetableHolidayItem[];
}

const COL_DAYS = [1, 2, 3, 4, 5, 6] as const;
const COL_LABELS: Record<number, string> = {
  1: "Monday",
  2: "Tuesday",
  3: "Wednesday",
  4: "Thursday",
  5: "Friday",
  6: "Saturday",
};

export function FacultyWeeklyView({ days, holidays }: FacultyWeeklyViewProps) {
  const byDay = new Map(days.map((d) => [d.dayOfWeek, d]));
  const timeSet = new Set<string>();
  for (const d of days) {
    for (const p of d.periods) timeSet.add(p.startTime);
  }
  const times = [...timeSet].sort();

  if (days.length === 0) {
    return (
      <section className="eduos-panel">
        <p style={{ color: "var(--eduos-text-muted)", margin: 0 }}>No classes on your timetable yet.</p>
      </section>
    );
  }

  return (
    <section className="eduos-panel">
      <h2 className="eduos-section-title" style={{ marginTop: 0 }}>Weekly timetable</h2>
      <div className="eduos-table-wrap" style={{ overflowX: "auto" }}>
        <table className="eduos-admin-table" style={{ minWidth: "40rem" }}>
          <thead>
            <tr>
              <th>Time</th>
              {COL_DAYS.map((dow) => (
                <th key={dow}>{COL_LABELS[dow]}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {times.map((time) => (
              <tr key={time}>
                <td className="eduos-admin-table__nowrap">{hhmm(time)}</td>
                {COL_DAYS.map((dow) => {
                  const day = byDay.get(dow);
                  const period = day?.periods.find((p) => p.startTime === time);
                  if (!period) {
                    const hol = holidays.find((h) => {
                      const d = new Date(`${h.date}T12:00:00`);
                      const iso = d.getDay() === 0 ? 7 : d.getDay();
                      return iso === dow;
                    });
                    if (hol) {
                      return (
                        <td key={dow} style={{ background: "#eff6ff", color: "#1d4ed8", fontSize: "0.75rem" }}>
                          {hol.name}
                        </td>
                      );
                    }
                    return <td key={dow} style={{ color: "var(--eduos-text-muted)" }}>—</td>;
                  }
                  return (
                    <td key={dow}>
                      <div style={{ fontWeight: 700, fontSize: "0.8125rem" }}>{period.subjectName}</div>
                      <div style={{ fontSize: "0.75rem", color: "var(--eduos-text-muted)" }}>
                        {period.classLabel}
                        {period.roomName ? ` · ${period.roomName}` : ""}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
