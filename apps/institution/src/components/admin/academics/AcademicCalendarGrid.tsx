"use client";

import { useMemo, useState } from "react";
import type {
  AcademicCalendarHoliday,
  CalendarPeriod,
  SubstitutionRecord,
  TimetableSlot,
  WorkingDayRule,
} from "@eduos/types";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

type DayKind = "working" | "off" | "holiday" | "outside";

interface CalendarCell {
  date: string | null;
  day: number | null;
  kind: DayKind;
  holiday?: AcademicCalendarHoliday;
  period?: CalendarPeriod;
  isToday: boolean;
  dayOfWeek: number;
}

function toDateStr(y: number, m: number, d: number): string {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

function buildMonthCells(
  year: number,
  month: number,
  workingDays: WorkingDayRule[],
  holidays: AcademicCalendarHoliday[],
  periods: CalendarPeriod[],
): CalendarCell[] {
  const first = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0).getDate();
  const startPad = first.getDay();
  const today = new Date().toISOString().slice(0, 10);
  const holidayByDate = new Map(holidays.map((h) => [h.date, h]));
  const cells: CalendarCell[] = [];

  for (let i = 0; i < startPad; i++) {
    cells.push({ date: null, day: null, kind: "outside", isToday: false, dayOfWeek: 0 });
  }

  for (let d = 1; d <= lastDay; d++) {
    const date = toDateStr(year, month, d);
    const dow = new Date(year, month, d).getDay();
    const rule = workingDays.find((w) => w.dayOfWeek === dow);
    const holiday = holidayByDate.get(date);
    const period = periods.find((p) => date >= p.startDate && date <= p.endDate);

    let kind: DayKind = "working";
    if (holiday) kind = "holiday";
    else if (!rule?.isWorkingDay) kind = "off";
    else if (periods.length > 0 && !period) kind = "outside";

    cells.push({
      date,
      day: d,
      kind,
      holiday,
      period,
      isToday: date === today,
      dayOfWeek: dow,
    });
  }

  while (cells.length % 7 !== 0) {
    cells.push({ date: null, day: null, kind: "outside", isToday: false, dayOfWeek: 0 });
  }

  return cells;
}

const kindStyles: Record<DayKind, { bg: string; border: string; text: string }> = {
  working: { bg: "#f0fdf4", border: "#bbf7d0", text: "var(--eduos-text)" },
  off: { bg: "#f4f4f5", border: "#e4e4e7", text: "var(--eduos-text-muted)" },
  holiday: { bg: "#fffbeb", border: "#fcd34d", text: "#92400e" },
  outside: { bg: "#fafafa", border: "#f0f0f0", text: "var(--eduos-text-muted)" },
};

export function AcademicCalendarGrid({
  workingDays,
  holidays,
  periods,
  periodKindLabel,
  timetableSlots,
  substitutions,
  subjectLabels,
  onEditDay,
}: {
  workingDays: WorkingDayRule[];
  holidays: AcademicCalendarHoliday[];
  periods: CalendarPeriod[];
  periodKindLabel: string;
  timetableSlots: TimetableSlot[];
  substitutions: SubstitutionRecord[];
  subjectLabels: Record<string, string>;
  onEditDay: (date: string) => void;
}) {
  const now = new Date();
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth());

  const cells = useMemo(
    () => buildMonthCells(viewYear, viewMonth, workingDays, holidays, periods),
    [viewYear, viewMonth, workingDays, holidays, periods],
  );

  const subsByDate = useMemo(() => {
    const m = new Map<string, SubstitutionRecord[]>();
    for (const s of substitutions) {
      if (s.status === "cancelled") continue;
      const list = m.get(s.date) ?? [];
      list.push(s);
      m.set(s.date, list);
    }
    return m;
  }, [substitutions]);

  const monthLabel = new Date(viewYear, viewMonth, 1).toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
  });

  const activePeriod = periods.find((p) => {
    const mid = toDateStr(viewYear, viewMonth, 15);
    return mid >= p.startDate && mid <= p.endDate;
  });

  function shiftMonth(delta: number) {
    const d = new Date(viewYear, viewMonth + delta, 1);
    setViewYear(d.getFullYear());
    setViewMonth(d.getMonth());
  }

  return (
    <div style={{ ...cardOuter, background: "linear-gradient(180deg, #fafbff 0%, var(--eduos-card) 120px)" }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap", marginBottom: "1rem" }}>
        <div>
          <h3 style={{ margin: 0, fontSize: "1.05rem", fontWeight: 600 }}>Academic calendar</h3>
          <p style={{ margin: "0.25rem 0 0", fontSize: "0.8125rem", color: "var(--eduos-text-muted)" }}>
            Click any day to edit holidays, classes, and substitutions
          </p>
          {activePeriod ? (
            <span style={{ display: "inline-block", marginTop: "0.5rem", fontSize: "0.75rem", padding: "0.2rem 0.55rem", borderRadius: 999, background: "var(--eduos-primary-light)", color: "var(--eduos-primary)", fontWeight: 600 }}>
              {activePeriod.label}
            </span>
          ) : null}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
          <NavBtn onClick={() => shiftMonth(-1)} aria-label="Previous month">‹</NavBtn>
          <span style={{ fontWeight: 600, fontSize: "0.9375rem", minWidth: "9rem", textAlign: "center" }}>{monthLabel}</span>
          <NavBtn onClick={() => shiftMonth(1)} aria-label="Next month">›</NavBtn>
          <button type="button" onClick={() => { setViewYear(now.getFullYear()); setViewMonth(now.getMonth()); }} style={{ marginLeft: "0.35rem", fontSize: "0.75rem", padding: "0.35rem 0.65rem", borderRadius: "var(--eduos-radius)", border: "1px solid var(--eduos-border)", background: "var(--eduos-card)", cursor: "pointer" }}>
            Today
          </button>
        </div>
      </div>

      <div style={{ border: "1px solid var(--eduos-border)", borderRadius: "var(--eduos-radius-lg)", overflow: "hidden", background: "var(--eduos-card)", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", background: "var(--eduos-bg)", borderBottom: "1px solid var(--eduos-border)" }}>
          {WEEKDAYS.map((label, i) => (
            <div key={label} style={{ padding: "0.5rem 0.25rem", textAlign: "center", fontSize: "0.7rem", fontWeight: 600, color: !workingDays.find((w) => w.dayOfWeek === i)?.isWorkingDay ? "var(--eduos-text-muted)" : "var(--eduos-text)", textTransform: "uppercase" }}>
              {label}
            </div>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)" }}>
          {cells.map((cell, idx) => {
            if (!cell.date || cell.day === null) {
              return <div key={`empty-${idx}`} style={{ minHeight: 88, background: "#fafafa" }} />;
            }

            const style = kindStyles[cell.kind];
            const daySlots = timetableSlots.filter((s) => s.dayOfWeek === cell.dayOfWeek);
            const daySubs = subsByDate.get(cell.date) ?? [];

            return (
              <button
                key={cell.date}
                type="button"
                onClick={() => onEditDay(cell.date!)}
                style={{
                  minHeight: 88,
                  padding: "0.3rem 0.35rem",
                  border: `1px solid ${cell.isToday ? "var(--eduos-primary)" : style.border}`,
                  borderWidth: cell.isToday ? 2 : 1,
                  background: style.bg,
                  color: style.text,
                  textAlign: "left",
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.12rem",
                  font: "inherit",
                  position: "relative",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <span style={{ fontSize: "0.8125rem", fontWeight: cell.isToday ? 700 : 500, color: cell.isToday ? "var(--eduos-primary)" : style.text }}>
                    {cell.day}
                  </span>
                  <span style={{ fontSize: "0.55rem", color: "var(--eduos-primary)", fontWeight: 600, textDecoration: "underline" }}>Edit</span>
                </div>
                {cell.holiday ? (
                  <span style={{ fontSize: "0.6rem", fontWeight: 600, lineHeight: 1.15 }}>{cell.holiday.name}</span>
                ) : null}
                {daySlots.slice(0, 2).map((s) => (
                  <span key={s.id} style={{ fontSize: "0.55rem", opacity: 0.85, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    P{s.periodIndex} {subjectLabels[s.subjectId] ?? "Class"}
                  </span>
                ))}
                {daySlots.length > 2 ? (
                  <span style={{ fontSize: "0.55rem", color: "var(--eduos-text-muted)" }}>+{daySlots.length - 2} classes</span>
                ) : null}
                {daySubs.length > 0 ? (
                  <span style={{ fontSize: "0.55rem", color: "#b45309" }}>{daySubs.length} sub</span>
                ) : null}
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem 1.25rem", marginTop: "0.85rem", fontSize: "0.75rem", color: "var(--eduos-text-muted)" }}>
        <LegendSwatch label="Working day" bg={kindStyles.working.bg} border={kindStyles.working.border} />
        <LegendSwatch label="Weekly off" bg={kindStyles.off.bg} border={kindStyles.off.border} />
        <LegendSwatch label="Holiday" bg={kindStyles.holiday.bg} border={kindStyles.holiday.border} />
        <LegendSwatch label="Class slot" hint="blue chip in tile" />
        <span>Click tile → edit holiday &amp; timetable</span>
      </div>
    </div>
  );
}

function NavBtn({ children, onClick, ...rest }: { children: React.ReactNode; onClick: () => void; "aria-label"?: string }) {
  return (
    <button type="button" onClick={onClick} {...rest} style={{ width: 32, height: 32, borderRadius: "var(--eduos-radius)", border: "1px solid var(--eduos-border)", background: "var(--eduos-card)", cursor: "pointer", fontSize: "1.1rem", display: "flex", alignItems: "center", justifyContent: "center" }}>
      {children}
    </button>
  );
}

function LegendSwatch({ label, bg, border, hint }: { label: string; bg?: string; border?: string; hint?: string }) {
  return (
    <span style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
      <span style={{ width: 14, height: 14, borderRadius: 2, background: bg ?? "#eff6ff", border: `1px solid ${border ?? "#bfdbfe"}`, display: "inline-block" }} />
      {label}
      {hint ? ` (${hint})` : ""}
    </span>
  );
}

const cardOuter: React.CSSProperties = {
  background: "var(--eduos-card)",
  border: "1px solid var(--eduos-border)",
  borderRadius: "var(--eduos-radius-lg)",
  padding: "1.25rem",
};
