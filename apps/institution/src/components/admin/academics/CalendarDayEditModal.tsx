"use client";

import { useState } from "react";
import type {
  AcademicCalendarHoliday,
  AcademicsData,
  SubstitutionRecord,
  TimetableSlot,
} from "@eduos/types";
import { Button, Input } from "@eduos/ui";
import { AdminModal } from "../AdminModal";

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const miniBtn: React.CSSProperties = {
  fontSize: "0.7rem",
  color: "var(--eduos-primary)",
  background: "none",
  border: "none",
  cursor: "pointer",
  textDecoration: "underline",
  padding: 0,
};

export function CalendarDayEditModal({
  date,
  data,
  holiday,
  slotsForDay,
  substitutionsForDate,
  onClose,
  onSaveHoliday,
  onDeleteHoliday,
  onEditSlot,
  onAddSlot,
  onAddSubstitution,
  onCancelSubstitution,
}: {
  date: string;
  data: AcademicsData;
  holiday?: AcademicCalendarHoliday;
  slotsForDay: TimetableSlot[];
  substitutionsForDate: SubstitutionRecord[];
  onClose: () => void;
  onSaveHoliday: (payload: { id?: string; name: string; date: string }) => Promise<void>;
  onDeleteHoliday: (holidayId: string) => Promise<void>;
  onEditSlot: (slot: TimetableSlot) => void;
  onAddSlot: (dayOfWeek: number) => void;
  onAddSubstitution: (slotId: string) => void;
  onCancelSubstitution: (substitutionId: string) => Promise<void>;
}) {
  const dow = new Date(date + "T12:00:00").getDay();
  const [holidayName, setHolidayName] = useState(holiday?.name ?? "");
  const [saving, setSaving] = useState(false);

  const subjectName = (id: string) => data.subjects.find((s) => s.id === id)?.name ?? id;
  const classLabel = (id: string) => data.classSections.find((c) => c.id === id)?.label ?? id;
  const facultyName = (id: string) => data.faculty.find((f) => f.userId === id)?.name ?? id;

  async function handleSaveHoliday() {
    if (!holidayName.trim()) return;
    setSaving(true);
    await onSaveHoliday({ id: holiday?.id, name: holidayName.trim(), date });
    setSaving(false);
    onClose();
  }

  return (
    <AdminModal
      title={new Date(date + "T12:00:00").toLocaleDateString("en-IN", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      })}
      onClose={onClose}
      wide
    >
      <section style={{ marginBottom: "1.25rem" }}>
        <h4 style={{ margin: "0 0 0.5rem", fontSize: "0.875rem", fontWeight: 600 }}>Holiday</h4>
        <Input label="Holiday name" value={holidayName} onChange={(e) => setHolidayName(e.target.value)} placeholder="e.g. Diwali break" />
        <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.75rem", flexWrap: "wrap" }}>
          <Button type="button" onClick={handleSaveHoliday} disabled={saving || !holidayName.trim()}>
            {holiday ? "Update holiday" : "Mark as holiday"}
          </Button>
          {holiday ? (
            <Button
              type="button"
              variant="secondary"
              onClick={async () => {
                await onDeleteHoliday(holiday.id);
                onClose();
              }}
            >
              Remove holiday
            </Button>
          ) : null}
        </div>
      </section>

      <section style={{ marginBottom: "1.25rem", paddingTop: "1rem", borderTop: "1px solid var(--eduos-border)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
          <h4 style={{ margin: 0, fontSize: "0.875rem", fontWeight: 600 }}>
            Timetable — every {DAY_NAMES[dow]}
          </h4>
          <Button type="button" variant="secondary" onClick={() => onAddSlot(dow)}>
            Add class
          </Button>
        </div>
        {slotsForDay.length === 0 ? (
          <p style={{ fontSize: "0.8125rem", color: "var(--eduos-text-muted)" }}>No classes scheduled this day.</p>
        ) : (
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {slotsForDay
              .slice()
              .sort((a, b) => a.periodIndex - b.periodIndex)
              .map((slot) => (
                <li
                  key={slot.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "0.75rem",
                    padding: "0.65rem 0.75rem",
                    background: "var(--eduos-bg)",
                    borderRadius: "var(--eduos-radius)",
                    fontSize: "0.8125rem",
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600 }}>
                      P{slot.periodIndex} · {classLabel(slot.classSectionId)} — {subjectName(slot.subjectId)}
                    </div>
                    <div style={{ color: "var(--eduos-text-muted)", fontSize: "0.75rem" }}>
                      {facultyName(slot.facultyUserId)} · {slot.startTime}–{slot.endTime}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "0.35rem", flexShrink: 0 }}>
                    <button type="button" style={miniBtn} onClick={() => onEditSlot(slot)}>
                      Edit
                    </button>
                    <button type="button" style={miniBtn} onClick={() => onAddSubstitution(slot.id)}>
                      Substitute
                    </button>
                  </div>
                </li>
              ))}
          </ul>
        )}
      </section>

      <section style={{ paddingTop: "1rem", borderTop: "1px solid var(--eduos-border)" }}>
        <h4 style={{ margin: "0 0 0.5rem", fontSize: "0.875rem", fontWeight: 600 }}>
          Substitutions on {date}
        </h4>
        {substitutionsForDate.length === 0 ? (
          <p style={{ fontSize: "0.8125rem", color: "var(--eduos-text-muted)" }}>No substitutions for this date.</p>
        ) : (
          <ul style={{ listStyle: "none", padding: 0, margin: 0, fontSize: "0.8125rem" }}>
            {substitutionsForDate.map((sub) => {
              const slot = data.timetableSlots.find((s) => s.id === sub.timetableSlotId);
              return (
                <li
                  key={sub.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "0.5rem 0",
                    borderBottom: "1px solid var(--eduos-border)",
                  }}
                >
                  <span>
                    {slot ? `${classLabel(slot.classSectionId)} — ${subjectName(slot.subjectId)}` : sub.timetableSlotId}
                    {" → "}
                    {facultyName(sub.substituteFacultyUserId)} ({sub.status})
                  </span>
                  {sub.status === "scheduled" ? (
                    <button type="button" style={miniBtn} onClick={() => onCancelSubstitution(sub.id)}>
                      Cancel
                    </button>
                  ) : null}
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <div style={{ marginTop: "1.25rem", display: "flex", justifyContent: "flex-end" }}>
        <Button type="button" variant="secondary" onClick={onClose}>
          Close
        </Button>
      </div>
    </AdminModal>
  );
}
