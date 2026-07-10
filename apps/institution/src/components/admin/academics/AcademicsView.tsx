"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useApiData } from "@/lib/queries";
import type {
  AcademicsData,
  ClassBatchSection,
  TimetableClash,
  TimetableSlot,
  WorkingDayRule,
} from "@eduos/types";
import { Button, Input, InlineLoading, EmptyState } from "@eduos/ui";
import { FeatureSpotlightCard } from "@/components/shared/FeatureSpotlightCard";
import { AdminShell } from "../AdminShell";
import { AdminTabs, AdminMessage } from "../ui";
import { AdminModal } from "../AdminModal";
import { AcademicCalendarGrid } from "./AcademicCalendarGrid";
import { CalendarDayEditModal } from "./CalendarDayEditModal";
import { TimetableWeekGrid } from "./TimetableWeekGrid";
import {
  SubjectFormModal,
  emptySubjectForm,
  subjectToForm,
  type SubjectFormValues,
} from "./SubjectFormModal";
import { StructureTab } from "./StructureTab";
import { StudyMaterialsPanel } from "./StudyMaterialsPanel";
import { SubstitutionFacultyFields } from "./SubstitutionFacultyFields";
import { facultyDisplayName, formatSessionLabel, sessionsForDate } from "./substitution-helpers";
import { AdminReviewQueuePanel } from "./AdminReviewQueuePanel";
import { CalendarFreezeBanner } from "./CalendarFreezeBanner";
import { StaffingTab, TimetableSlotModal, defaultSlotForm, sectionGradeKey, slotFormFromTimetableSlot, GradeSectionFilters, type TimetableSlotFormState } from "../shared/staffing";
import { useClassSectionFilters } from "../attendance/useClassSectionFilters";
import type { SubjectMaster } from "@eduos/types";


const tabs = ["Calendar", "Structure", "Staffing", "Subjects", "Timetable", "Study materials", "Substitutions"] as const;
type Tab = (typeof tabs)[number];

function idemHeaders(): HeadersInit {
  return {
    "Content-Type": "application/json",
    "Idempotency-Key": `academics-${Date.now()}`,
  };
}

export function AcademicsView() {
  const searchParams = useSearchParams();
  const { data, refetch } = useApiData<AcademicsData>("/api/admin/academics");
  const load = refetch;
  const [tab, setTab] = useState<Tab>("Calendar");
  const [message, setMessage] = useState<string | null>(null);
  const [clashes, setClashes] = useState<TimetableClash[]>([]);
  const staffingSectionId = searchParams.get("sectionId") ?? undefined;

  useEffect(() => {
    const requested = searchParams.get("tab");
    if (requested && tabs.includes(requested as Tab)) {
      setTab(requested as Tab);
    }
  }, [searchParams]);

  async function patchAction(body: Record<string, unknown>) {
    const res = await fetch("/api/admin/academics/actions", {
      method: "PATCH",
      credentials: "include",
      headers: idemHeaders(),
      body: JSON.stringify(body),
    });
    const json = await res.json();
    if (res.status === 409 && json.clashes) {
      setClashes(json.clashes);
      setMessage("Cannot save: faculty or room clash in this time slot.");
      return null;
    }
    if (res.status === 409 && json.hasMarks) {
      setMessage(json.error ?? "Cannot delete subject with recorded marks.");
      return null;
    }
    if (!res.ok) {
      setMessage(json.error ?? "Request failed");
      return null;
    }
    setClashes([]);
    await load();
    return json;
  }

  async function refreshClashes() {
    const res = await fetch("/api/admin/academics/actions", {
      method: "PATCH",
      credentials: "include",
      headers: idemHeaders(),
      body: JSON.stringify({ action: "list_clashes" }),
    });
    if (res.ok) {
      const json = await res.json();
      setClashes(json.clashes ?? []);
    }
  }

  const periodLabel = data?.periodKind === "semester" ? "Semesters" : "Terms";

  return (
    <AdminShell title="Academics">
      <AdminMessage>{message}</AdminMessage>

      <AdminTabs tabs={tabs.map((t) => ({ id: t, label: t }))} active={tab} onChange={setTab} />

      {!data ? (
        <InlineLoading />
      ) : tab === "Calendar" ? (
        <CalendarTab data={data} onAction={patchAction} onMessage={setMessage} periodLabel={periodLabel} />
      ) : tab === "Structure" ? (
        <StructureTab data={data} onAction={patchAction} onMessage={setMessage} />
      ) : tab === "Staffing" ? (
        <StaffingTab
          data={data}
          onAction={patchAction}
          onMessage={setMessage}
          initialSectionId={staffingSectionId}
        />
      ) : tab === "Subjects" ? (
        <SubjectsTab data={data} onAction={patchAction} onMessage={setMessage} />
      ) : tab === "Timetable" ? (
        <TimetableTab
          data={data}
          clashes={clashes}
          onAction={patchAction}
          onMessage={setMessage}
          onRefreshClashes={refreshClashes}
        />
      ) : tab === "Study materials" ? (
        <StudyMaterialsPanel data={data} onAction={patchAction} onMessage={setMessage} />
      ) : (
        <SubstitutionsTab data={data} onAction={patchAction} onMessage={setMessage} />
      )}
    </AdminShell>
  );
}

function CalendarTab({
  data,
  onAction,
  onMessage,
  periodLabel,
}: {
  data: AcademicsData;
  onAction: (b: Record<string, unknown>) => Promise<unknown>;
  onMessage: (m: string | null) => void;
  periodLabel: string;
}) {
  const [periodForm, setPeriodForm] = useState({ label: "", startDate: "", endDate: "", academicYearId: data.academicYears[0]?.id ?? "" });
  const [holidayForm, setHolidayForm] = useState({ name: "", date: "" });
  const [workingDays, setWorkingDays] = useState<WorkingDayRule[]>(data.workingDays);
  const [editDay, setEditDay] = useState<string | null>(null);
  const [slotModal, setSlotModal] = useState<{
    editing: TimetableSlot | null;
    form: TimetableSlotFormState;
  } | null>(null);
  const [subModal, setSubModal] = useState<{ slotId: string; date: string; facultyId: string; reason: string } | null>(null);

  const subjectLabels = Object.fromEntries(data.subjects.map((s) => [s.id, s.name]));

  useEffect(() => {
    setWorkingDays(data.workingDays);
  }, [data.workingDays]);

  function openSlotForm(opts: { editing?: TimetableSlot | null; dayOfWeek?: number; periodIndex?: number }) {
    const editing = opts.editing ?? null;
    setSlotModal({
      editing,
      form: editing
        ? slotFormFromTimetableSlot(editing)
        : defaultSlotForm(data, { dayOfWeek: opts.dayOfWeek, periodIndex: opts.periodIndex }),
    });
    setEditDay(null);
  }

  const editDayHoliday = editDay ? data.holidays.find((h) => h.date === editDay) : undefined;
  const editDayDow = editDay ? new Date(editDay + "T12:00:00").getDay() : 0;

  return (
    <div style={{ display: "grid", gap: "1rem" }}>
      <CalendarFreezeBanner data={data} />

      <AcademicCalendarGrid
        workingDays={workingDays}
        holidays={data.holidays}
        periods={data.periods}
        periodKindLabel={periodLabel}
        timetableSlots={data.timetableSlots}
        substitutions={data.substitutions}
        subjectLabels={subjectLabels}
        onEditDay={setEditDay}
      />

      {editDay ? (
        <CalendarDayEditModal
          date={editDay}
          data={data}
          holiday={editDayHoliday}
          slotsForDay={data.timetableSlots.filter((s) => s.dayOfWeek === editDayDow)}
          substitutionsForDate={data.substitutions.filter((s) => s.date === editDay && s.status !== "cancelled")}
          onClose={() => setEditDay(null)}
          onSaveHoliday={async (payload) => {
            await onAction({ action: "save_holiday", payload });
            onMessage(payload.id ? "Holiday updated." : "Holiday added.");
          }}
          onDeleteHoliday={async (id) => {
            await onAction({ action: "delete_holiday", holidayId: id });
            onMessage("Holiday removed.");
          }}
          onEditSlot={(slot) => openSlotForm({ editing: slot })}
          onAddSlot={(dow) => openSlotForm({ dayOfWeek: dow })}
          onAddSubstitution={(slotId) =>
            setSubModal({
              slotId,
              date: editDay,
              facultyId: "",
              reason: "",
            })
          }
          onCancelSubstitution={async (id) => {
            await onAction({ action: "cancel_substitution", substitutionId: id });
            onMessage("Substitution cancelled.");
          }}
        />
      ) : null}

      {slotModal ? (
        <TimetableSlotModal
          data={data}
          editing={slotModal.editing}
          form={slotModal.form}
          setForm={(form) => setSlotModal({ ...slotModal, form })}
          onClose={() => setSlotModal(null)}
          onSave={(form) => {
            void (async () => {
              const ok = await onAction({
                action: "save_timetable_slot",
                payload: { ...form, id: slotModal.editing?.id },
              });
              if (ok) {
                onMessage(slotModal.editing ? "Slot updated." : "Slot added.");
                setSlotModal(null);
              }
            })();
          }}
        />
      ) : null}

      {subModal ? (
        <AdminModal title="Schedule substitution" onClose={() => setSubModal(null)}>
          <SubstitutionFacultyFields
            data={data}
            date={subModal.date}
            timetableSlotId={subModal.slotId}
            substituteFacultyUserId={subModal.facultyId}
            reason={subModal.reason}
            showSessionPicker={false}
            onDateChange={(date) => setSubModal({ ...subModal, date })}
            onSlotChange={(slotId) => setSubModal({ ...subModal, slotId, facultyId: "" })}
            onSubstituteChange={(facultyId) => setSubModal({ ...subModal, facultyId })}
            onReasonChange={(reason) => setSubModal({ ...subModal, reason })}
          />
          <div style={{ marginTop: "1rem", display: "flex", justifyContent: "flex-end", gap: "0.5rem" }}>
            <Button type="button" variant="secondary" onClick={() => setSubModal(null)}>Cancel</Button>
            <Button
              type="button"
              disabled={!subModal.facultyId}
              onClick={async () => {
                const ok = await onAction({
                  action: "create_substitution",
                  payload: {
                    timetableSlotId: subModal.slotId,
                    substituteFacultyUserId: subModal.facultyId,
                    date: subModal.date,
                    reason: subModal.reason,
                  },
                });
                if (ok) {
                  onMessage("Substitution scheduled.");
                  setSubModal(null);
                }
              }}
            >
              Save
            </Button>
          </div>
        </AdminModal>
      ) : null}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1rem" }}>
      <div className="eduos-panel">
        <h3 style={{ margin: "0 0 0.75rem", fontSize: "1rem" }}>{periodLabel}</h3>
        <table className="eduos-admin-table">
          <thead>
            <tr style={{ borderBottom: "1px solid var(--eduos-border)", textAlign: "left" }}>
              <th style={{ padding: "0.4rem" }}>Label</th>
              <th style={{ padding: "0.4rem" }}>Start</th>
              <th style={{ padding: "0.4rem" }}>End</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {data.periods.map((p) => (
              <tr key={p.id} style={{ borderBottom: "1px solid var(--eduos-border)" }}>
                <td style={{ padding: "0.4rem" }}>{p.label}</td>
                <td style={{ padding: "0.4rem" }}>{p.startDate}</td>
                <td style={{ padding: "0.4rem" }}>{p.endDate}</td>
                <td style={{ padding: "0.4rem" }}>
                  <button
                    type="button"
                    style={{ fontSize: "0.75rem", color: "var(--eduos-danger)", background: "none", border: "none", cursor: "pointer" }}
                    onClick={async () => {
                      await onAction({ action: "delete_period", periodId: p.id });
                      onMessage("Period removed.");
                    }}
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: "0.5rem" }}>
          <Input label="Label" value={periodForm.label} onChange={(e) => setPeriodForm({ ...periodForm, label: e.target.value })} />
          <Input label="Start" type="date" value={periodForm.startDate} onChange={(e) => setPeriodForm({ ...periodForm, startDate: e.target.value })} />
          <Input label="End" type="date" value={periodForm.endDate} onChange={(e) => setPeriodForm({ ...periodForm, endDate: e.target.value })} />
        </div>
        <Button
          type="button"
          style={{ marginTop: "0.75rem" }}
          onClick={async () => {
            await onAction({ action: "save_period", payload: periodForm });
            onMessage(`${periodLabel.slice(0, -1)} added.`);
            setPeriodForm({ label: "", startDate: "", endDate: "", academicYearId: data.academicYears[0]?.id ?? "" });
          }}
        >
          Add {data.periodKind}
        </Button>
      </div>

      <div className="eduos-panel">
        <h3 style={{ margin: "0 0 0.75rem", fontSize: "1rem" }}>Holidays</h3>
        <ul style={{ margin: "0 0 1rem", paddingLeft: "1.1rem", fontSize: "0.875rem" }}>
          {data.holidays.map((h) => (
            <li key={h.id} style={{ marginBottom: "0.25rem" }}>
              {h.date} — {h.name}{" "}
              <button
                type="button"
                style={{ fontSize: "0.7rem", color: "var(--eduos-danger)", background: "none", border: "none", cursor: "pointer" }}
                onClick={() => onAction({ action: "delete_holiday", holidayId: h.id })}
              >
                ×
              </button>
            </li>
          ))}
        </ul>
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", alignItems: "flex-end" }}>
          <Input label="Name" value={holidayForm.name} onChange={(e) => setHolidayForm({ ...holidayForm, name: e.target.value })} />
          <Input label="Date" type="date" value={holidayForm.date} onChange={(e) => setHolidayForm({ ...holidayForm, date: e.target.value })} />
          <Button
            type="button"
            onClick={async () => {
              await onAction({ action: "save_holiday", payload: holidayForm });
              onMessage("Holiday added.");
              setHolidayForm({ name: "", date: "" });
            }}
          >
            Add holiday
          </Button>
        </div>
      </div>

      <div className="eduos-panel">
        <h3 style={{ margin: "0 0 0.75rem", fontSize: "1rem" }}>Working days</h3>
        <p style={{ fontSize: "0.75rem", color: "var(--eduos-text-muted)", margin: "0 0 0.65rem" }}>
          Define which days count as working days for the academic calendar and attendance. Saving applies to
          future scheduling; past attendance stays frozen (not recalculated).
        </p>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "0.35rem",
            marginBottom: "0.75rem",
          }}
        >
          {workingDays.map((d, i) => {
            const active = d.isWorkingDay;
            return (
              <button
                key={d.dayOfWeek}
                type="button"
                onClick={() => {
                  const next = [...workingDays];
                  next[i] = { ...d, isWorkingDay: !d.isWorkingDay };
                  setWorkingDays(next);
                }}
                style={{
                  padding: "0.5rem 0.25rem",
                  borderRadius: "var(--eduos-radius)",
                  border: `1px solid ${active ? "#bbf7d0" : "#e4e4e7"}`,
                  background: active ? "#f0fdf4" : "#f4f4f5",
                  color: active ? "var(--eduos-text)" : "var(--eduos-text-muted)",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                {d.label}
              </button>
            );
          })}
        </div>
        <Button
          type="button"
          variant="secondary"
          onClick={async () => {
            const res = await onAction({ action: "set_working_days", rules: workingDays });
            const frozen = (res as { calendarChange?: { attendanceFrozenThrough?: string } })?.calendarChange
              ?.attendanceFrozenThrough;
            onMessage(
              frozen
                ? `Working days saved. Attendance frozen through ${frozen} (not recalculated).`
                : "Working days updated.",
            );
          }}
        >
          Save working days
        </Button>
      </div>
      </div>
    </div>
  );
}

function SubjectsTab({
  data,
  onAction,
  onMessage,
}: {
  data: AcademicsData;
  onAction: (b: Record<string, unknown>) => Promise<unknown>;
  onMessage: (m: string | null) => void;
}) {
  const isCollege = data.institutionType === "college";
  const classSections = data.classSections ?? [];
  const [gradeKey, setGradeKey] = useState("");
  const [sectionId, setSectionId] = useState("");
  const [formOpen, setFormOpen] = useState<SubjectFormValues | null>(null);

  const gradeOptions = useMemo(() => {
    const map = new Map<string, { key: string; label: string; courseId: string }>();
    for (const c of classSections) {
      const key = sectionGradeKey(c);
      if (map.has(key)) continue;
      map.set(key, {
        key,
        label: c.grade ?? c.label,
        courseId: c.courseId ?? key,
      });
    }
    return [...map.values()].sort((a, b) =>
      a.label.localeCompare(b.label, undefined, { numeric: true }),
    );
  }, [classSections]);

  const sectionsForGrade = useMemo(
    () =>
      classSections
        .filter((c) => sectionGradeKey(c) === gradeKey)
        .sort((a, b) => (a.section ?? a.label).localeCompare(b.section ?? b.label)),
    [classSections, gradeKey],
  );

  const selectedGrade = gradeOptions.find((g) => g.key === gradeKey);

  useEffect(() => {
    if (!gradeKey && gradeOptions[0]?.key) setGradeKey(gradeOptions[0].key);
  }, [gradeOptions, gradeKey]);

  useEffect(() => {
    if (!sectionsForGrade.length) {
      setSectionId("");
      return;
    }
    if (!sectionsForGrade.some((s) => s.id === sectionId)) {
      setSectionId(sectionsForGrade[0]!.id);
    }
  }, [sectionsForGrade, sectionId]);

  const visibleSubjects = useMemo(() => {
    if (!selectedGrade) return [];
    return data.subjects.filter(
      (s) => s.courseId === selectedGrade.courseId || s.grade === selectedGrade.label,
    );
  }, [data.subjects, selectedGrade]);

  async function saveSubject(values: SubjectFormValues) {
    await onAction({
      action: "save_subject",
      payload: {
        id: values.id,
        courseId: values.courseId,
        code: values.code,
        name: values.name,
        credits: isCollege ? Number(values.credits) : null,
        syllabusUnits: values.units,
      },
    });
    onMessage(values.id ? "Subject updated." : "Subject added.");
    setFormOpen(null);
  }

  function progressFor(s: SubjectMaster) {
    return s.sectionProgress?.find((p) => p.classSectionId === sectionId);
  }

  return (
    <>
      <p style={{ fontSize: "0.8125rem", color: "var(--eduos-text-muted)", marginBottom: "0.75rem" }}>
        {isCollege
          ? "Course master with credit hours and ordered syllabus units. Completion is tracked per class section."
          : "Subject master with syllabus units (no credits for school). Completion is tracked per class section."}
      </p>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem", flexWrap: "wrap", marginBottom: "0.75rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
          <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.8125rem" }}>
            <span style={{ fontWeight: 600, color: "var(--eduos-text-muted)" }}>
              {isCollege ? "Program" : "Grade"}
            </span>
            <select
              className="eduos-input"
              value={gradeKey}
              onChange={(e) => setGradeKey(e.target.value)}
              style={{ minWidth: 140 }}
            >
              {gradeOptions.map((g) => (
                <option key={g.key} value={g.key}>
                  {g.label}
                </option>
              ))}
            </select>
          </label>
          {sectionsForGrade.length > 0 ? (
            <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.8125rem" }}>
              <span style={{ fontWeight: 600, color: "var(--eduos-text-muted)" }}>Section</span>
              <select
                className="eduos-input"
                value={sectionId}
                onChange={(e) => setSectionId(e.target.value)}
                style={{ minWidth: 100 }}
              >
                {sectionsForGrade.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.section ?? c.label.split(" - ").pop() ?? c.label}
                  </option>
                ))}
              </select>
            </label>
          ) : null}
        </div>
        <Button
          type="button"
          onClick={() => setFormOpen(emptySubjectForm(selectedGrade?.courseId))}
          disabled={!selectedGrade}
        >
          Add subject
        </Button>
      </div>

      {!gradeKey || !sectionId ? (
        <div className="eduos-panel">
          <p style={{ fontSize: "0.875rem", color: "var(--eduos-text-muted)", margin: 0 }}>
            Add class sections under Structure before managing subjects.
          </p>
        </div>
      ) : visibleSubjects.length === 0 ? (
        <div className="eduos-panel">
          <p style={{ fontSize: "0.875rem", color: "var(--eduos-text-muted)", margin: 0 }}>
            No subjects for {selectedGrade?.label}
            {sectionsForGrade.find((s) => s.id === sectionId)?.section
              ? ` — Section ${sectionsForGrade.find((s) => s.id === sectionId)!.section}`
              : ""}
            . Use Add subject to create one for this grade.
          </p>
        </div>
      ) : (
        <div style={{ display: "grid", gap: "0.75rem" }}>
          {visibleSubjects.map((s) => {
            const progress = progressFor(s);
            const percent = progress?.syllabusCompletionPercent ?? 0;
            const completedIds = progress?.completedUnitIds ?? [];
            return (
            <div key={s.id} className="eduos-panel">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem", flexWrap: "wrap" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
                    <span style={{ fontFamily: "monospace", fontSize: "0.75rem", color: "var(--eduos-text-muted)" }}>{s.code}</span>
                    <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: 600 }}>{s.name}</h3>
                    {s.grade ? (
                      <span style={{ fontSize: "0.7rem", color: "var(--eduos-text-muted)" }}>{s.grade}</span>
                    ) : null}
                    {isCollege && s.credits != null ? (
                      <span
                        style={{
                          fontSize: "0.7rem",
                          fontWeight: 600,
                          padding: "0.15rem 0.45rem",
                          borderRadius: 999,
                          background: "var(--eduos-primary-light)",
                          color: "var(--eduos-primary)",
                        }}
                      >
                        {s.credits} credits
                      </span>
                    ) : null}
                  </div>
                </div>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <button type="button" style={linkBtn} onClick={() => setFormOpen(subjectToForm(s))}>
                    Edit
                  </button>
                  <button
                    type="button"
                    style={{ ...linkBtn, color: "var(--eduos-danger)" }}
                    onClick={async () => {
                      const res = (await onAction({ action: "delete_subject", subjectId: s.id })) as {
                        reviewItem?: { message: string };
                        tbdCount?: number;
                      } | null;
                      if (res !== null) {
                        onMessage(
                          res.reviewItem?.message ??
                            (res.tbdCount ? `${res.tbdCount} slot(s) marked TBD.` : "Subject removed."),
                        );
                      }
                    }}
                  >
                    Remove
                  </button>
                </div>
              </div>

              <div style={{ marginTop: "0.75rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.35rem" }}>
                  <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--eduos-text-muted)" }}>
                    Syllabus completion
                  </span>
                  <span style={{ fontSize: "0.8125rem", fontWeight: 700, color: "var(--eduos-primary)" }}>
                    {percent}%
                  </span>
                </div>
                <div
                  style={{
                    height: 6,
                    borderRadius: 3,
                    background: "var(--eduos-border)",
                    marginBottom: "0.65rem",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${percent}%`,
                      background: "var(--eduos-primary)",
                      borderRadius: 3,
                    }}
                  />
                </div>
                {s.syllabusUnits.length === 0 ? (
                  <p style={{ fontSize: "0.8125rem", color: "var(--eduos-text-muted)", margin: 0 }}>No units defined.</p>
                ) : (
                  <ul style={{ listStyle: "none", padding: 0, margin: 0, fontSize: "0.8125rem" }}>
                    {s.syllabusUnits
                      .slice()
                      .sort((a, b) => a.order - b.order)
                      .map((u) => {
                        const done = completedIds.includes(u.id);
                        return (
                          <li key={u.id} style={{ marginBottom: "0.35rem" }}>
                            <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
                              <input
                                type="checkbox"
                                checked={done}
                                onChange={async (e) => {
                                  const next = e.target.checked
                                    ? [...completedIds, u.id]
                                    : completedIds.filter((id) => id !== u.id);
                                  await onAction({
                                    action: "update_syllabus_completion",
                                    payload: { subjectId: s.id, classSectionId: sectionId, completedUnitIds: next },
                                  });
                                }}
                              />
                              <span style={{ textDecoration: done ? "line-through" : "none", opacity: done ? 0.7 : 1 }}>
                                {u.title}
                              </span>
                            </label>
                          </li>
                        );
                      })}
                  </ul>
                )}
              </div>
            </div>
          );
          })}
        </div>
      )}

      {formOpen ? (
        <SubjectFormModal
          isCollege={isCollege}
          classSections={classSections}
          initial={formOpen}
          onClose={() => setFormOpen(null)}
          onSave={saveSubject}
        />
      ) : null}
    </>
  );
}

function TimetableTab({
  data,
  clashes,
  onAction,
  onMessage,
  onRefreshClashes,
}: {
  data: AcademicsData;
  clashes: TimetableClash[];
  onAction: (b: Record<string, unknown>) => Promise<unknown>;
  onMessage: (m: string | null) => void;
  onRefreshClashes: () => void;
}) {
  const {
    gradeKey,
    setGradeKey,
    sectionId,
    setSectionId,
    gradeOptions,
    sectionsForGrade,
  } = useClassSectionFilters(data.classSections ?? []);
  const [slotModal, setSlotModal] = useState<{
    editing: TimetableSlot | null;
    form: TimetableSlotFormState;
  } | null>(null);
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const buildingForSectionId = sectionId || undefined;

  function openEdit(slot: TimetableSlot) {
    setSlotModal({
      editing: slot,
      form: slotFormFromTimetableSlot(slot),
    });
  }

  function openAdd(dayOfWeek: number, periodIndex: number) {
    setSlotModal({
      editing: null,
      form: defaultSlotForm(data, {
        dayOfWeek,
        periodIndex,
        classSectionId: buildingForSectionId,
      }),
    });
  }

  const subjectName = (id: string) => data.subjects.find((s) => s.id === id)?.name ?? id;
  const facultyName = (id: string) => data.faculty.find((f) => f.userId === id)?.name ?? id;
  const classLabel = (id: string) => data.classSections.find((c) => c.id === id)?.label ?? id;
  const roomName = (id: string) => data.rooms.find((r) => r.id === id)?.name ?? id;

  const selectedSection = sectionsForGrade.find((s) => s.id === sectionId) ?? sectionsForGrade[0];
  const selectedGrade = gradeOptions.find((g) => g.key === gradeKey);
  const slotsForSection = useMemo(
    () => (sectionId ? data.timetableSlots.filter((s) => s.classSectionId === sectionId) : data.timetableSlots),
    [data.timetableSlots, sectionId],
  );

  return (
    <div className="portal-dashboard-stack timetable-tab">
      <FeatureSpotlightCard
        badge="Timetable module"
        title="AI timetable generator"
        description="Auto-generate conflict-free timetables considering teacher availability, subject load limits, and room capacity. Saves 10+ hours per term."
        tip="One click → optimized weekly timetable with zero clashes"
      />

      <section className="eduos-panel">
        <div className="portal-panel-header">
          <h2 className="eduos-section-title">Building timetable for</h2>
          <p className="eduos-section-desc">
            Pick a class to pre-fill new slots. Teachers come from Staffing — you only choose subject and room.
          </p>
        </div>

        <GradeSectionFilters
          gradeKey={gradeKey}
          onGradeChange={setGradeKey}
          sectionId={sectionId}
          onSectionChange={setSectionId}
          gradeOptions={gradeOptions}
          sectionsForGrade={sectionsForGrade}
        />

        {selectedSection ? (
          <div className="staffing-context-strip">
            <span className="staffing-context-strip__label">Viewing</span>
            <strong>
              {selectedGrade?.label ?? selectedSection.label}
              {selectedSection.section ? ` · Section ${selectedSection.section}` : ""}
            </strong>
            <span className="staffing-context-strip__dot" aria-hidden>
              ·
            </span>
            <span>
              {slotsForSection.length} slot{slotsForSection.length === 1 ? "" : "s"} this week
            </span>
            <span className="staffing-context-strip__dot" aria-hidden>
              ·
            </span>
            <Link href="/admin/academics?tab=Staffing" className="eduos-link">
              Manage staffing
            </Link>
          </div>
        ) : null}
      </section>

      <section className="eduos-panel">
        <div className="staffing-panel-head">
          <div>
            <h2 className="eduos-section-title">Weekly grid</h2>
            <p className="eduos-section-desc timetable-legend">
              Click any cell to add or edit a class.{" "}
              <span className="timetable-legend__tbd">Amber</span> = TBD (subject removed),{" "}
              <span className="timetable-legend__unassigned">red</span> = faculty unassigned.
            </p>
          </div>
          <div className="staffing-row-actions">
            <Button type="button" variant="secondary" className="eduos-admin-btn-sm" onClick={onRefreshClashes}>
              Check clashes
            </Button>
            <Button
              type="button"
              className="eduos-admin-btn-sm"
              onClick={() =>
                setSlotModal({
                  editing: null,
                  form: defaultSlotForm(data, { classSectionId: buildingForSectionId }),
                })
              }
            >
              Add slot
            </Button>
          </div>
        </div>

        <TimetableWeekGrid
          data={data}
          classSectionId={buildingForSectionId}
          onEditSlot={openEdit}
          onAddSlot={openAdd}
        />
      </section>

      {clashes.length > 0 ? (
        <div className="portal-alert-card portal-alert-card--critical timetable-clash-alert">
          <div className="portal-alert-card__title">Clash detected (save blocked)</div>
          <ul className="timetable-clash-list">
            {clashes.map((c, i) => (
              <li key={i}>
                {c.type === "faculty" ? "Faculty" : "Room"}: {c.message}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <AdminReviewQueuePanel
        data={data}
        onResolve={async (reviewId) => {
          await onAction({ action: "resolve_review", reviewId });
          onMessage("Marked as reviewed.");
        }}
      />

      <section className="eduos-panel">
        <div className="staffing-panel-head">
          <div>
            <h2 className="eduos-section-title">Slot list</h2>
            <p className="eduos-section-desc">
              {selectedSection
                ? `All timetable slots for ${selectedGrade?.label ?? selectedSection.label}${selectedSection.section ? ` · Section ${selectedSection.section}` : ""}.`
                : "All timetable slots across sections."}
            </p>
          </div>
          <span className="staffing-context-strip__count">{slotsForSection.length} slots</span>
        </div>

        {slotsForSection.length === 0 ? (
          <EmptyState
            compact
            title="No slots yet"
            description="Click a cell in the weekly grid or use Add slot to create the first period for this section."
            action={
              <Button
                type="button"
                className="eduos-admin-btn-sm"
                onClick={() =>
                  setSlotModal({
                    editing: null,
                    form: defaultSlotForm(data, { classSectionId: buildingForSectionId }),
                  })
                }
              >
                Add first slot
              </Button>
            }
          />
        ) : (
          <div className="eduos-table-wrap">
            <table className="eduos-admin-table">
              <thead>
                <tr>
                  {!buildingForSectionId ? <th>Class</th> : null}
                  <th>Subject</th>
                  <th>Faculty</th>
                  <th>Room</th>
                  <th>When</th>
                  <th className="eduos-admin-table__nowrap">Actions</th>
                </tr>
              </thead>
              <tbody>
                {slotsForSection.map((slot) => (
                  <tr key={slot.id}>
                    {!buildingForSectionId ? <td>{classLabel(slot.classSectionId)}</td> : null}
                    <td className="portal-table-emphasis">{subjectName(slot.subjectId)}</td>
                    <td>{facultyName(slot.facultyUserId)}</td>
                    <td>{roomName(slot.roomId)}</td>
                    <td className="eduos-admin-table__nowrap">
                      {dayNames[slot.dayOfWeek]} P{slot.periodIndex} ({slot.startTime}–{slot.endTime})
                    </td>
                    <td className="eduos-admin-table__nowrap">
                      <div className="staffing-row-actions">
                        <Button type="button" variant="secondary" className="eduos-admin-btn-sm" onClick={() => openEdit(slot)}>
                          Edit
                        </Button>
                        <Button
                          type="button"
                          variant="secondary"
                          className="eduos-admin-btn-sm"
                          onClick={async () => {
                            await onAction({ action: "delete_timetable_slot", slotId: slot.id });
                            onMessage("Slot removed.");
                          }}
                        >
                          Remove
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {slotModal ? (
        <TimetableSlotModal
          data={data}
          editing={slotModal.editing}
          form={slotModal.form}
          setForm={(form) => setSlotModal({ ...slotModal, form })}
          lockClassSectionId={!slotModal.editing ? buildingForSectionId : undefined}
          onClose={() => setSlotModal(null)}
          onSave={(form) => {
            void (async () => {
              const ok = await onAction({
                action: "save_timetable_slot",
                payload: { ...form, id: slotModal.editing?.id },
              });
              if (ok) {
                onMessage(slotModal.editing ? "Slot updated." : "Slot added.");
                setSlotModal(null);
              }
            })();
          }}
        />
      ) : null}
    </div>
  );
}

function SubstitutionsTab({
  data,
  onAction,
  onMessage,
}: {
  data: AcademicsData;
  onAction: (b: Record<string, unknown>) => Promise<unknown>;
  onMessage: (m: string | null) => void;
}) {
  const today = new Date().toISOString().slice(0, 10);
  const initialSessions = sessionsForDate(data.timetableSlots, today);
  const [form, setForm] = useState({
    date: today,
    timetableSlotId: initialSessions[0]?.id ?? "",
    substituteFacultyUserId: "",
    reason: "",
  });

  useEffect(() => {
    const sessions = sessionsForDate(data.timetableSlots, form.date);
    setForm((f) => {
      if (f.timetableSlotId && sessions.some((s) => s.id === f.timetableSlotId)) return f;
      return { ...f, timetableSlotId: sessions[0]?.id ?? "", substituteFacultyUserId: "" };
    });
  }, [form.date, data.timetableSlots]);

  const slotLabel = (slotId: string) => {
    const slot = data.timetableSlots.find((s) => s.id === slotId);
    if (!slot) return slotId;
    return formatSessionLabel(slot, data);
  };

  return (
    <div style={{ display: "grid", gap: "1rem" }}>
      <div className="eduos-panel">
        <h3 style={{ margin: "0 0 0.75rem", fontSize: "1rem" }}>Reassign session (faculty absent)</h3>
        <SubstitutionFacultyFields
          data={data}
          date={form.date}
          timetableSlotId={form.timetableSlotId}
          substituteFacultyUserId={form.substituteFacultyUserId}
          reason={form.reason}
          onDateChange={(date) => setForm((f) => ({ ...f, date }))}
          onSlotChange={(timetableSlotId) =>
            setForm((f) => ({ ...f, timetableSlotId, substituteFacultyUserId: "" }))
          }
          onSubstituteChange={(substituteFacultyUserId) =>
            setForm((f) => ({ ...f, substituteFacultyUserId }))
          }
          onReasonChange={(reason) => setForm((f) => ({ ...f, reason }))}
        />
        <Button
          type="button"
          style={{ marginTop: "0.75rem" }}
          disabled={!form.timetableSlotId || !form.substituteFacultyUserId}
          onClick={async () => {
            const ok = await onAction({ action: "create_substitution", payload: form });
            if (ok) onMessage("Substitution scheduled.");
          }}
        >
          Schedule substitution
        </Button>
      </div>

      <div className="eduos-panel">
        <h3 style={{ margin: "0 0 0.75rem", fontSize: "1rem" }}>Scheduled substitutions</h3>
        {data.substitutions.length === 0 ? (
          <p style={{ fontSize: "0.875rem", color: "var(--eduos-text-muted)" }}>No substitutions yet.</p>
        ) : (
          <table className="eduos-admin-table">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--eduos-border)", textAlign: "left" }}>
                <th style={{ padding: "0.4rem" }}>Session</th>
                <th style={{ padding: "0.4rem" }}>Date</th>
                <th style={{ padding: "0.4rem" }}>Original</th>
                <th style={{ padding: "0.4rem" }}>Substitute</th>
                <th style={{ padding: "0.4rem" }}>Status</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {data.substitutions.map((sub) => (
                <tr key={sub.id} style={{ borderBottom: "1px solid var(--eduos-border)" }}>
                  <td style={{ padding: "0.4rem" }}>{slotLabel(sub.timetableSlotId)}</td>
                  <td style={{ padding: "0.4rem" }}>{sub.date}</td>
                  <td style={{ padding: "0.4rem" }}>
                    {facultyDisplayName(data, sub.originalFacultyUserId)}
                  </td>
                  <td style={{ padding: "0.4rem" }}>
                    {facultyDisplayName(data, sub.substituteFacultyUserId)}
                  </td>
                  <td style={{ padding: "0.4rem", textTransform: "capitalize" }}>{sub.status}</td>
                  <td style={{ padding: "0.4rem" }}>
                    {sub.status === "scheduled" ? (
                      <button
                        type="button"
                        style={linkBtn}
                        onClick={async () => {
                          const ok = await onAction({ action: "cancel_substitution", substitutionId: sub.id });
                          if (ok) onMessage("Substitution cancelled.");
                        }}
                      >
                        Cancel
                      </button>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

const linkBtn: React.CSSProperties = {
  background: "none",
  border: "none",
  padding: "0 0.5rem 0 0",
  fontSize: "0.75rem",
  color: "var(--eduos-primary)",
  cursor: "pointer",
  textDecoration: "underline",
};
