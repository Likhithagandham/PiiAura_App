"use client";

import Link from "next/link";
import type { FacultyDashboardData } from "@eduos/types";
import { EmptyState } from "@eduos/ui";
import { FACULTY_ROUTES } from "@eduos/constants";

interface FacultyTodaySchedulePanelProps {
  schedule: FacultyDashboardData["schedule"];
  today: string;
}

export function FacultyTodaySchedulePanel({ schedule, today }: FacultyTodaySchedulePanelProps) {
  return (
    <section className="eduos-panel">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
        <h2 className="eduos-section-title">Today&apos;s schedule</h2>
        <Link href={FACULTY_ROUTES.timetable} className="eduos-link" style={{ fontSize: "0.75rem" }}>
          View timetable
        </Link>
      </div>
      {schedule.length === 0 ? (
        <EmptyState compact title="No sessions today" description="Your scheduled classes for today will appear here." />
      ) : (
        <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          {schedule.map((s) => (
            <li key={s.id}>
              <Link
                href={`${FACULTY_ROUTES.timetable}?date=${encodeURIComponent(today)}&entryId=${encodeURIComponent(s.id)}`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  padding: "0.75rem",
                  border: "1px solid var(--eduos-border)",
                  borderRadius: "var(--eduos-radius)",
                  background: "var(--eduos-bg)",
                  textDecoration: "none",
                  color: "inherit",
                }}
              >
                <div className="eduos-holiday-date" style={{ width: "auto", minWidth: "3.25rem", padding: "0.35rem 0.5rem" }}>
                  <div className="eduos-holiday-date__month" style={{ fontSize: "0.55rem" }}>
                    {s.startTime.slice(0, 5)}
                  </div>
                  <div className="eduos-holiday-date__day" style={{ fontSize: "0.875rem" }}>
                    {s.endTime.slice(0, 5)}
                  </div>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: "0.875rem" }}>{s.classLabel}</div>
                  <div style={{ fontSize: "0.8125rem", color: "var(--eduos-text-muted)", marginTop: "0.15rem" }}>
                    {s.subjectName}
                    {s.roomName ? ` · ${s.roomName}` : s.roomId ? ` · ${s.roomId}` : ""}
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
