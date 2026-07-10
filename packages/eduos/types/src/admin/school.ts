import type { ClassBatchSection } from "./academics";
import type {
  ClassTeacherAssignment,
  SubjectTeacherAssignment,
  AssignClassTeacherInput,
  AssignSubjectTeacherInput,
  UnassignSubjectTeacherInput,
  SubjectTeacherGap,
} from "./staffing";
export type {
  ClassTeacherAssignment,
  SubjectTeacherAssignment,
  AssignClassTeacherInput,
  AssignSubjectTeacherInput,
  UnassignSubjectTeacherInput,
  SubjectTeacherGap,
};

export type HomeworkStatus = "draft" | "published";

export interface DailyHomeworkEntry {
  id: string;
  classSectionId: string;
  classLabel: string;
  date: string; // YYYY-MM-DD
  title: string;
  details: string;
  status: HomeworkStatus;
  createdBy: string;
  createdByUserId?: string;
  createdAt: string; // ISO
  publishedAt: string | null; // ISO
}

export interface CoCurricularActivity {
  id: string;
  name: string;
  category: string; // e.g. Sports, Arts
  date: string; // YYYY-MM-DD
  createdAt: string; // ISO
}

export type ParticipationStatus = "registered" | "attended" | "missed";

export interface ActivityParticipation {
  id: string;
  activityId: string;
  activityName: string;
  studentId: string;
  studentName: string;
  classLabel: string;
  status: ParticipationStatus;
}

export interface PtmSlot {
  id: string;
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  capacity: number;
  bookedCount: number;
}

export interface PtmSchedule {
  id: string;
  classSectionId: string;
  classLabel: string;
  date: string; // YYYY-MM-DD
  slots: PtmSlot[];
  published: boolean;
  createdAt: string; // ISO
  publishedAt: string | null; // ISO
}

export interface SchoolOnlyData {
  institutionType: "school" | "college";
  classTeachers: ClassTeacherAssignment[];
  homework: DailyHomeworkEntry[];
  activities: CoCurricularActivity[];
  participation: ActivityParticipation[];
  ptm: PtmSchedule[];
  /** Grade/section options for filters and forms */
  classSections?: ClassBatchSection[];
  facultyOptions?: { id: string; name: string }[];
}


export interface SaveHomeworkInput {
  id?: string;
  classSectionId: string;
  date: string;
  title: string;
  details: string;
  publish?: boolean;
}

export interface SaveActivityInput {
  id?: string;
  name: string;
  category: string;
  date: string;
}

export interface SaveParticipationInput {
  activityId: string;
  studentId: string;
  status: ParticipationStatus;
}

export interface SavePtmInput {
  id?: string;
  classSectionId: string;
  date: string;
  slots: { startTime: string; endTime: string; capacity: number }[];
  publish?: boolean;
}

