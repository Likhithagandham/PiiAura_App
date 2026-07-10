import type { ExamSlot } from "@eduos/types";

interface GradeOption {
  key: string;
  label: string;
}

interface SectionOption {
  id: string;
  section?: string | null;
  label: string;
}

export function ExamSectionFilters({
  gradeOptions,
  sectionsForGrade,
  sectionSlots,
  gradeKey,
  sectionId,
  slotId,
  onGradeChange,
  onSectionChange,
  onSlotChange,
  showSlotPicker = false,
  slotRequired = false,
}: {
  gradeOptions: GradeOption[];
  sectionsForGrade: SectionOption[];
  sectionSlots: ExamSlot[];
  gradeKey: string;
  sectionId: string;
  slotId: string;
  onGradeChange: (key: string) => void;
  onSectionChange: (id: string) => void;
  onSlotChange?: (id: string) => void;
  showSlotPicker?: boolean;
  slotRequired?: boolean;
}) {
  if (!gradeOptions.length) return null;

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "0.75rem",
        alignItems: "center",
        marginBottom: "1rem",
      }}
    >
      <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.8125rem" }}>
        <span style={{ fontWeight: 600, color: "var(--eduos-text-muted)" }}>Grade</span>
        <select
          value={gradeKey}
          onChange={(e) => onGradeChange(e.target.value)}
          className="eduos-input"
          style={{ minWidth: "8rem" }}
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
            value={sectionId}
            onChange={(e) => onSectionChange(e.target.value)}
            className="eduos-input"
            style={{ minWidth: "5rem" }}
          >
            {sectionsForGrade.map((c) => (
              <option key={c.id} value={c.id}>
                {c.section ?? c.label.split(" - ").pop() ?? c.label}
              </option>
            ))}
          </select>
        </label>
      ) : null}
      {showSlotPicker && onSlotChange ? (
        <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.8125rem" }}>
          <span style={{ fontWeight: 600, color: "var(--eduos-text-muted)" }}>
            Exam slot{slotRequired ? "" : ""}
          </span>
          <select
            value={slotId}
            onChange={(e) => onSlotChange(e.target.value)}
            className="eduos-input"
            style={{ minWidth: "14rem" }}
          >
            {sectionSlots.length === 0 ? (
              <option value="">No slots for this section</option>
            ) : (
              sectionSlots.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.subjectName} · {s.date} {s.startTime}
                </option>
              ))
            )}
          </select>
        </label>
      ) : null}
    </div>
  );
}
