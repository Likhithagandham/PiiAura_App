"use client";

import Link from "next/link";
import type { FacultyDayDetail, FacultyStaffDayStatus } from "@eduos/types";
import { FACULTY_ROUTES } from "@eduos/constants";
import { Button, EmptyState } from "@eduos/ui";

function statusLabel(status: FacultyStaffDayStatus): string {
  switch (status) {
    case "present":
      return "Present";
    case "absent":
      return "Absent";
    case "leave":
      return "On leave";
    case "not_marked":
      return "Not marked";
    case "not_due":
      return "Upcoming working day";
    case "holiday":
      return "Holiday";
    case "off":
      return "Off day";
    default:
      return status;
  }
}

function statusColor(status: FacultyStaffDayStatus): string {
  switch (status) {
    case "present":
      return "#16a34a";
    case "absent":
    case "leave":
      return "#dc2626";
    case "not_marked":
      return "#ca8a04";
    case "holiday":
      return "#2563eb";
    default:
      return "var(--eduos-text-muted)";
  }
}

interface FacultyDayDetailPanelProps {
  detail: FacultyDayDetail | null;
}

export function FacultyDayDetailPanel({ detail }: FacultyDayDetailPanelProps) {
  if (!detail) {
    return (
      <section className="eduos-panel">
        <EmptyState compact title="Select a date" description="Click a day to see your attendance for that date." />
      </section>
    );
  }

  const formatted = new Date(`${detail.date}T12:00:00`).toLocaleDateString("en", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <section className="eduos-panel">
      <h2 className="eduos-section-title" style={{ marginTop: 0 }}>{formatted}</h2>

      <article
        style={{
          border: "1px solid var(--eduos-border)",
          borderRadius: "var(--eduos-radius-lg)",
          padding: "1rem",
          marginTop: "0.75rem",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", gap: "0.75rem", flexWrap: "wrap" }}>
          <div style={{ fontWeight: 800, fontSize: "0.875rem" }}>My attendance</div>
          <span style={{ fontSize: "0.75rem", fontWeight: 700, color: statusColor(detail.staffStatus) }}>
            {statusLabel(detail.staffStatus)}
          </span>
        </div>

        {detail.dayKind === "leave" && detail.leaveReason ? (
          <p style={{ margin: "0.5rem 0 0", fontSize: "0.875rem", color: "var(--eduos-text-muted)" }}>
            {detail.leaveReason}
          </p>
        ) : null}

        {detail.dayKind === "holiday" && detail.holidayName ? (
          <p style={{ margin: "0.5rem 0 0", fontSize: "0.875rem", color: "var(--eduos-text-muted)" }}>
            {detail.holidayName}
          </p>
        ) : null}

        {detail.staffStatus === "not_marked" ? (
          <p style={{ margin: "0.5rem 0 0", fontSize: "0.8125rem", color: "var(--eduos-text-muted)" }}>
            You have not marked your attendance for this day.
          </p>
        ) : null}

        {detail.canCheckIn ? (
          <Link href={FACULTY_ROUTES.dashboard} style={{ display: "inline-block", marginTop: "0.75rem", textDecoration: "none" }}>
            <Button type="button" variant="primary" className="eduos-admin-btn-sm">
              Mark my attendance
            </Button>
          </Link>
        ) : null}
      </article>

      <p style={{ marginTop: "0.75rem", fontSize: "0.75rem", color: "var(--eduos-text-muted)" }}>
        For your teaching schedule, switch to the Weekly timetable tab.
      </p>
    </section>
  );
}
