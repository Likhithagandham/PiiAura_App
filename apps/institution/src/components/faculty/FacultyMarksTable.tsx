"use client";

import type { ExamMarkEntry, FacultyInternalMarkRow, FacultyMarksSection } from "@eduos/types";
import { EmptyState, TruncatedText } from "@eduos/ui";
import { MarksInput } from "./FacultyMarksInput";

type Props = {
  section: FacultyMarksSection;
  mode: "exam" | "internal";
  examSlotId: string;
  maxMarks: number;
  examEntryLocked: boolean;
  onSaveInternal?: (row: FacultyInternalMarkRow, marks: number | null) => void;
  onSaveExam?: (entry: { studentId: string; marks: number | null }) => void;
};

export function FacultyMarksTable({
  section,
  mode,
  examSlotId,
  maxMarks,
  examEntryLocked,
  onSaveInternal,
  onSaveExam,
}: Props) {
  const canEdit = section.canEdit;

  if (mode === "internal") {
    if (section.internal.length === 0) {
      return (
        <EmptyState
          compact
          title="No internal marks yet"
          description="Marks appear here once subject teachers record internal assessment."
        />
      );
    }
    return (
      <div className="eduos-table-wrap">
        <table className="eduos-admin-table">
          <thead>
            <tr>
              <th>Student</th>
              <th>Subject</th>
              {canEdit ? null : <th>Recorded by</th>}
              <th>Marks</th>
              <th>Updated</th>
            </tr>
          </thead>
          <tbody>
            {section.internal.map((r) => {
              const locked = canEdit && r.hardDeadlineAt != null && new Date(r.hardDeadlineAt) < new Date();
              return (
                <tr key={`${r.studentId}-${r.subjectId}`}>
                  <td>
                    <TruncatedText text={r.studentName} maxWidth="16rem" />
                  </td>
                  <td>
                    <TruncatedText text={r.subjectName} maxWidth="16rem" />
                  </td>
                  {canEdit ? null : (
                    <td style={{ color: "var(--eduos-text-muted)" }}>{r.recordedByName || "—"}</td>
                  )}
                  <td>
                    {canEdit ? (
                      <MarksInput
                        value={r.marks}
                        maxMarks={r.maxMarks}
                        disabled={locked}
                        onCommit={(marks) => onSaveInternal?.(r, marks)}
                      />
                    ) : (
                      <span>
                        {r.marks == null ? "—" : r.marks} / {r.maxMarks}
                      </span>
                    )}
                  </td>
                  <td className="eduos-admin-table__nowrap" style={{ color: "var(--eduos-text-muted)" }}>
                    {new Date(r.updatedAt).toLocaleString()}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  }

  const examEntriesForSlot = section.examEntries.filter((e) => e.examSlotId === examSlotId);

  return (
    <div className="eduos-table-wrap">
      <table className="eduos-admin-table">
        <thead>
          <tr>
            <th>Student</th>
            <th>Subject</th>
            <th>Marks</th>
            <th>Updated</th>
          </tr>
        </thead>
        <tbody>
          {examEntriesForSlot.length === 0 ? (
            <tr>
              <td colSpan={4}>
                <EmptyState
                  compact
                  title="No marks yet"
                  description="Rows appear once marks are entered for this exam slot."
                />
              </td>
            </tr>
          ) : (
            examEntriesForSlot.map((e: ExamMarkEntry) => (
              <tr key={`${e.examSlotId}-${e.studentId}`}>
                <td>
                  <TruncatedText text={e.studentName} maxWidth="16rem" />
                </td>
                <td>
                  <TruncatedText text={e.subjectName} maxWidth="16rem" />
                </td>
                <td>
                  {canEdit ? (
                    <MarksInput
                      value={e.marks}
                      maxMarks={maxMarks}
                      disabled={examEntryLocked}
                      onCommit={(marks) => onSaveExam?.({ studentId: e.studentId, marks })}
                    />
                  ) : (
                    <span>
                      {e.marks == null ? "—" : e.marks} / {e.maxMarks}
                    </span>
                  )}
                </td>
                <td className="eduos-admin-table__nowrap" style={{ color: "var(--eduos-text-muted)" }}>
                  {new Date(e.updatedAt).toLocaleString()}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
