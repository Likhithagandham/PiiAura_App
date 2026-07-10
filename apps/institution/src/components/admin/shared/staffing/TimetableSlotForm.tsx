"use client";

import { useEffect, useMemo } from "react";
import type { AcademicsData } from "@eduos/types";
import { Input } from "@eduos/ui";
import { StaffingSummaryLink } from "./StaffingSummaryLink";
import {
  applyStaffingFaculty,
  hasStaffingTeacher,
  subjectsForSection,
  type TimetableSlotFormState,
} from "./timetableSlotDefaults";
import { useStaffingLookup } from "./useStaffingLookup";

export function TimetableSlotForm({
  data,
  form,
  setForm,
  lockClassSectionId,
  editingFacultyUserId,
}: {
  data: AcademicsData;
  form: TimetableSlotFormState;
  setForm: (f: TimetableSlotFormState) => void;
  /** When set (timetable class filter), class is read-only. */
  lockClassSectionId?: string;
  /** Original slot faculty when editing — for differs-from-staffing note. */
  editingFacultyUserId?: string;
}) {
  const periodId = data.currentPeriodId ?? data.periods[0]?.id ?? "";
  const lookup = useStaffingLookup(data, periodId);
  const section = data.classSections.find((c) => c.id === form.classSectionId);
  const gradeSubjects = useMemo(
    () => subjectsForSection(section, data.subjects),
    [section, data.subjects],
  );
  const standing = lookup.getSubjectTeacher(form.classSectionId, form.subjectId);
  const staffed = hasStaffingTeacher(data, form.classSectionId, form.subjectId);
  const selectStyle = { width: "100%", marginBottom: "0.75rem" };

  useEffect(() => {
    if (lockClassSectionId && form.classSectionId !== lockClassSectionId) {
      patchForm({ classSectionId: lockClassSectionId });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lockClassSectionId]);

  function patchForm(next: Partial<TimetableSlotFormState>) {
    let merged = { ...form, ...next };

    if (next.classSectionId !== undefined) {
      const newSection = data.classSections.find((c) => c.id === merged.classSectionId);
      const subs = subjectsForSection(newSection, data.subjects);
      if (!subs.some((s) => s.id === merged.subjectId)) {
        merged.subjectId = subs[0]?.id ?? "";
      }
    }

    if (next.classSectionId !== undefined || next.subjectId !== undefined) {
      merged = applyStaffingFaculty(data, merged);
    }

    setForm(merged);
  }

  const displayFacultyId = standing?.facultyUserId ?? form.facultyUserId;
  const displayFacultyName = displayFacultyId
    ? lookup.facultyName(displayFacultyId)
    : "No teacher assigned";

  const staffingFacultyName = standing
    ? lookup.facultyName(standing.facultyUserId)
    : null;
  const differsFromStaffing =
    editingFacultyUserId
    && staffingFacultyName
    && editingFacultyUserId !== standing?.facultyUserId
    && lookup.facultyName(editingFacultyUserId) !== staffingFacultyName;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
      {lockClassSectionId ? (
        <label className="eduos-label" style={{ gridColumn: "1 / -1" }}>
          Class
          <div
            className="eduos-input"
            style={{ ...selectStyle, background: "var(--eduos-surface-muted)", cursor: "default" }}
          >
            {section?.label ?? lockClassSectionId}
          </div>
        </label>
      ) : (
        <label className="eduos-label">
          Class
          <select
            className="eduos-input"
            style={selectStyle}
            value={form.classSectionId}
            onChange={(e) => patchForm({ classSectionId: e.target.value })}
          >
            {data.classSections.map((c) => (
              <option key={c.id} value={c.id}>{c.label}</option>
            ))}
          </select>
        </label>
      )}

      <label className="eduos-label">
        Subject
        <select
          className="eduos-input"
          style={selectStyle}
          value={form.subjectId}
          onChange={(e) => patchForm({ subjectId: e.target.value })}
        >
          {gradeSubjects.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
      </label>

      <div className="eduos-label" style={{ gridColumn: "1 / -1" }}>
        Teacher
        <div
          style={{
            padding: "0.65rem 0.75rem",
            borderRadius: "var(--eduos-radius)",
            border: `1px solid ${staffed ? "var(--eduos-border)" : "#f59e0b"}`,
            background: staffed ? "var(--eduos-surface-muted)" : "#fffbeb",
            marginBottom: "0.75rem",
          }}
        >
          <div style={{ fontWeight: 600 }}>{displayFacultyName}</div>
          {staffed ? (
            <div style={{ fontSize: "0.75rem", color: "var(--eduos-text-muted)", marginTop: "0.2rem" }}>
              from Staffing
            </div>
          ) : (
            <div style={{ fontSize: "0.75rem", color: "#b45309", marginTop: "0.35rem" }}>
              Assign this subject&apos;s teacher in{" "}
              <StaffingSummaryLink sectionId={form.classSectionId} label="Staffing" /> first.
            </div>
          )}
          {differsFromStaffing ? (
            <div style={{ fontSize: "0.75rem", color: "var(--eduos-text-muted)", marginTop: "0.35rem" }}>
              Slot currently uses {lookup.facultyName(editingFacultyUserId!)}. Saving will use staffing
              teacher {staffingFacultyName}. Use Substitutions for one-day changes.
            </div>
          ) : null}
        </div>
      </div>

      <label className="eduos-label">
        Room
        <select
          className="eduos-input"
          style={selectStyle}
          value={form.roomId}
          onChange={(e) => setForm({ ...form, roomId: e.target.value })}
        >
          {data.rooms.map((r) => (
            <option key={r.id} value={r.id}>{r.name}</option>
          ))}
        </select>
      </label>
      <label className="eduos-label">
        Day
        <select
          className="eduos-input"
          style={selectStyle}
          value={form.dayOfWeek}
          onChange={(e) => setForm({ ...form, dayOfWeek: Number(e.target.value) })}
        >
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d, i) => (
            <option key={d} value={i}>{d}</option>
          ))}
        </select>
      </label>
      <Input
        label="Period"
        type="number"
        value={String(form.periodIndex)}
        onChange={(e) => setForm({ ...form, periodIndex: Number(e.target.value) })}
      />
      <Input label="Start" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} />
      <Input label="End" value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} />
    </div>
  );
}

export function canSaveTimetableSlot(
  data: AcademicsData,
  form: TimetableSlotFormState,
): boolean {
  return (
    Boolean(form.classSectionId)
    && Boolean(form.subjectId)
    && hasStaffingTeacher(data, form.classSectionId, form.subjectId)
  );
}
