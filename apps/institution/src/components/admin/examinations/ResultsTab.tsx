import { useEffect, useMemo, useState } from "react";
import type {
  ExamMarkEntry,
  ExamSlot,
  ExaminationsData,
  ResultPublishConfirmation,
  ResultsAnalytics,
  ResultsPreflightResult,
} from "@eduos/types";
import {
  BarChart,
  Button,
  ChartLegend,
  DonutChart,
  IconCheckCircle,
  IconUserCheck,
  Input,
  ListSearchBar,
  ProgressRing,
  StatCard,
  chartColor,
  filterBySearch,
} from "@eduos/ui";
import { AdminModal } from "../AdminModal";
import {
  formatSlotLabel,
  isMarksEntryLocked,
  isSlotPublished,
  sectionGradeKey,
  slotHasClash,
  statusPill,
} from "./examUtils";

function slotStatusLabel(entry: ExamMarkEntry | undefined): string {
  if (!entry) return "—";
  if (entry.marksStatus === "locked") return "Locked";
  if (entry.marksStatus === "submitted") return "Submitted";
  if (entry.marks == null) return "Absent";
  return "Draft";
}

export function ResultsTab({
  data,
  studentSearch,
  onStudentSearchChange,
  onSaveMark,
  onSubmitMarks,
  onPreflight,
  onStartPublish,
  onRevise,
  onLoadAnalytics,
  onExportReportCard,
  onExportClassCsv,
  onLoadSlotMarks,
}: {
  data: ExaminationsData;
  studentSearch: string;
  onStudentSearchChange: (v: string) => void;
  onSaveMark: (examSlotId: string, studentId: string, value: string, override?: boolean) => void;
  onSubmitMarks: (examSlotId: string, override?: boolean) => Promise<boolean>;
  onPreflight: (examSlotId: string) => Promise<ResultsPreflightResult | null>;
  onStartPublish: (examSlotId: string) => Promise<ResultPublishConfirmation | null>;
  onRevise: (examSlotId: string, note: string) => void;
  onLoadAnalytics: (examSlotId: string) => Promise<ResultsAnalytics | null>;
  onExportReportCard: (studentId: string, examSlotId: string) => void;
  onExportClassCsv: (examId: string, classSectionId: string) => void;
  onLoadSlotMarks: (examSlotId: string) => void;
}) {
  const [filterExam, setFilterExam] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [filterSubject, setFilterSubject] = useState("");
  const [filterGrade, setFilterGrade] = useState("");
  const [activeSlotId, setActiveSlotId] = useState<string | null>(null);
  const [preflight, setPreflight] = useState<ResultsPreflightResult | null>(null);
  const [analytics, setAnalytics] = useState<ResultsAnalytics | null>(null);
  const [exportStudentId, setExportStudentId] = useState("");
  const [deadlineOverride, setDeadlineOverride] = useState(false);
  const [correctionMode, setCorrectionMode] = useState(false);
  const [reviseOpen, setReviseOpen] = useState(false);
  const [reviseNote, setReviseNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const gradeOptions = useMemo(() => {
    const map = new Map<string, string>();
    for (const c of data.classSections ?? []) {
      const key = sectionGradeKey(c);
      if (!map.has(key)) map.set(key, c.grade ?? c.label);
    }
    return [...map.entries()].map(([key, label]) => ({ key, label }));
  }, [data.classSections]);

  const examOptions = useMemo(() => {
    if (data.exams?.length) return data.exams;
    const map = new Map<string, string>();
    for (const slot of data.slots) {
      if (slot.examId && slot.examName) map.set(slot.examId, slot.examName);
    }
    return [...map.entries()].map(([id, name]) => ({ id, name }));
  }, [data.exams, data.slots]);

  useEffect(() => {
    if (!filterExam && examOptions[0]?.id) setFilterExam(examOptions[0].id);
  }, [filterExam, examOptions]);

  const visibleSlots = useMemo(() => {
    return data.slots.filter((slot) => {
      if (filterExam && slot.examId !== filterExam) return false;
      if (filterDate && slot.date !== filterDate) return false;
      if (filterSubject && slot.subjectName !== filterSubject) return false;
      if (filterGrade) {
        const section = data.classSections?.find((c) => c.id === slot.classSectionId);
        if (!section || sectionGradeKey(section) !== filterGrade) return false;
      }
      return true;
    });
  }, [data.slots, data.classSections, filterExam, filterDate, filterSubject, filterGrade]);

  const activeSlot = visibleSlots.find((s) => s.id === activeSlotId) ?? visibleSlots[0] ?? null;

  useEffect(() => {
    if (activeSlot?.id) {
      onLoadSlotMarks(activeSlot.id);
      setAnalytics(null);
      setPreflight(null);
    }
  }, [activeSlot?.id, onLoadSlotMarks]);

  const entries = useMemo(() => {
    if (!activeSlot) return [];
    return (data.markEntries ?? []).filter((e) => e.examSlotId === activeSlot.id);
  }, [data.markEntries, activeSlot]);

  const filteredEntries = useMemo(
    () => filterBySearch(entries, studentSearch, (e) => [e.studentName, e.studentId]),
    [entries, studentSearch],
  );

  const reportCardStudents = useMemo(() => {
    if (!activeSlot) return [];
    const map = new Map<string, { studentId: string; name: string }>();
    for (const e of entries) {
      map.set(e.studentId, { studentId: e.studentId, name: e.studentName });
    }
    for (const s of data.students) {
      if (s.classSectionId === activeSlot.classSectionId) {
        map.set(s.studentId, { studentId: s.studentId, name: s.name });
      }
    }
    return [...map.values()];
  }, [entries, data.students, activeSlot]);

  useEffect(() => {
    if (!exportStudentId && reportCardStudents[0]?.studentId) {
      setExportStudentId(reportCardStudents[0].studentId);
    }
  }, [exportStudentId, reportCardStudents]);

  useEffect(() => {
    setCorrectionMode(false);
  }, [activeSlot?.id]);

  const published = activeSlot ? isSlotPublished(data, activeSlot.id) : false;
  const locked = activeSlot ? isMarksEntryLocked(activeSlot) && !deadlineOverride && !correctionMode : false;
  const hasClash =
    activeSlot && !published ? slotHasClash(data, activeSlot.id) : false;
  const readOnly = (published && !correctionMode) || locked;
  const marksOverride = deadlineOverride || correctionMode;

  const enteredCount = entries.filter((e) => e.marks != null || e.marksStatus === "submitted").length;
  const submittedCount = entries.filter(
    (e) => e.marksStatus === "submitted" || e.marksStatus === "locked",
  ).length;
  const allSubmitted = entries.length > 0 && submittedCount >= entries.length;

  const slotHistory = useMemo(
    () => (activeSlot ? data.publishedResults.filter((p) => p.examSlotId === activeSlot.id) : []),
    [data.publishedResults, activeSlot],
  );

  const examPublished = published;
  const resultStatus = activeSlot ? (data.resultStatusByExam[activeSlot.id] ?? "draft") : "draft";

  async function handlePreflight() {
    if (!activeSlot) return;
    const p = await onPreflight(activeSlot.id);
    if (p) setPreflight(p);
  }

  async function handleSubmit() {
    if (!activeSlot) return;
    setSubmitting(true);
    try {
      await onSubmitMarks(activeSlot.id, deadlineOverride);
    } finally {
      setSubmitting(false);
    }
  }

  async function loadAnalytics() {
    if (!activeSlot) return;
    const a = await onLoadAnalytics(activeSlot.id);
    if (a) setAnalytics(a);
  }

  const selectStyle = {
    padding: "0.5rem",
    borderRadius: "var(--eduos-radius)",
    border: "1px solid var(--eduos-border)",
    background: "var(--eduos-card)",
    fontSize: "0.8125rem",
  } as const;

  function rowForSlot(slot: ExamSlot) {
    const slotEntries = data.markEntries.filter((e) => e.examSlotId === slot.id);
    const pf = preflight?.slots.find((s) => s.examSlotId === slot.id);
    const registered = pf?.registeredCount ?? slotEntries.length;
    const entered = pf?.enteredCount ?? slotEntries.filter((e) => e.marks != null).length;
    const submitted = pf?.submittedCount ?? slotEntries.filter((e) => e.marksStatus === "submitted" || e.marksStatus === "locked").length;
    const status = pf?.status ?? (submitted >= registered && registered > 0 ? "ready" : registered === 0 ? "blocked" : "warning");
    return { registered, entered, submitted, status };
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <section className="eduos-panel">
        <h2 className="eduos-section-title">Results</h2>
        <p style={{ margin: "0.35rem 0 1rem", fontSize: "0.8125rem", color: "var(--eduos-text-muted)" }}>
          Pick a unit test (exam), enter marks per subject, submit each slot, then publish once. Students
          receive one report card per exam with all subjects (English, Maths, Science, …).
        </p>

        <div
          style={{
            display: "flex",
            gap: "0.75rem",
            flexWrap: "wrap",
            marginBottom: "1rem",
            alignItems: "flex-end",
          }}
        >
          <label style={{ fontSize: "0.75rem" }}>
            Unit test / Exam
            <select
              value={filterExam}
              onChange={(e) => {
                setFilterExam(e.target.value);
                setActiveSlotId(null);
                setPreflight(null);
              }}
              className="eduos-input"
              style={{ ...selectStyle, display: "block", marginTop: "0.25rem", minWidth: "10rem" }}
            >
              {examOptions.map((e) => (
                <option key={e.id} value={e.id}>{e.name}</option>
              ))}
            </select>
          </label>
          <label style={{ fontSize: "0.75rem" }}>
            Date
            <select value={filterDate} onChange={(e) => setFilterDate(e.target.value)} className="eduos-input" style={{ ...selectStyle, display: "block", marginTop: "0.25rem" }}>
              <option value="">All dates</option>
              {[...new Set(data.slots.map((s) => s.date))].sort().map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </label>
          <label style={{ fontSize: "0.75rem" }}>
            Subject
            <select value={filterSubject} onChange={(e) => setFilterSubject(e.target.value)} className="eduos-input" style={{ ...selectStyle, display: "block", marginTop: "0.25rem" }}>
              <option value="">All subjects</option>
              {[...new Set(data.slots.map((s) => s.subjectName))].sort().map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </label>
          <label style={{ fontSize: "0.75rem" }}>
            Grade
            <select value={filterGrade} onChange={(e) => setFilterGrade(e.target.value)} className="eduos-input" style={{ ...selectStyle, display: "block", marginTop: "0.25rem" }}>
              <option value="">All grades</option>
              {gradeOptions.map((g) => (
                <option key={g.key} value={g.key}>{g.label}</option>
              ))}
            </select>
          </label>
          <Button type="button" onClick={handlePreflight} disabled={!activeSlot}>
            Check readiness
          </Button>
        </div>

        {preflight ? (
          <div
            style={{
              marginBottom: "1rem",
              padding: "0.75rem",
              borderRadius: "var(--eduos-radius)",
              background: preflight.canPublish ? "#48bb7818" : "#d69e2e18",
              fontSize: "0.8125rem",
            }}
          >
            <strong>{preflight.examName}</strong> — {preflight.readyCount}/{preflight.totalSlots} slots
            ready
            {preflight.canPublish ? (
              <span style={{ color: "#1a5f4a", marginLeft: "0.5rem" }}>· Ready to publish</span>
            ) : null}
            {preflight.blockers.length > 0 ? (
              <ul style={{ margin: "0.5rem 0 0", paddingLeft: "1.25rem", color: "var(--eduos-text-muted)" }}>
                {preflight.blockers.map((b) => (
                  <li key={b}>{b}</li>
                ))}
              </ul>
            ) : null}
          </div>
        ) : null}

        <table className="eduos-admin-table" style={{ marginBottom: "1.25rem" }}>
          <thead>
            <tr>
              <th>Exam</th>
              <th>Class</th>
              <th>Subject</th>
              <th>Time</th>
              <th>Marks</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {visibleSlots.map((slot) => {
              const { registered, entered, submitted, status } = rowForSlot(slot);
              const isActive = activeSlot?.id === slot.id;
              return (
                <tr
                  key={slot.id}
                  onClick={() => setActiveSlotId(slot.id)}
                  style={{
                    cursor: "pointer",
                    background: isActive ? "var(--eduos-bg)" : undefined,
                  }}
                >
                  <td>{slot.examName ?? "—"}</td>
                  <td>{slot.classLabel}</td>
                  <td>{slot.subjectName}</td>
                  <td>{slot.date} {slot.startTime}</td>
                  <td>{entered}/{registered} entered · {submitted} submitted</td>
                  <td>
                    <span style={statusPill(status === "ready" ? "published" : "draft")}>
                      {status}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {!activeSlot ? (
          <p style={{ color: "var(--eduos-text-muted)" }}>No exam slots match your filters.</p>
        ) : (
          <>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: "0.75rem",
                flexWrap: "wrap",
                alignItems: "baseline",
                marginBottom: "0.75rem",
              }}
            >
              <div style={{ fontWeight: 700 }}>{formatSlotLabel(activeSlot)}</div>
              <span style={{ color: "var(--eduos-text-muted)", fontSize: "0.75rem" }}>
                Status: <span style={statusPill(examPublished ? "published" : "draft")}>{resultStatus}</span>
              </span>
            </div>

            <div
              style={{
                display: "flex",
                gap: "0.5rem",
                flexWrap: "wrap",
                marginBottom: "1rem",
                fontSize: "0.75rem",
              }}
            >
              {[
                { label: "1. Enter marks", done: enteredCount > 0 },
                { label: "2. Submit slot", done: allSubmitted },
                { label: "3. Publish exam", done: examPublished },
              ].map((step) => (
                <span
                  key={step.label}
                  style={{
                    padding: "0.25rem 0.5rem",
                    borderRadius: "var(--eduos-radius)",
                    background: step.done ? "#48bb7822" : "var(--eduos-bg)",
                    color: step.done ? "#1a5f4a" : "var(--eduos-text-muted)",
                  }}
                >
                  {step.done ? "✓ " : ""}{step.label}
                </span>
              ))}
            </div>

            {hasClash ? (
              <p style={{ color: "var(--eduos-danger)", fontSize: "0.8125rem", marginBottom: "0.75rem" }}>
                Schedule clash detected. Resolve on the Schedule tab before publishing.
              </p>
            ) : null}

            {published ? (
              <div
                style={{
                  marginBottom: "0.75rem",
                  padding: "0.75rem",
                  borderRadius: "var(--eduos-radius)",
                  background: "var(--eduos-bg)",
                  fontSize: "0.8125rem",
                }}
              >
                <label style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem", cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={correctionMode}
                    onChange={(e) => setCorrectionMode(e.target.checked)}
                    style={{ marginTop: "0.2rem" }}
                  />
                  <span>
                    <strong>Correct marks before revision</strong> — enable to edit locked marks, then click{" "}
                    <strong>Revise</strong> with a note to republish updated results.
                  </span>
                </label>
              </div>
            ) : null}

            {isMarksEntryLocked(activeSlot) && !published ? (
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  fontSize: "0.8125rem",
                  marginBottom: "0.75rem",
                  color: "var(--eduos-warning, #d69e2e)",
                }}
              >
                <input
                  type="checkbox"
                  checked={deadlineOverride}
                  onChange={(e) => setDeadlineOverride(e.target.checked)}
                />
                Marks deadline passed — enable admin override to edit and submit
              </label>
            ) : null}

            <h3 style={{ fontSize: "0.9375rem", fontWeight: 600, margin: "0 0 0.5rem" }}>Marks entry</h3>
            <ListSearchBar
              value={studentSearch}
              onChange={onStudentSearchChange}
              placeholder="Search student…"
              total={entries.length}
              filtered={filteredEntries.length}
            />

            {filteredEntries.length === 0 ? (
              <p style={{ color: "var(--eduos-text-muted)", fontSize: "0.8125rem" }}>
                {entries.length === 0
                  ? "No registered students. Register the class on the Schedule tab first."
                  : "No students match your search."}
              </p>
            ) : (
              <table className="eduos-admin-table" style={{ marginTop: "0.75rem" }}>
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Marks</th>
                    <th>Max</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEntries.map((e) => (
                    <MarkRow
                      key={`${e.examSlotId}-${e.studentId}`}
                      entry={e}
                      readOnly={readOnly}
                      onSave={(value) => onSaveMark(activeSlot.id, e.studentId, value, marksOverride)}
                    />
                  ))}
                </tbody>
              </table>
            )}

            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginTop: "1rem" }}>
              <Button
                type="button"
                disabled={readOnly || entries.length === 0 || submitting}
                onClick={handleSubmit}
              >
                {submitting ? "Submitting…" : "Submit marks for this slot"}
              </Button>
            </div>

            <h3 style={{ fontSize: "0.9375rem", fontWeight: 600, margin: "1.25rem 0 0.5rem" }}>
              Publish (whole exam)
            </h3>
            <p style={{ fontSize: "0.8125rem", color: "var(--eduos-text-muted)", marginBottom: "0.75rem" }}>
              All slots must have submitted marks. Publishing locks marks and makes results visible to
              students and parents.
            </p>
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "1rem" }}>
              <Button
                type="button"
                disabled={examPublished || hasClash || (preflight != null && !preflight.canPublish)}
                onClick={() => onStartPublish(activeSlot.id)}
              >
                Review &amp; publish
              </Button>
              <Button type="button" disabled={!examPublished} onClick={() => setReviseOpen(true)}>
                Revise
              </Button>
              <Button
                type="button"
                disabled={!activeSlot.examId}
                onClick={() => {
                  if (activeSlot.examId) {
                    onExportClassCsv(activeSlot.examId, activeSlot.classSectionId);
                  }
                }}
              >
                Export class CSV
              </Button>
              <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.8125rem" }}>
                <span style={{ color: "var(--eduos-text-muted)" }}>Report card</span>
                <select
                  value={exportStudentId}
                  onChange={(e) => setExportStudentId(e.target.value)}
                  className="eduos-input"
                  disabled={reportCardStudents.length === 0}
                >
                  {reportCardStudents.length === 0 ? (
                    <option value="">No students</option>
                  ) : (
                    reportCardStudents.map((s) => (
                      <option key={s.studentId} value={s.studentId}>{s.name}</option>
                    ))
                  )}
                </select>
                <Button
                  type="button"
                  disabled={!exportStudentId || !examPublished || reportCardStudents.length === 0}
                  onClick={() => onExportReportCard(exportStudentId, activeSlot.id)}
                >
                  Download PDF
                </Button>
              </label>
            </div>

            {slotHistory.length > 0 ? (
              <table className="eduos-admin-table">
                <thead>
                  <tr>
                    <th>Revision</th>
                    <th>Published at</th>
                    <th>Note</th>
                  </tr>
                </thead>
                <tbody>
                  {slotHistory.map((p) => (
                    <tr key={p.id}>
                      <td>R{p.revisionNo}</td>
                      <td>{new Date(p.publishedAt).toLocaleString()}</td>
                      <td>{p.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : null}

            <h3 style={{ fontSize: "0.9375rem", fontWeight: 600, margin: "1.25rem 0 0.5rem" }}>Analytics</h3>
            <Button type="button" onClick={loadAnalytics} disabled={entries.length === 0}>
              Show exam performance
            </Button>

            {analytics ? (
              <div style={{ marginTop: "1rem" }}>
                <div className="eduos-chart-split">
                  <ProgressRing
                    percent={analytics.passPercent}
                    color={
                      analytics.passPercent >= 85
                        ? "#1a5f4a"
                        : analytics.passPercent >= 50
                          ? "#d69e2e"
                          : "#dc2626"
                    }
                    label={`${analytics.passPercent}%`}
                    caption="Pass rate"
                  />
                  <div className="eduos-admin-stat-grid" style={{ flex: 1 }}>
                    <StatCard label="Average %" value={`${analytics.averagePercent}%`} icon={<IconCheckCircle />} accent="#2563eb" />
                    <StatCard label="Absent" value={String(analytics.absentCount)} icon={<IconUserCheck />} accent="#d69e2e" />
                  </div>
                </div>
                <div
                  style={{
                    marginTop: "1rem",
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                    gap: "1rem",
                  }}
                >
                  <div style={{ padding: "0.75rem", background: "var(--eduos-bg)", borderRadius: "var(--eduos-radius)" }}>
                    <div style={{ fontWeight: 700, marginBottom: "0.5rem" }}>Toppers</div>
                    <ol style={{ margin: 0, paddingLeft: "1.25rem", color: "var(--eduos-text-muted)" }}>
                      {analytics.toppers.map((t) => (
                        <li key={t.studentId}>{t.studentName} — {t.percent}%</li>
                      ))}
                    </ol>
                  </div>
                  <div style={{ padding: "0.75rem", background: "var(--eduos-bg)", borderRadius: "var(--eduos-radius)" }}>
                    <div style={{ fontWeight: 700, marginBottom: "0.5rem" }}>Band breakdown</div>
                    {analytics.breakdown.some((b) => b.count > 0) ? (
                      <div className="eduos-chart-split">
                        <DonutChart
                          data={analytics.breakdown.map((b, i) => ({
                            label: b.band,
                            value: b.count,
                            color: chartColor(i),
                          }))}
                          size={120}
                          centerValue={analytics.breakdown.reduce((acc, b) => acc + b.count, 0)}
                          centerLabel="Students"
                        />
                        <div className="eduos-chart-split__legend">
                          <ChartLegend
                            items={analytics.breakdown.map((b, i) => ({
                              label: b.band,
                              color: chartColor(i),
                              value: b.count,
                            }))}
                          />
                        </div>
                      </div>
                    ) : (
                      <BarChart
                        data={analytics.breakdown.map((b, i) => ({
                          label: b.band,
                          value: b.count,
                          color: chartColor(i),
                        }))}
                        height={160}
                      />
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <p style={{ marginTop: "0.75rem", color: "var(--eduos-text-muted)", fontSize: "0.8125rem" }}>
                Analytics cover the whole exam (all classes and subjects).
              </p>
            )}
          </>
        )}
      </section>

      {reviseOpen && activeSlot ? (
        <AdminModal title="Revise published results" onClose={() => setReviseOpen(false)}>
          <p style={{ fontSize: "0.8125rem", color: "var(--eduos-text-muted)", marginBottom: "0.75rem" }}>
            Revisions apply to the <strong>whole exam</strong> (all classes and subjects). Published results
            are never deleted — a new revision (R2, R3, …) is recorded with your note.
          </p>
          {!correctionMode ? (
            <p style={{ fontSize: "0.8125rem", marginBottom: "0.75rem", color: "var(--eduos-warning, #d69e2e)" }}>
              To fix a wrong mark: close this dialog, enable <strong>Correct marks before revision</strong> above
              the marks table, edit the mark, then open Revise again.
            </p>
          ) : (
            <p style={{ fontSize: "0.8125rem", marginBottom: "0.75rem", color: "#1a5f4a" }}>
              Correction mode is on — edit marks in the table, then confirm the revision below.
            </p>
          )}
          <label style={{ display: "block", fontSize: "0.875rem", marginBottom: "1rem" }}>
            Revision note (required)
            <Input
              value={reviseNote}
              onChange={(e) => setReviseNote(e.target.value)}
              placeholder="e.g. Corrected Rahul Sharma English mark from 82 to 85"
              style={{ marginTop: "0.35rem" }}
            />
          </label>
          <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
            <Button type="button" onClick={() => setReviseOpen(false)}>Cancel</Button>
            <Button
              type="button"
              disabled={!reviseNote.trim()}
              onClick={() => {
                onRevise(activeSlot.id, reviseNote.trim());
                setReviseOpen(false);
                setReviseNote("");
              }}
            >
              Confirm revision
            </Button>
          </div>
        </AdminModal>
      ) : null}
    </div>
  );
}

function MarkRow({
  entry,
  readOnly,
  onSave,
}: {
  entry: ExamMarkEntry;
  readOnly: boolean;
  onSave: (value: string) => void;
}) {
  return (
    <tr>
      <td>{entry.studentName}</td>
      <td>
        <Input
          defaultValue={entry.marks == null ? "" : String(entry.marks)}
          placeholder="Blank = absent"
          disabled={readOnly}
          onBlur={(ev) => onSave(ev.currentTarget.value)}
        />
      </td>
      <td>{entry.maxMarks}</td>
      <td style={{ fontSize: "0.75rem", color: "var(--eduos-text-muted)" }}>{slotStatusLabel(entry)}</td>
    </tr>
  );
}
