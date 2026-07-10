"use client";

import { Fragment, useMemo } from "react";
import type { AcademicsData, TimetableSlot } from "@eduos/types";
import { TIMETABLE_TBD_SUBJECT_ID, TIMETABLE_UNASSIGNED_FACULTY_ID } from "@eduos/types";
import { facultyIdForDisplay } from "../shared/staffing/timetableSlotDefaults";

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function TimetableWeekGrid({
  data,
  onEditSlot,
  onAddSlot,
  classSectionId,
}: {
  data: AcademicsData;
  onEditSlot: (slot: TimetableSlot) => void;
  onAddSlot: (dayOfWeek: number, periodIndex: number) => void;
  classSectionId?: string;
}) {
  const slots = useMemo(() => {
    if (!classSectionId) return data.timetableSlots;
    return data.timetableSlots.filter((s) => s.classSectionId === classSectionId);
  }, [data.timetableSlots, classSectionId]);

  const workingDayIndices = data.workingDays.filter((d) => d.isWorkingDay).map((d) => d.dayOfWeek);
  const displayDays = workingDayIndices.length > 0 ? workingDayIndices : [1, 2, 3, 4, 5, 6];

  const maxPeriod = Math.max(6, ...slots.map((s) => s.periodIndex));
  const periods = Array.from({ length: maxPeriod }, (_, i) => i + 1);

  const classLabel = (id: string) => data.classSections.find((c) => c.id === id)?.label ?? id;
  const showClassLabel = !classSectionId;

  const facultyName = (slot: TimetableSlot) => {
    const id = facultyIdForDisplay(data, slot.classSectionId, slot.subjectId, slot.facultyUserId);
    if (!id) return "";
    return data.faculty.find((f) => f.userId === id)?.name ?? "";
  };

  function slotLabel(slot: TimetableSlot): string {
    if (slot.status === "tbd" || slot.subjectId === TIMETABLE_TBD_SUBJECT_ID) return "TBD";
    const subj = data.subjects.find((s) => s.id === slot.subjectId)?.name ?? "—";
    if (slot.status === "faculty_unassigned" || slot.facultyUserId === TIMETABLE_UNASSIGNED_FACULTY_ID) {
      return `${subj} (no faculty)`;
    }
    const teacher = facultyName(slot);
    return teacher ? `${subj} · ${teacher}` : subj;
  }

  function slotsAt(day: number, period: number) {
    return slots.filter((s) => s.dayOfWeek === day && s.periodIndex === period);
  }

  return (
    <div className="timetable-week-grid">
      <div
        className="timetable-week-grid__inner"
        style={{ gridTemplateColumns: `56px repeat(${displayDays.length}, minmax(120px, 1fr))` }}
      >
        <div className="timetable-week-grid__head timetable-week-grid__head--corner" />
        {displayDays.map((d) => (
          <div key={d} className="timetable-week-grid__head">
            {DAY_LABELS[d]}
          </div>
        ))}

        {periods.map((period) => (
          <Fragment key={period}>
            <div className="timetable-week-grid__period">P{period}</div>
            {displayDays.map((day) => (
              <TimetableCell
                key={`${day}-${period}`}
                slots={slotsAt(day, period)}
                showClassLabel={showClassLabel}
                classLabel={classLabel}
                slotLabel={slotLabel}
                onEdit={onEditSlot}
                onAdd={() => onAddSlot(day, period)}
              />
            ))}
          </Fragment>
        ))}
      </div>
    </div>
  );
}

function cellStyleForSlot(slot: TimetableSlot): string {
  if (slot.status === "tbd") return "timetable-slot-card--tbd";
  if (slot.status === "faculty_unassigned") return "timetable-slot-card--unassigned";
  return "timetable-slot-card--active";
}

function TimetableCell({
  slots,
  showClassLabel,
  classLabel,
  slotLabel,
  onEdit,
  onAdd,
}: {
  slots: TimetableSlot[];
  showClassLabel: boolean;
  classLabel: (id: string) => string;
  slotLabel: (slot: TimetableSlot) => string;
  onEdit: (slot: TimetableSlot) => void;
  onAdd: () => void;
}) {
  return (
    <div className={`timetable-week-grid__cell${slots.length ? " timetable-week-grid__cell--filled" : ""}`}>
      {slots.map((slot) => (
        <button
          key={slot.id}
          type="button"
          onClick={() => onEdit(slot)}
          title={slot.statusNote ?? "Click to edit"}
          className={`timetable-slot-card ${cellStyleForSlot(slot)}`}
        >
          {showClassLabel ? <div className="timetable-slot-card__class">{classLabel(slot.classSectionId)}</div> : null}
          <div>{slotLabel(slot)}</div>
          {slot.status !== "active" ? (
            <div className="timetable-slot-card__flag">
              {slot.status === "tbd" ? "TBD" : "Needs faculty"}
            </div>
          ) : (
            <div className="timetable-slot-card__hint">Edit</div>
          )}
        </button>
      ))}
      <button type="button" onClick={onAdd} className="timetable-week-grid__add">
        + Add
      </button>
    </div>
  );
}
