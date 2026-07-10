import type { AcademicsData, TimetableSlot } from "@eduos/types";

export function dayOfWeekFromIsoDate(date: string): number {
  return new Date(`${date}T12:00:00`).getDay();
}

export function sessionsForDate(slots: TimetableSlot[], date: string): TimetableSlot[] {
  const dow = dayOfWeekFromIsoDate(date);
  return slots
    .filter((s) => s.dayOfWeek === dow)
    .sort((a, b) => a.periodIndex - b.periodIndex || a.startTime.localeCompare(b.startTime));
}

export function formatSessionLabel(slot: TimetableSlot, data: AcademicsData): string {
  const subj = data.subjects.find((s) => s.id === slot.subjectId)?.name ?? "";
  const cls = data.classSections.find((c) => c.id === slot.classSectionId)?.label ?? "";
  const start = slot.startTime ? slot.startTime.slice(0, 5) : "";
  const end = slot.endTime ? slot.endTime.slice(0, 5) : "";
  const time = start && end ? ` · ${start}–${end}` : "";
  return `${cls} — ${subj} · P${slot.periodIndex}${time}`;
}

export function facultyDisplayName(data: AcademicsData, userId: string): string {
  if (!userId) return "—";
  return data.faculty.find((f) => f.userId === userId)?.name ?? userId;
}
