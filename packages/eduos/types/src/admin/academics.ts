import type { ClassTeacherAssignment, SubjectTeacherGap, SubjectTeacherAssignment } from "./staffing";

export type CalendarPeriodKind = "term" | "semester";
export type { SubjectTeacherGap };

export interface CalendarPeriod {
  id: string;
  kind: CalendarPeriodKind;
  label: string;
  startDate: string;
  endDate: string;
  academicYearId: string;
}

export interface AcademicCalendarHoliday {
  id: string;
  name: string;
  date: string;
}

export interface WorkingDayRule {
  dayOfWeek: number;
  label: string;
  isWorkingDay: boolean;
}

export interface SyllabusUnit {
  id: string;
  title: string;
  order: number;
}

export interface SubjectSectionProgress {
  classSectionId: string;
  label: string;
  syllabusCompletionPercent: number;
  completedUnitIds: string[];
}

export interface SubjectMaster {
  id: string;
  code: string;
  name: string;
  grade?: string;
  courseId?: string;
  syllabusUnits: SyllabusUnit[];
  sectionProgress?: SubjectSectionProgress[];
  credits: number | null;
  archived: boolean;
  hasMarks: boolean;
  /** @deprecated Use sectionProgress for the selected class section */
  syllabusCompletionPercent?: number;
  /** @deprecated Use sectionProgress for the selected class section */
  completedUnitIds?: string[];
}

export interface DepartmentNode {
  id: string;
  name: string;
  parentId: string | null;
}

export interface ClassBatchSection {
  id: string;
  label: string;
  departmentId: string;
  /** Grade (school) or program (college) — maps to Course.name */
  courseId?: string;
  grade?: string;
  section?: string | null;
  /** College cohort year label (display only in mock/college UI) */
  batch?: string | null;
  academicYearId?: string;
}

export interface StudyMaterialFolder {
  id: string;
  classSectionId: string;
  name: string;
  sortOrder: number;
  materialCount: number;
}

export interface StudyMaterial {
  id: string;
  classSectionId: string;
  classLabel: string;
  folderId?: string | null;
  folderName?: string | null;
  fileName: string;
  s3Key: string;
  url: string;
  uploadedAt: string;
  uploadedByUserId: string;
}

export interface RoomMaster {
  id: string;
  name: string;
}

export type TimetableSlotStatus = "active" | "tbd" | "faculty_unassigned";

export const TIMETABLE_TBD_SUBJECT_ID = "__tbd__";
export const TIMETABLE_UNASSIGNED_FACULTY_ID = "__unassigned__";

export interface TimetableSlot {
  id: string;
  classSectionId: string;
  subjectId: string;
  facultyUserId: string;
  roomId: string;
  dayOfWeek: number;
  periodIndex: number;
  startTime: string;
  endTime: string;
  status: TimetableSlotStatus;
  statusNote: string | null;
}

export type AdminReviewItemType = "tbd_slots" | "faculty_unassigned" | "subject_teacher_unassigned";

export interface AdminReviewItem {
  id: string;
  type: AdminReviewItemType;
  message: string;
  slotIds?: string[];
  gaps?: SubjectTeacherGap[];
  createdAt: string;
  resolved: boolean;
}

export interface CalendarChangeRecord {
  id: string;
  changeType: "working_days" | "period" | "holiday";
  description: string;
  effectiveDate: string;
  attendanceFrozenThrough: string;
  createdAt: string;
}

export type TimetableClashType = "faculty" | "room";

export interface TimetableClash {
  type: TimetableClashType;
  message: string;
  slotIds: string[];
}

export interface SubstitutionRecord {
  id: string;
  timetableSlotId: string;
  originalFacultyUserId: string;
  substituteFacultyUserId: string;
  date: string;
  reason: string;
  status: "scheduled" | "completed" | "cancelled";
  createdAt: string;
}

export interface FacultyOption {
  userId: string;
  name: string;
}

export interface SubstitutionAvailability {
  originalFacultyUserId: string;
  originalFacultyName: string;
  slot: Pick<TimetableSlot, "id" | "classSectionId" | "subjectId" | "periodIndex" | "startTime" | "endTime">;
  availableFaculty: FacultyOption[];
}

export interface ClassSectionOption {
  id: string;
  label: string;
}

export interface AcademicsData {
  institutionType: "school" | "college";
  hierarchyLabel: "Department" | "Stream";
  periodKind: CalendarPeriodKind;
  academicYears: { id: string; label: string }[];
  periods: CalendarPeriod[];
  holidays: AcademicCalendarHoliday[];
  workingDays: WorkingDayRule[];
  departments: DepartmentNode[];
  classSections: ClassBatchSection[];
  subjects: SubjectMaster[];
  rooms: RoomMaster[];
  timetableSlots: TimetableSlot[];
  substitutions: SubstitutionRecord[];
  studyMaterialFolders: StudyMaterialFolder[];
  studyMaterials: StudyMaterial[];
  faculty: FacultyOption[];
  classTeachers: ClassTeacherAssignment[];
  subjectTeachers: SubjectTeacherAssignment[];
  currentPeriodId: string | null;
  adminReviewQueue: AdminReviewItem[];
  calendarChanges: CalendarChangeRecord[];
  attendanceFrozenThrough: string | null;
}

export interface SaveCalendarPeriodInput {
  id?: string;
  label: string;
  startDate: string;
  endDate: string;
  academicYearId: string;
}

export interface SaveSubjectInput {
  id?: string;
  courseId?: string;
  code: string;
  name: string;
  credits?: number | null;
  syllabusUnits?: { id?: string; title: string }[];
}

export interface SaveTimetableSlotInput {
  id?: string;
  classSectionId: string;
  subjectId: string;
  facultyUserId: string;
  roomId: string;
  dayOfWeek: number;
  periodIndex: number;
  startTime: string;
  endTime: string;
}

export interface CreateSubstitutionInput {
  timetableSlotId: string;
  substituteFacultyUserId: string;
  date: string;
  reason: string;
}

export interface SaveDepartmentInput {
  id?: string;
  name: string;
  parentId?: string | null;
}

export interface SaveClassSectionInput {
  id?: string;
  departmentId: string;
  /** College: full cohort label stored on batch. School: omit — use grade + section. */
  label?: string;
  /** School: grade name (e.g. Class 5) → Course */
  grade?: string;
  section?: string | null;
  batch?: string | null;
}

export interface UpdateSyllabusCompletionInput {
  subjectId: string;
  classSectionId: string;
  completedUnitIds: string[];
}

export interface UploadStudyMaterialInput {
  classSectionId: string;
  folderId?: string;
  fileName: string;
}

export interface CreateStudyFolderInput {
  classSectionId: string;
  name: string;
}

export interface RenameStudyFolderInput {
  folderId: string;
  name: string;
}
