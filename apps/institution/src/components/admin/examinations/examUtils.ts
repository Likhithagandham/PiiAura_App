import type { ClassBatchSection, ExamClash, ExamSlot, ExaminationsData } from "@eduos/types";

export const SCHOOL_EXAM_TABS = ["Schedule", "Seating", "Invigilation", "Results"] as const;
export type SchoolExamTab = (typeof SCHOOL_EXAM_TABS)[number];

export function idemHeaders(): HeadersInit {
  return {
    "Content-Type": "application/json",
    "Idempotency-Key": `exams-${Date.now()}`,
  };
}

export function sectionGradeKey(c: ClassBatchSection): string {
  return c.courseId ?? c.grade ?? c.id;
}

export function slotsForSection(slots: ExamSlot[], sectionId: string): ExamSlot[] {
  if (!sectionId) return slots;
  return slots.filter((s) => s.classSectionId === sectionId);
}

export function sortSlots(slots: ExamSlot[]): ExamSlot[] {
  return [...slots].sort((a, b) => (a.date + a.startTime).localeCompare(b.date + b.startTime));
}

export function pill(bg: string, fg: string): React.CSSProperties {
  return {
    display: "inline-block",
    padding: "0.15rem 0.45rem",
    borderRadius: "var(--eduos-radius)",
    fontSize: "0.6875rem",
    fontWeight: 700,
    background: bg,
    color: fg,
    textTransform: "uppercase",
    letterSpacing: "0.04em",
  };
}

export function statusPill(status: ExamSlot["status"]) {
  return status === "published" ? pill("#48bb7822", "#48bb78") : pill("#71809622", "#718096");
}

export function clashesForSlot(clashes: ExamClash[], slotId: string): ExamClash[] {
  return clashes.filter((c) => c.slotId === slotId || c.otherSlotId === slotId);
}

export function slotHasClash(data: ExaminationsData, slotId: string): boolean {
  return clashesForSlot(data.clashes, slotId).length > 0;
}

export function isSlotPublished(data: ExaminationsData, slotId: string): boolean {
  const status = data.resultStatusByExam[slotId];
  return status === "published" || status === "revised";
}

function parseSlotTime(date: string, time: string): number {
  return new Date(`${date}T${time}:00`).getTime();
}

function slotsOverlap(a: ExamSlot, b: ExamSlot): boolean {
  if (a.date !== b.date) return false;
  const aStart = parseSlotTime(a.date, a.startTime);
  const aEnd = parseSlotTime(a.date, a.endTime);
  const bStart = parseSlotTime(b.date, b.startTime);
  const bEnd = parseSlotTime(b.date, b.endTime);
  return aStart < bEnd && aEnd > bStart;
}

/** Client-side schedule clash detection (room / class overlap). */
export function computeClashesFromSlots(slots: ExamSlot[]): ExamClash[] {
  const clashes: ExamClash[] = [];
  for (let i = 0; i < slots.length; i += 1) {
    for (let j = i + 1; j < slots.length; j += 1) {
      const a = slots[i]!;
      const b = slots[j]!;
      if (!slotsOverlap(a, b)) continue;
      if (a.roomId === b.roomId) {
        clashes.push({
          type: "room_overlap",
          slotId: a.id,
          otherSlotId: b.id,
          message: `Room clash: ${a.roomName} (${a.startTime}–${a.endTime} vs ${b.startTime}–${b.endTime}).`,
        });
      }
      if (a.classSectionId === b.classSectionId) {
        clashes.push({
          type: "class_overlap",
          slotId: a.id,
          otherSlotId: b.id,
          message: `Class clash: ${a.classLabel} has overlapping exams.`,
        });
      }
    }
  }
  return clashes;
}

export function studentsForSection(data: ExaminationsData, sectionId: string) {
  if (!sectionId) return data.students;
  return data.students.filter((s) => s.classSectionId === sectionId);
}

export function formatSlotLabel(slot: ExamSlot): string {
  return `${slot.classLabel} · ${slot.subjectName} · ${slot.date} ${slot.startTime}`;
}

export function marksEntryDeadline(slot: ExamSlot): string {
  if (slot.marksEntryDeadlineAt) return slot.marksEntryDeadlineAt;
  const endMs = new Date(`${slot.date}T${slot.endTime}:00`).getTime();
  return new Date(endMs + 72 * 60 * 60 * 1000).toISOString();
}

export function isMarksEntryLocked(slot: ExamSlot): boolean {
  return new Date() > new Date(marksEntryDeadline(slot));
}
