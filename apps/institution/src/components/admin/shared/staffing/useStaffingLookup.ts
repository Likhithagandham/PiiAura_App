"use client";

import { useMemo } from "react";
import type { AcademicsData, ClassTeacherAssignment, SubjectTeacherAssignment } from "@eduos/types";

export function useStaffingLookup(data: AcademicsData, periodId: string) {
  return useMemo(() => {
    const classTeacherBySection = new Map<string, ClassTeacherAssignment>();
    for (const row of data.classTeachers ?? []) {
      classTeacherBySection.set(row.classSectionId, row);
    }

    const subjectTeacherByKey = new Map<string, SubjectTeacherAssignment>();
    for (const row of data.subjectTeachers ?? []) {
      if (row.academicPeriodId !== periodId) continue;
      subjectTeacherByKey.set(`${row.classSectionId}:${row.subjectId}`, row);
    }

    const facultyNameById = new Map(
      (data.faculty ?? []).map((f) => [f.userId, f.name]),
    );

    return {
      getClassTeacher(sectionId: string) {
        return classTeacherBySection.get(sectionId) ?? null;
      },
      getSubjectTeacher(sectionId: string, subjectId: string) {
        return subjectTeacherByKey.get(`${sectionId}:${subjectId}`) ?? null;
      },
      facultyName(userId: string) {
        return facultyNameById.get(userId) ?? userId;
      },
    };
  }, [data.classTeachers, data.subjectTeachers, data.faculty, periodId]);
}
