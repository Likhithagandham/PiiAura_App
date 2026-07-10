"use client";

import type { AcademicsData } from "@eduos/types";
import { GradeSectionFilters } from "./GradeSectionFilters";

export function GradeSectionPeriodFilters({
  data,
  gradeKey,
  onGradeChange,
  sectionId,
  onSectionChange,
  gradeOptions,
  sectionsForGrade,
  periodId,
  onPeriodChange,
  periodLabel,
}: {
  data: AcademicsData;
  gradeKey: string;
  onGradeChange: (key: string) => void;
  sectionId: string;
  onSectionChange: (id: string) => void;
  gradeOptions: { key: string; label: string }[];
  sectionsForGrade: { id: string; section?: string | null; label: string }[];
  periodId: string;
  onPeriodChange: (id: string) => void;
  periodLabel: string;
}) {
  return (
    <div className="portal-filter-bar staffing-filters">
      <GradeSectionFilters
        gradeKey={gradeKey}
        onGradeChange={onGradeChange}
        sectionId={sectionId}
        onSectionChange={onSectionChange}
        gradeOptions={gradeOptions}
        sectionsForGrade={sectionsForGrade}
        className="staffing-filters__inline"
      />
      <label className="portal-filter-bar__select">
        <span className="portal-filter-bar__select-label">{periodLabel}</span>
        <select
          className="eduos-input portal-filter-bar__select-input"
          value={periodId}
          onChange={(e) => onPeriodChange(e.target.value)}
          aria-label={periodLabel}
        >
          {(data.periods ?? []).map((p) => (
            <option key={p.id} value={p.id}>
              {p.label}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
