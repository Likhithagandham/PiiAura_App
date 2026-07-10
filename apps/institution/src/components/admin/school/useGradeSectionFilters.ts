import { useEffect, useMemo, useState } from "react";
import type { ClassBatchSection } from "@eduos/types";
import { sectionGradeKey } from "../examinations/examUtils";

export function useGradeSectionFilters(classSections: ClassBatchSection[]) {
  const [gradeKey, setGradeKey] = useState("");
  const [sectionId, setSectionId] = useState("");

  const gradeOptions = useMemo(() => {
    const map = new Map<string, { key: string; label: string }>();
    for (const c of classSections) {
      const key = sectionGradeKey(c);
      if (map.has(key)) continue;
      map.set(key, { key, label: c.grade ?? c.label });
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

  const selectedSection = sectionsForGrade.find((s) => s.id === sectionId) ?? null;

  return {
    gradeKey,
    setGradeKey,
    sectionId,
    setSectionId,
    gradeOptions,
    sectionsForGrade,
    selectedSection,
  };
}
