"use client";

import { useEffect } from "react";
import type { Holiday } from "@eduos/types";
import { InlineLoading } from "@eduos/ui";
import { useApiData } from "@/lib/queries";

interface HolidayCalendarPanelProps {
  refreshKey?: number;
}

function parseHolidayDate(date: string): { month: string; day: string } {
  const d = new Date(date + "T12:00:00");
  return {
    month: d.toLocaleDateString("en-IN", { month: "short" }).toUpperCase(),
    day: String(d.getDate()),
  };
}

export function HolidayCalendarPanel({ refreshKey = 0 }: HolidayCalendarPanelProps) {
  const { data, isPending: loading, refetch } = useApiData<{ holidays?: Holiday[] }>(
    "/api/admin/holidays",
  );
  const load = refetch;
  const holidays = data?.holidays ?? [];

  // Parent bumps refreshKey after marking a holiday — refetch when it changes.
  useEffect(() => {
    void refetch();
  }, [refreshKey, refetch]);

  async function handleDelete(id: string) {
    await fetch(`/api/admin/holidays?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
      credentials: "include",
    });
    load();
  }

  const today = new Date().toISOString().slice(0, 10);
  const upcoming = holidays.filter((h) => h.date >= today).slice(0, 5);

  return (
    <section className="eduos-panel">
      <h2 className="eduos-section-title">Holiday calendar</h2>
      <p style={{ fontSize: "0.8125rem", color: "var(--eduos-text-muted)", margin: "0 0 1rem" }}>
        Declared holidays block attendance marking on those dates.
      </p>
      {loading ? (
        <InlineLoading size="sm" minHeight="4rem" />
      ) : upcoming.length === 0 ? (
        <p style={{ fontSize: "0.875rem", color: "var(--eduos-text-muted)" }}>
          No upcoming holidays. Use &quot;Mark holiday&quot; to add one.
        </p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {upcoming.map((h) => {
            const { month, day } = parseHolidayDate(h.date);
            return (
              <li
                key={h.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "1rem",
                }}
              >
                <div className="eduos-holiday-date">
                  <div className="eduos-holiday-date__month">{month}</div>
                  <div className="eduos-holiday-date__day">{day}</div>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: "0.875rem" }}>{h.name}</div>
                  <div style={{ fontSize: "0.75rem", color: "var(--eduos-text-muted)", marginTop: "0.15rem" }}>
                    {h.scope === "institution" ? "Whole institution" : `${h.classIds.length} class(es)`}
                    {h.blocksAttendance ? " · Attendance blocked" : ""}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleDelete(h.id)}
                  style={{
                    fontSize: "0.75rem",
                    color: "var(--eduos-danger)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  Remove
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
