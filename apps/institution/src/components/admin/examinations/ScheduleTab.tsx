import type { ExamSlot, ExaminationsData } from "@eduos/types";
import { Button } from "@eduos/ui";
import { ExamSectionFilters } from "./ExamSectionFilters";
import { clashesForSlot, statusPill } from "./examUtils";
import type { useExamSectionFilters } from "./useExamSectionFilters";

type Filters = ReturnType<typeof useExamSectionFilters>;

export function ScheduleTab({
  data,
  filters,
  onNew,
  onBulkNew,
  onEdit,
  onDelete,
}: {
  data: ExaminationsData;
  filters: Filters;
  onNew: () => void;
  onBulkNew: () => void;
  onEdit: (slot: ExamSlot) => void;
  onDelete: (slotId: string) => void;
}) {
  const visibleSlots = filters.sectionSlots;

  return (
    <section className="eduos-panel">
      <div style={{ display: "flex", justifyContent: "space-between", gap: "0.75rem", flexWrap: "wrap" }}>
        <div>
          <h2 className="eduos-section-title">Exam schedule</h2>
          <p style={{ margin: "0.25rem 0 0", fontSize: "0.8125rem", color: "var(--eduos-text-muted)" }}>
            Create exam slots with room and time clash detection. Drafts can be saved even if clashes exist;
            publishing is blocked when conflicts remain.
          </p>
        </div>
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          <Button type="button" onClick={onNew}>
            New exam slot
          </Button>
          {filters.sectionsForGrade.length > 1 ? (
            <Button type="button" onClick={onBulkNew}>
              Add for all sections in grade
            </Button>
          ) : null}
        </div>
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
        <p style={{ color: "var(--eduos-text-muted)", marginTop: "1rem" }}>
          No exam slots for this section. Use New exam slot to create one.
        </p>
      ) : (
        <table className="eduos-admin-table" style={{ marginTop: "1rem" }}>
          <thead>
            <tr>
              <th>Date</th>
              <th>Time</th>
              <th>Subject</th>
              <th>Room</th>
              <th>Status</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {visibleSlots.map((slot) => {
              const slotClashes = clashesForSlot(data.clashes, slot.id);
              const warnings = data.warningsByExam[slot.id] ?? [];
              return (
                <tr key={slot.id}>
                  <td>{slot.date}</td>
                  <td>
                    {slot.startTime}–{slot.endTime}
                  </td>
                  <td>
                    {slot.subjectName}
                    {slotClashes.length ? (
                      <span style={{ marginLeft: "0.35rem", ...statusPill("draft"), color: "var(--eduos-danger)" }}>
                        clash
                      </span>
                    ) : null}
                    {warnings.length ? (
                      <span style={{ marginLeft: "0.35rem", fontSize: "0.625rem", color: "var(--eduos-warning, #d69e2e)" }}>
                        holiday
                      </span>
                    ) : null}
                  </td>
                  <td>{slot.roomName}</td>
                  <td>
                    <span style={statusPill(slot.status)}>{slot.status}</span>
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
                      <Button type="button" onClick={() => onEdit(slot)}>
                        Edit
                      </Button>
                      <Button type="button" onClick={() => onDelete(slot.id)}>
                        Delete
                      </Button>
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
