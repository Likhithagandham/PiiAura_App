import { useState } from "react";
import type { ExamSlot, ExaminationsData } from "@eduos/types";
import { Button } from "@eduos/ui";
import { ExamSectionFilters } from "./ExamSectionFilters";
import type { useExamSectionFilters } from "./useExamSectionFilters";

type Filters = ReturnType<typeof useExamSectionFilters>;

function slotRequired(slot: ExamSlot): number {
  return slot.requiredInvigilators ?? 1;
}

export function InvigilationTab({
  data,
  filters,
  onAutoAssign,
  onAdd,
  onReplace,
  onRemove,
  onRequiredChange,
}: {
  data: ExaminationsData;
  filters: Filters;
  onAutoAssign: () => void;
  onAdd: (examSlotId: string, facultyId: string) => void;
  onReplace: (examSlotId: string, facultyId: string, replaceFacultyId: string) => void;
  onRemove: (examSlotId: string, facultyId: string) => void;
  onRequiredChange: (examSlotId: string, requiredInvigilators: number) => void;
}) {
  const visibleSlots = filters.sectionSlots;
  const [addFacultyId, setAddFacultyId] = useState<Record<string, string>>({});
  const [replaceFromId, setReplaceFromId] = useState<Record<string, string>>({});
  const [replaceToId, setReplaceToId] = useState<Record<string, string>>({});

  const selectStyle = {
    padding: "0.5rem",
    borderRadius: "var(--eduos-radius)",
    border: "1px solid var(--eduos-border)",
    background: "var(--eduos-card)",
    fontSize: "0.8125rem",
  } as const;

  return (
    <section className="eduos-panel">
      <div style={{ display: "flex", justifyContent: "space-between", gap: "0.75rem", flexWrap: "wrap" }}>
        <div>
          <h2 className="eduos-section-title">Invigilator duty</h2>
          <p style={{ margin: "0.35rem 0 0", fontSize: "0.8125rem", color: "var(--eduos-text-muted)" }}>
            Set how many invigilators each slot needs, then add, replace, or remove faculty. Auto-assign
            fills each slot to its required count.
          </p>
        </div>
        <Button type="button" onClick={onAutoAssign}>
          Auto-assign
        </Button>
      </div>

      <ExamSectionFilters
        gradeOptions={filters.gradeOptions}
        sectionsForGrade={filters.sectionsForGrade}
        sectionSlots={filters.sectionSlots}
        gradeKey={filters.gradeKey}
        sectionId={filters.sectionId}
        slotId={filters.slotId}
        onGradeChange={filters.setGradeKey}
        onSectionChange={filters.setSectionId}
      />

      {visibleSlots.length === 0 ? (
        <p style={{ color: "var(--eduos-text-muted)", marginTop: "1rem" }}>No exam slots for this section.</p>
      ) : (
        <table className="eduos-admin-table" style={{ marginTop: "1rem" }}>
          <thead>
            <tr>
              <th>Exam</th>
              <th>When</th>
              <th>Required</th>
              <th>Assigned</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {visibleSlots.map((slot) => {
              const required = slotRequired(slot);
              const assignments = data.invigilation.filter((a) => a.examSlotId === slot.id);
              const assignedIds = new Set(assignments.map((a) => a.facultyId));
              const atCap = assignments.length >= required;
              const availableToAdd = data.faculty.filter((f) => !assignedIds.has(f.userId));

              return (
                <tr key={slot.id}>
                  <td>
                    {slot.classLabel} · {slot.subjectName}
                  </td>
                  <td>
                    {slot.date} {slot.startTime}–{slot.endTime}
                  </td>
                  <td>
                    <input
                      type="number"
                      min={1}
                      defaultValue={required}
                      key={`${slot.id}-${required}`}
                      onBlur={(e) => {
                        const next = Math.max(1, Number(e.target.value) || 1);
                        if (next !== required) onRequiredChange(slot.id, next);
                      }}
                      className="eduos-input"
                      style={{ width: "4rem" }}
                      aria-label="Required invigilators"
                    />
                  </td>
                  <td>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                      <span
                        style={{
                          fontSize: "0.75rem",
                          color:
                            assignments.length < required
                              ? "var(--eduos-warning, #b45309)"
                              : "var(--eduos-text-muted)",
                        }}
                      >
                        {assignments.length}/{required}
                      </span>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem" }}>
                        {assignments.length === 0 ? (
                          <span style={{ color: "var(--eduos-text-muted)" }}>—</span>
                        ) : (
                          assignments.map((a) => (
                            <span
                              key={a.facultyId}
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "0.25rem",
                                padding: "0.2rem 0.5rem",
                                borderRadius: "var(--eduos-radius)",
                                background: "var(--eduos-bg)",
                                fontSize: "0.8125rem",
                              }}
                            >
                              {a.facultyName}
                              <button
                                type="button"
                                onClick={() => onRemove(slot.id, a.facultyId)}
                                aria-label={`Remove ${a.facultyName}`}
                                style={{
                                  border: "none",
                                  background: "transparent",
                                  cursor: "pointer",
                                  color: "var(--eduos-text-muted)",
                                  padding: 0,
                                  lineHeight: 1,
                                }}
                              >
                                ×
                              </button>
                            </span>
                          ))
                        )}
                      </div>
                    </div>
                  </td>
                  <td>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "0.5rem",
                        alignItems: "flex-end",
                      }}
                    >
                      <div style={{ display: "flex", gap: "0.35rem", flexWrap: "wrap", justifyContent: "flex-end" }}>
                        <select
                          value={addFacultyId[slot.id] ?? ""}
                          onChange={(e) =>
                            setAddFacultyId((prev) => ({ ...prev, [slot.id]: e.target.value }))
                          }
                          className="eduos-input"
                          style={{ ...selectStyle, minWidth: "9rem" }}
                          disabled={atCap || availableToAdd.length === 0}
                        >
                          <option value="">Add faculty…</option>
                          {availableToAdd.map((f) => (
                            <option key={f.userId} value={f.userId}>
                              {f.name}
                            </option>
                          ))}
                        </select>
                        <Button
                          type="button"
                          disabled={atCap || !addFacultyId[slot.id]}
                          onClick={() => {
                            const id = addFacultyId[slot.id];
                            if (!id) return;
                            onAdd(slot.id, id);
                            setAddFacultyId((prev) => ({ ...prev, [slot.id]: "" }));
                          }}
                        >
                          Add
                        </Button>
                      </div>
                      {assignments.length > 0 ? (
                        <div style={{ display: "flex", gap: "0.35rem", flexWrap: "wrap", justifyContent: "flex-end" }}>
                          <select
                            value={replaceFromId[slot.id] ?? ""}
                            onChange={(e) =>
                              setReplaceFromId((prev) => ({ ...prev, [slot.id]: e.target.value }))
                            }
                            style={{ ...selectStyle, minWidth: "8rem" }}
                          >
                            <option value="">Replace…</option>
                            {assignments.map((a) => (
                              <option key={a.facultyId} value={a.facultyId}>
                                {a.facultyName}
                              </option>
                            ))}
                          </select>
                          <select
                            value={replaceToId[slot.id] ?? ""}
                            onChange={(e) =>
                              setReplaceToId((prev) => ({ ...prev, [slot.id]: e.target.value }))
                            }
                            style={{ ...selectStyle, minWidth: "8rem" }}
                          >
                            <option value="">With…</option>
                            {data.faculty
                              .filter(
                                (f) =>
                                  f.userId !== replaceFromId[slot.id] && !assignedIds.has(f.userId),
                              )
                              .map((f) => (
                                <option key={f.userId} value={f.userId}>
                                  {f.name}
                                </option>
                              ))}
                          </select>
                          <Button
                            type="button"
                            disabled={!replaceFromId[slot.id] || !replaceToId[slot.id]}
                            onClick={() => {
                              const from = replaceFromId[slot.id];
                              const to = replaceToId[slot.id];
                              if (!from || !to) return;
                              onReplace(slot.id, to, from);
                              setReplaceFromId((prev) => ({ ...prev, [slot.id]: "" }));
                              setReplaceToId((prev) => ({ ...prev, [slot.id]: "" }));
                            }}
                          >
                            Replace
                          </Button>
                        </div>
                      ) : null}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </section>
  );
}
