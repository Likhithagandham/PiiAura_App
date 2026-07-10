import { useEffect, useMemo, useState } from "react";
import type { ClassBatchSection, ExamSlot } from "@eduos/types";
import { sectionGradeKey, slotsForSection, sortSlots } from "./examUtils";

export function useExamSectionFilters(classSections: ClassBatchSection[], allSlots: ExamSlot[]) {
  const [gradeKey, setGradeKey] = useState("");
  const [sectionId, setSectionId] = useState("");
  const [slotId, setSlotId] = useState("");

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

  const sectionSlots = useMemo(
    () => sortSlots(slotsForSection(allSlots, sectionId)),
    [allSlots, sectionId],
  );

  useEffect(() => {
    if (!sectionSlots.length) {
      setSlotId("");
      return;
    }
    if (!sectionSlots.some((s) => s.id === slotId)) {
      setSlotId(sectionSlots[0]!.id);
    }
  }, [sectionSlots, slotId]);

  const selectedSlot = sectionSlots.find((s) => s.id === slotId) ?? null;

  return {
    gradeKey,
    setGradeKey,
    sectionId,
    setSectionId,
    slotId,
    setSlotId,
    gradeOptions,
    sectionsForGrade,
    sectionSlots,
    selectedSlot,
  };
}
