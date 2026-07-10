import type { ClassBatchSection } from "@eduos/types";

export function sectionGradeKey(c: ClassBatchSection): string {
  return c.courseId ?? c.grade ?? c.id;
}
