"use client";

import { FacultyMarksTable } from "@/components/faculty/FacultyMarksTable";
import { FacultyShell } from "@/components/faculty/FacultyShell";
import { useFacultyScope } from "@/components/faculty/FacultyScopeContext";
import { ExportCsvButton } from "@/components/shared/ExportCsvButton";
import type { FacultyInternalMarkRow, FacultyMarksData } from "@eduos/types";
import { Button, SkeletonText } from "@eduos/ui";
import { useEffect, useMemo, useState } from "react";
import { useApiData } from "@/lib/queries";

type MarksTab = "internal" | "exam";

export default function FacultyMarksPage() {
  const { institutionType, settingsReady } = useFacultyScope();
  const showInternalMarks = institutionType === "college";
  const { data, error: queryError, refetch } = useApiData<FacultyMarksData>(
    "/api/faculty/marks",
    { enabled: settingsReady },
  );
  const load = refetch;
  const error = queryError ? "Failed to load marks." : null;
  const [message, setMessage] = useState<string | null>(null);
  const [myTab, setMyTab] = useState<MarksTab>("exam");
  const [teachTab, setTeachTab] = useState<MarksTab>("exam");
  // Exam-slot selections default to the first slot until the faculty picks one.
  const [myExamSlotOverride, setMyExamSlotOverride] = useState<string | null>(null);
  const [teachExamSlotOverride, setTeachExamSlotOverride] = useState<string | null>(null);
  const myExamSlotId = myExamSlotOverride ?? data?.myClass.examSlots[0]?.id ?? "";
  const teachExamSlotId = teachExamSlotOverride ?? data?.classesITeach.examSlots[0]?.id ?? "";
  const [maxMarks, setMaxMarks] = useState<number>(100);

  useEffect(() => {
    if (!settingsReady) return;
    setMyTab(showInternalMarks ? "internal" : "exam");
    setTeachTab(showInternalMarks ? "internal" : "exam");
  }, [settingsReady, showInternalMarks]);

  const selectedTeachExamSlot = useMemo(
    () => data?.classesITeach.examSlots.find((s) => s.id === teachExamSlotId),
    [data?.classesITeach.examSlots, teachExamSlotId],
  );
  const examEntryLocked = selectedTeachExamSlot?.entryLocked ?? false;

  async function saveInternal(row: FacultyInternalMarkRow, marks: number | null) {
    setMessage(null);
    const res = await fetch("/api/faculty/marks", {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        kind: "internal",
        payload: { studentId: row.studentId, subjectId: row.subjectId, marks, maxMarks: row.maxMarks },
      }),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      setMessage((json as { error?: string }).error ?? "Save failed");
      return;
    }
    setMessage("Saved.");
    await load();
  }

  async function saveExam(entry: { studentId: string; marks: number | null }) {
    setMessage(null);
    const res = await fetch("/api/faculty/marks", {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        kind: "exam",
        payload: { examSlotId: teachExamSlotId, studentId: entry.studentId, marks: entry.marks, maxMarks },
      }),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      setMessage((json as { error?: string }).error ?? "Save failed");
      return;
    }
    setMessage("Saved.");
    await load();
  }

  const tabBtn = (active: boolean): React.CSSProperties => ({
    padding: "0.35rem 0.65rem",
    fontSize: "0.8125rem",
    borderRadius: "var(--eduos-radius)",
    border: "1px solid var(--eduos-border)",
    background: active ? "var(--eduos-primary-light)" : "var(--eduos-card)",
    color: active ? "var(--eduos-primary)" : "var(--eduos-text)",
    fontWeight: active ? 700 : 500,
    cursor: "pointer",
  });

  return (
    <FacultyShell title="Marks entry">
      {error ? <p className="eduos-admin-message eduos-admin-message--error">{error}</p> : null}
      {message ? (
        <p
          className={
            message.includes("cannot") || message.includes("deadline") || message.includes("exceed")
              ? "eduos-admin-message eduos-admin-message--error"
              : "eduos-admin-message"
          }
        >
          {message}
        </p>
      ) : null}

      {!settingsReady || !data ? (
        <SkeletonText lines={4} />
      ) : (
        <>
          <section className="eduos-panel" style={{ marginBottom: "1rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: "0.75rem", flexWrap: "wrap" }}>
              <div>
                <h2 className="eduos-section-title">My class</h2>
                <p className="eduos-section-desc">
                  View all marks for your homeroom
                  {(data.myClass.homerooms ?? [])[0]?.classLabel
                    ? ` (${(data.myClass.homerooms ?? []).map((h) => h.classLabel).join(", ")})`
                    : ""}
                  . To enter marks, use Classes I teach below.
                </p>
              </div>
              <Button type="button" variant="secondary" className="eduos-admin-btn-sm" onClick={() => void load()}>
                Refresh
              </Button>
            </div>

            {(data.myClass.homerooms ?? []).length === 0 ? (
              <p style={{ color: "var(--eduos-text-muted)", marginTop: "0.75rem" }}>
                You are not assigned as a class teacher.
              </p>
            ) : (
              <>
                <div className="eduos-portal-toolbar" style={{ marginTop: "0.75rem" }}>
                  {showInternalMarks ? (
                    <button type="button" style={tabBtn(myTab === "internal")} onClick={() => setMyTab("internal")}>
                      Internal marks
                    </button>
                  ) : null}
                  <button type="button" style={tabBtn(myTab === "exam")} onClick={() => setMyTab("exam")}>
                    Exam marks
                  </button>
                </div>

                {myTab === "exam" ? (
                  <>
                    <div className="eduos-portal-toolbar" style={{ marginTop: "0.35rem" }}>
                      <label style={{ fontSize: "0.8125rem" }}>
                        Exam slot
                        <select
                          className="eduos-input eduos-input--field"
                          value={myExamSlotId}
                          onChange={(e) => setMyExamSlotOverride(e.target.value)}
                          style={{ display: "block", marginTop: "0.2rem" }}
                        >
                          {data.myClass.examSlots.length === 0 ? (
                            <option value="">No exam slots</option>
                          ) : (
                            data.myClass.examSlots.map((s) => (
                              <option key={s.id} value={s.id}>
                                {s.label}
                              </option>
                            ))
                          )}
                        </select>
                      </label>
                    </div>
                    <FacultyMarksTable
                      section={data.myClass}
                      mode="exam"
                      examSlotId={myExamSlotId}
                      maxMarks={maxMarks}
                      examEntryLocked
                    />
                  </>
                ) : (
                  <FacultyMarksTable section={data.myClass} mode="internal" examSlotId="" maxMarks={maxMarks} examEntryLocked />
                )}
              </>
            )}
          </section>

          <section className="eduos-panel">
            <div style={{ display: "flex", justifyContent: "space-between", gap: "0.75rem", flexWrap: "wrap" }}>
              <div>
                <h2 className="eduos-section-title">Classes I teach</h2>
                <p className="eduos-section-desc">Enter marks for subjects you teach.</p>
              </div>
              <ExportCsvButton endpoint="/api/faculty/exports/class-results" label="Download my class results CSV" />
            </div>

            {data.classesITeach.teachingClasses?.length === 0 ? (
              <p style={{ color: "var(--eduos-text-muted)", marginTop: "0.75rem" }}>
                No subject teaching assignments yet. Contact admin via Staffing.
              </p>
            ) : (
              <>
                <div className="eduos-portal-toolbar" style={{ marginTop: "0.75rem" }}>
                  {showInternalMarks ? (
                    <button type="button" style={tabBtn(teachTab === "internal")} onClick={() => setTeachTab("internal")}>
                      Internal marks
                    </button>
                  ) : null}
                  <button type="button" style={tabBtn(teachTab === "exam")} onClick={() => setTeachTab("exam")}>
                    Exam marks
                  </button>
                </div>

                {teachTab === "exam" ? (
                  <>
                    <p className="eduos-section-desc" style={{ marginTop: "0.35rem" }}>
                      {selectedTeachExamSlot ? (
                        examEntryLocked ? (
                          <>
                            Entry deadline passed ({new Date(selectedTeachExamSlot.marksEntryDeadlineAt).toLocaleString()}).
                            Contact an administrator to change marks.
                          </>
                        ) : (
                          <>
                            Enter marks from 0 to max before{" "}
                            {new Date(selectedTeachExamSlot.marksEntryDeadlineAt).toLocaleString()}.
                          </>
                        )
                      ) : (
                        "Select an exam slot."
                      )}
                    </p>
                    <div className="eduos-portal-toolbar" style={{ marginTop: "0.35rem" }}>
                      <label style={{ fontSize: "0.8125rem" }}>
                        Exam slot
                        <select
                          className="eduos-input eduos-input--field"
                          value={teachExamSlotId}
                          onChange={(e) => setTeachExamSlotOverride(e.target.value)}
                          style={{ display: "block", marginTop: "0.2rem" }}
                        >
                          {data.classesITeach.examSlots.map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.label}
                              {s.entryLocked ? " (locked)" : ""}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label style={{ fontSize: "0.8125rem" }}>
                        Max marks
                        <input
                          type="number"
                          min={1}
                          className="eduos-input eduos-input--compact"
                          style={{ display: "block", marginTop: "0.2rem", width: "5rem" }}
                          value={maxMarks}
                          disabled={examEntryLocked}
                          onChange={(e) => setMaxMarks(Math.max(1, Number(e.target.value) || 100))}
                        />
                      </label>
                    </div>
                    <FacultyMarksTable
                      section={data.classesITeach}
                      mode="exam"
                      examSlotId={teachExamSlotId}
                      maxMarks={maxMarks}
                      examEntryLocked={examEntryLocked}
                      onSaveExam={saveExam}
                    />
                  </>
                ) : (
                  <>
                    <p className="eduos-section-desc" style={{ marginTop: "0.35rem" }}>
                      Marks must be between 0 and the maximum.{" "}
                      {data.classesITeach.internal[0]?.hardDeadlineAt ? (
                        <>Entry closes {new Date(data.classesITeach.internal[0].hardDeadlineAt).toLocaleString()}.</>
                      ) : null}
                    </p>
                    <FacultyMarksTable
                      section={data.classesITeach}
                      mode="internal"
                      examSlotId=""
                      maxMarks={maxMarks}
                      examEntryLocked={false}
                      onSaveInternal={saveInternal}
                    />
                  </>
                )}
              </>
            )}
          </section>
        </>
      )}
    </FacultyShell>
  );
}
