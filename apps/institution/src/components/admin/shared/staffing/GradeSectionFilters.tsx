"use client";

export function GradeSectionFilters({
  gradeKey,
  onGradeChange,
  sectionId,
  onSectionChange,
  gradeOptions,
  sectionsForGrade,
  className = "",
}: {
  gradeKey: string;
  onGradeChange: (key: string) => void;
  sectionId: string;
  onSectionChange: (id: string) => void;
  gradeOptions: { key: string; label: string }[];
  sectionsForGrade: { id: string; section?: string | null; label: string }[];
  className?: string;
}) {
  return (
    <div className={`portal-filter-bar staffing-filters ${className}`.trim()}>
      <label className="portal-filter-bar__select">
        <span className="portal-filter-bar__select-label">Grade / program</span>
        <select
          className="eduos-input portal-filter-bar__select-input"
          value={gradeKey}
          onChange={(e) => onGradeChange(e.target.value)}
          aria-label="Grade or program"
        >
          {gradeOptions.map((g) => (
            <option key={g.key} value={g.key}>
              {g.label}
            </option>
          ))}
        </select>
      </label>
      <label className="portal-filter-bar__select">
        <span className="portal-filter-bar__select-label">Section</span>
        <select
          className="eduos-input portal-filter-bar__select-input"
          value={sectionId}
          onChange={(e) => onSectionChange(e.target.value)}
          aria-label="Section"
        >
          {sectionsForGrade.map((s) => (
            <option key={s.id} value={s.id}>
              {s.section ?? s.label}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
