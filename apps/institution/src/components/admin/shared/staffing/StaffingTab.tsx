"use client";

import { useEffect, useMemo, useState } from "react";
import type { AcademicsData } from "@eduos/types";
import { useClassSectionFilters } from "../../attendance/useClassSectionFilters";
import { sectionGradeKey } from "./sectionGradeKey";
import { GradeSectionPeriodFilters } from "./GradeSectionPeriodFilters";
import { ClassTeacherCard } from "./ClassTeacherCard";
import { SubjectTeacherTable } from "./SubjectTeacherTable";
import { useStaffingLookup } from "./useStaffingLookup";

export function StaffingTab({
  data,
  onAction,
  onMessage,
  initialSectionId,
}: {
  data: AcademicsData;
  onAction: (body: Record<string, unknown>) => Promise<unknown>;
  onMessage: (m: string | null) => void;
  initialSectionId?: string;
}) {
  const isSchool = data.institutionType === "school";
  const periodLabel = data.periodKind === "semester" ? "Semester" : "Term";
  const [periodId, setPeriodId] = useState(data.currentPeriodId ?? data.periods[0]?.id ?? "");
  const {
    gradeKey,
    setGradeKey,
    sectionId,
    setSectionId,
    gradeOptions,
    sectionsForGrade,
    selectSectionById,
  } = useClassSectionFilters(data.classSections ?? []);

  useEffect(() => {
    if (initialSectionId) selectSectionById(initialSectionId);
  }, [initialSectionId, selectSectionById]);

  useEffect(() => {
    if (!periodId && data.periods[0]?.id) setPeriodId(data.periods[0].id);
  }, [data.periods, periodId]);

  const selectedSection = sectionsForGrade.find((s) => s.id === sectionId) ?? sectionsForGrade[0];
  const selectedGrade = gradeOptions.find((g) => g.key === gradeKey);
  const lookup = useStaffingLookup(data, periodId);
  const periodName = data.periods.find((p) => p.id === periodId)?.label ?? periodLabel;

  const subjectsForSection = useMemo(() => {
    const courseId = selectedGrade?.key ?? selectedSection?.courseId ?? selectedSection?.grade;
    return (data.subjects ?? []).filter(
      (s) => !s.archived && (s.courseId ?? s.grade) === courseId,
    );
  }, [data.subjects, selectedGrade, selectedSection]);

  const assignedSubjectCount = useMemo(
    () =>
      subjectsForSection.filter((s) => lookup.getSubjectTeacher(selectedSection?.id ?? "", s.id)?.facultyUserId)
        .length,
    [subjectsForSection, lookup, selectedSection?.id],
  );

  const classTeacher = selectedSection ? lookup.getClassTeacher(selectedSection.id) : null;
  const reviewItem = (data.adminReviewQueue ?? []).find(
    (item) => item.type === "subject_teacher_unassigned" && !item.resolved,
  );

  return (
    <div className="portal-dashboard-stack staffing-tab">
      <section className="eduos-panel">
        <div className="portal-panel-header">
          <h2 className="eduos-section-title">Staffing assignments</h2>
          <p className="eduos-section-desc">
            Assign class and subject teachers once per section. Timetable slots will pre-fill from these
            assignments.
          </p>
        </div>

        {reviewItem ? (
          <div className="portal-alert-card portal-alert-card--warning staffing-review-alert">
            <div className="portal-alert-card__title">{reviewItem.message}</div>
          </div>
        ) : null}
      </section>

      <section className="eduos-panel">
        <GradeSectionPeriodFilters
          data={data}
          gradeKey={gradeKey}
          onGradeChange={setGradeKey}
          sectionId={sectionId}
          onSectionChange={setSectionId}
          gradeOptions={gradeOptions}
          sectionsForGrade={sectionsForGrade}
          periodId={periodId}
          onPeriodChange={setPeriodId}
          periodLabel={periodLabel}
        />

        {selectedSection ? (
          <div className="staffing-context-strip">
            <span className="staffing-context-strip__label">Viewing</span>
            <strong>
              {selectedGrade?.label ?? selectedSection.label}
              {selectedSection.section ? ` · Section ${selectedSection.section}` : ""}
            </strong>
            <span className="staffing-context-strip__dot" aria-hidden>
              ·
            </span>
            <span>{periodName}</span>
            {subjectsForSection.length > 0 ? (
              <>
                <span className="staffing-context-strip__dot" aria-hidden>
                  ·
                </span>
                <span
                  className={`staffing-status-badge${assignedSubjectCount === subjectsForSection.length ? " staffing-status-badge--ok" : " staffing-status-badge--warning"}`}
                >
                  {assignedSubjectCount}/{subjectsForSection.length} subjects staffed
                </span>
              </>
            ) : null}
          </div>
        ) : null}
      </section>

      {isSchool && selectedSection ? (
        <ClassTeacherCard
          sectionLabel={selectedSection.label}
          assignment={classTeacher}
          faculty={data.faculty}
          onAssign={async (teacherUserId) => {
            const res = await onAction({
              action: "assign_class_teacher",
              payload: { classSectionId: selectedSection.id, teacherUserId },
            });
            if (res) onMessage("Class teacher assigned.");
          }}
          onUnassign={async () => {
            const res = await onAction({
              action: "unassign_class_teacher",
              payload: { classSectionId: selectedSection.id },
            });
            if (res) onMessage("Class teacher unassigned.");
          }}
        />
      ) : null}

      {selectedSection ? (
        <section className="eduos-panel">
          <div className="staffing-panel-head">
            <div>
              <h2 className="eduos-section-title">Subject teachers</h2>
              <p className="eduos-section-desc">
                One teacher per subject for this section and {periodLabel.toLowerCase()}.
              </p>
            </div>
            {subjectsForSection.length > 0 ? (
              <span className="staffing-context-strip__count">
                {subjectsForSection.length} subject{subjectsForSection.length === 1 ? "" : "s"}
              </span>
            ) : null}
          </div>
          <SubjectTeacherTable
            subjects={subjectsForSection}
            faculty={data.faculty}
            facultyName={lookup.facultyName}
            getAssignment={(subjectId) => lookup.getSubjectTeacher(selectedSection.id, subjectId)?.facultyUserId ?? null}
            onAssign={async (subjectId, facultyUserId) => {
              const res = await onAction({
                action: "assign_subject_teacher",
                payload: {
                  classSectionId: selectedSection.id,
                  subjectId,
                  facultyUserId,
                  academicPeriodId: periodId,
                },
              });
              if (res) onMessage("Subject teacher assigned.");
            }}
            onUnassign={async (subjectId) => {
              const res = await onAction({
                action: "unassign_subject_teacher",
                payload: {
                  classSectionId: selectedSection.id,
                  subjectId,
                  academicPeriodId: periodId,
                },
              });
              if (res) onMessage("Subject teacher cleared.");
            }}
          />
        </section>
      ) : (
        <section className="eduos-panel">
          <p className="eduos-section-desc" style={{ margin: 0 }}>
            Add a class section under <strong>Structure</strong> first, then return here to assign teachers.
          </p>
        </section>
      )}
    </div>
  );
}

export { sectionGradeKey };
