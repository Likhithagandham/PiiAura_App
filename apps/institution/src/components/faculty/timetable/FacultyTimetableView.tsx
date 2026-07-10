"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState } from "react";
import type { FacultyTimetableData } from "@eduos/types";
import { SkeletonText } from "@eduos/ui";
import { PortalTabs } from "@/components/layout/PortalTabs";
import { useApiData } from "@/lib/queries";
import { FacultyCalendarView } from "./FacultyCalendarView";
import { FacultyDayDetailPanel } from "./FacultyDayDetailPanel";
import { FacultyTimetableSummary } from "./FacultyTimetableSummary";
import { FacultyWeeklyView } from "./FacultyWeeklyView";

const VIEWS = ["calendar", "weekly"] as const;
type ViewMode = (typeof VIEWS)[number];

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function FacultyTimetableViewInner() {
  const searchParams = useSearchParams();
  const initialDate = searchParams.get("date") ?? todayIso();
  const parsed = initialDate ? new Date(`${initialDate}T12:00:00`) : new Date();

  const [view, setView] = useState<ViewMode>("calendar");
  const [year, setYear] = useState(parsed.getFullYear());
  const [month, setMonth] = useState(parsed.getMonth() + 1);
  const [selectedDate, setSelectedDate] = useState<string | null>(initialDate);

  const timetableUrl = useMemo(() => {
    const qs = new URLSearchParams({ year: String(year), month: String(month) });
    if (selectedDate) qs.set("date", selectedDate);
    return `/api/faculty/timetable?${qs.toString()}`;
  }, [year, month, selectedDate]);

  const { data, error: queryError, isPending: loading } = useApiData<FacultyTimetableData>(timetableUrl);
  const error = queryError
    ? queryError instanceof Error
      ? queryError.message
      : "Failed to load."
    : null;

  const shiftMonth = (delta: number) => {
    const d = new Date(year, month - 1 + delta, 1);
    setYear(d.getFullYear());
    setMonth(d.getMonth() + 1);
  };

  if (loading && !data) return <SkeletonText lines={6} />;
  if (error && !data) return <p className="eduos-admin-message eduos-admin-message--error">{error}</p>;
  if (!data) return null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <FacultyTimetableSummary summary={data.summary} />

      <PortalTabs
        className="eduos-portal-tabs"
        active={view}
        onChange={setView}
        tabs={[
          { id: "calendar", label: "Calendar view" },
          { id: "weekly", label: "Weekly timetable" },
        ]}
      />

      {view === "calendar" ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1.4fr) minmax(0, 1fr)",
            gap: "1rem",
            alignItems: "start",
          }}
        >
          <FacultyCalendarView
            year={data.calendar.year}
            month={data.calendar.month}
            days={data.calendar.days}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
            onPrevMonth={() => shiftMonth(-1)}
            onNextMonth={() => shiftMonth(1)}
          />
          <FacultyDayDetailPanel detail={data.dayDetail ?? null} />
        </div>
      ) : (
        <FacultyWeeklyView days={data.weekly.days} holidays={data.calendar.holidays} />
      )}
    </div>
  );
}

export function FacultyTimetableView() {
  return (
    <Suspense fallback={<SkeletonText lines={6} />}>
      <FacultyTimetableViewInner />
    </Suspense>
  );
}
