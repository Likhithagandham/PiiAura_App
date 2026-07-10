export interface ClassTeacherAssignment {
  classSectionId: string;
  classLabel: string;
  teacherUserId: string;
  teacherName: string;
  assignedAt: string;
}

export interface SubjectTeacherAssignment {
  id: string;
  classSectionId: string;
  subjectId: string;
  facultyUserId: string;
  academicPeriodId: string;
  assignedAt: string;
  batchSubjectId: string;
  version?: number;
}

export interface AssignClassTeacherInput {
  classSectionId: string;
  teacherUserId: string;
  assignedAt?: string;
}

export interface AssignSubjectTeacherInput {
  classSectionId: string;
  subjectId: string;
  facultyUserId: string;
  academicPeriodId?: string;
  assignedAt?: string;
}

export interface UnassignSubjectTeacherInput {
  classSectionId: string;
  subjectId: string;
  academicPeriodId?: string;
}

export interface SubjectTeacherGap {
  classSectionId: string;
  subjectId: string;
  batchSubjectId?: string;
}
