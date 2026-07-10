import type { AcademicsData, ClassBatchSection, SubjectMaster, TimetableSlot } from "@eduos/types";
import { TIMETABLE_UNASSIGNED_FACULTY_ID } from "@eduos/types";

export type TimetableSlotFormState = {
  classSectionId: string;
  subjectId: string;
  facultyUserId: string;
  roomId: string;
  dayOfWeek: number;
  periodIndex: number;
  startTime: string;
  endTime: string;
};

export function subjectsForSection(
  section: ClassBatchSection | undefined,
  subjects: SubjectMaster[],
): SubjectMaster[] {
  if (!section) return subjects.filter((s) => !s.archived);
  const courseKey = section.courseId ?? section.grade ?? section.id;
  return subjects.filter(
    (s) => !s.archived && (s.courseId ?? s.grade) === courseKey,
  );
}

function staffingFacultyId(
  data: AcademicsData,
  classSectionId: string,
  subjectId: string,
): string {
  const periodId = data.currentPeriodId ?? data.periods[0]?.id ?? "";
  const row = data.subjectTeachers?.find(
    (t) =>
      t.classSectionId === classSectionId
      && t.subjectId === subjectId
      && t.academicPeriodId === periodId,
  );
  return row?.facultyUserId ?? "";
}

export function defaultSlotForm(
  data: AcademicsData,
  opts?: {
    dayOfWeek?: number;
    periodIndex?: number;
    classSectionId?: string;
  },
): TimetableSlotFormState {
  const dayOfWeek = opts?.dayOfWeek ?? 1;
  const periodIndex = opts?.periodIndex ?? 1;
  const classSectionId = opts?.classSectionId ?? data.classSections[0]?.id ?? "";
  const section = data.classSections.find((c) => c.id === classSectionId);
  const gradeSubjects = subjectsForSection(section, data.subjects);
  const subjectId = gradeSubjects[0]?.id ?? "";
  const facultyUserId = staffingFacultyId(data, classSectionId, subjectId);

  return {
    classSectionId,
    subjectId,
    facultyUserId,
    roomId: data.rooms[0]?.id ?? "",
    dayOfWeek,
    periodIndex,
    startTime: "09:00",
    endTime: "09:45",
  };
}

export function slotFormFromTimetableSlot(slot: TimetableSlot): TimetableSlotFormState {
  return {
    classSectionId: slot.classSectionId,
    subjectId: slot.subjectId,
    facultyUserId: slot.facultyUserId,
    roomId: slot.roomId,
    dayOfWeek: slot.dayOfWeek,
    periodIndex: slot.periodIndex,
    startTime: slot.startTime,
    endTime: slot.endTime,
  };
}

export function hasStaffingTeacher(
  data: AcademicsData,
  classSectionId: string,
  subjectId: string,
): boolean {
  return staffingFacultyId(data, classSectionId, subjectId) !== "";
}

export function applyStaffingFaculty(
  data: AcademicsData,
  form: TimetableSlotFormState,
): TimetableSlotFormState {
  const facultyUserId = staffingFacultyId(data, form.classSectionId, form.subjectId);
  return { ...form, facultyUserId };
}

export function facultyIdForDisplay(
  data: AcademicsData,
  classSectionId: string,
  subjectId: string,
  slotFacultyUserId?: string,
): string {
  const fromStaffing = staffingFacultyId(data, classSectionId, subjectId);
  if (fromStaffing) return fromStaffing;
  if (slotFacultyUserId && slotFacultyUserId !== TIMETABLE_UNASSIGNED_FACULTY_ID) {
    return slotFacultyUserId;
  }
  return "";
}
