/**
 * Faculty portal — Django backend service.
 */

import type { FacultyApplyLeaveInput, FacultyTimetableData, UpdateFacultyProfileInput, UpdateNotificationChannelsInput } from "@eduos/types";
import { backendNotImplemented } from "./data-source";
import { djangoGet, djangoSend } from "./django-client";

type FacultyCtx = { subdomain: string; facultyUserId: string; facultyName?: string };

export async function getDashboard(request: Request, ctx: FacultyCtx): Promise<import("@eduos/types").FacultyDashboardData> {
  return djangoGet(request, "/api/v1/auth/me/faculty-dashboard/");
}

export async function getLeave(request: Request, subdomain: string) {
  return djangoGet(request, "/api/v1/attendance/faculty/leave/");
}

export async function reviewStudentLeave(
  request: Request,
  ctx: FacultyCtx,
  input: { requestId: string; approve: boolean; reviewNote?: string },
) {
  const res = await djangoSend<{ leave: unknown }>(
    request, `/api/v1/attendance/leave/${input.requestId}/`, "PATCH",
    { action: input.approve ? "approve" : "reject", note: input.reviewNote ?? "" },
  );
  return (res as { leave?: unknown }).leave ?? res;
}

export async function getMyLeave(request: Request, ctx: FacultyCtx) {
  return djangoGet(request, "/api/v1/hr/me/leave/");
}

export async function applyMyLeave(
  request: Request,
  ctx: FacultyCtx,
  input: FacultyApplyLeaveInput,
) {
  const res = await djangoSend<{ leave: unknown }>(
    request, "/api/v1/hr/me/leave/", "POST", input,
  );
  return (res as { leave?: unknown }).leave ?? res;
}

export async function getNotificationPreferences(request: Request, ctx: FacultyCtx) {
  return djangoGet(request, "/api/v1/communications/notification-preferences/");
}

export async function updateNotificationPreferences(
  request: Request,
  ctx: FacultyCtx,
  channels: UpdateNotificationChannelsInput,
) {
  return djangoSend(request, "/api/v1/communications/notification-preferences/", "PATCH", channels);
}

export async function getAnnouncements(request: Request, ctx: FacultyCtx) {
  return djangoGet(request, "/api/v1/communications/announcements/faculty/");
}

export async function getAttendance(request: Request, subdomain: string) {
  return djangoGet(request, "/api/v1/attendance/faculty/attendance/");
}

export async function markAttendance(
  request: Request,
  ctx: FacultyCtx,
  input: { recordId: string; newStatus: string; geo?: { latitude: number; longitude: number } },
) {
  const res = await djangoSend<{ record: unknown }>(
    request, `/api/v1/attendance/faculty/records/${input.recordId}/mark/`, "PATCH",
    { newStatus: input.newStatus },
  );
  return (res as { record?: unknown }).record ?? res;
}

export async function getAssignments(request: Request, ctx: FacultyCtx) {
  return djangoGet(request, "/api/v1/examinations/me/teaching/assignments/");
}

export async function createAssignment(
  request: Request,
  ctx: FacultyCtx,
  input: import("@eduos/types").CreateFacultyAssignmentInput,
) {
  const res = await djangoSend<{ assignment: unknown }>(
    request,
    "/api/v1/examinations/me/teaching/assignments/",
    "POST",
    input,
  );
  return (res as { assignment?: unknown }).assignment ?? res;
}

export async function getHomework(
  request: Request,
  ctx: FacultyCtx,
  viewScope?: "school" | "college",
) {
  return djangoGet(request, "/api/v1/coursework/me/homework/");
}

export async function saveHomework(
  request: Request,
  ctx: FacultyCtx,
  payload: {
    id?: string;
    classSectionId: string;
    date: string;
    title: string;
    details: string;
    publish?: boolean;
  },
) {
  const res = await djangoSend<{ entry: unknown }>(
    request, "/api/v1/coursework/me/homework/", "POST", payload,
  );
  return (res as { entry?: unknown }).entry ?? res;
}

export async function deleteHomework(request: Request, ctx: FacultyCtx, id: string) {
  return djangoSend(request, `/api/v1/coursework/me/homework/${id}/`, "DELETE");
}

export async function getMarks(request: Request, ctx: FacultyCtx) {
  // Internal assessment marks are real; exam-slot marks are still pending a backend aggregate.
  return djangoGet(request, "/api/v1/examinations/me/marks/");
}

export async function saveInternalMark(
  request: Request,
  ctx: FacultyCtx,
  payload: { studentId: string; subjectId: string; marks: number | null; maxMarks?: number },
) {
  const res = await djangoSend<{ mark: unknown }>(
    request, "/api/v1/examinations/me/internal-marks/", "POST", payload,
  );
  return (res as { mark?: unknown }).mark ?? res;
}

export async function saveExamMark(
  request: Request,
  ctx: FacultyCtx,
  payload: { examSlotId: string; studentId: string; marks: number | null; maxMarks?: number },
) {
  return djangoSend(
    request,
    `/api/v1/examinations/schedule-slots/${payload.examSlotId}/marks/`,
    "POST",
    {
      entries: [
        { studentId: payload.studentId, marks: payload.marks, isAbsent: payload.marks === null },
      ],
    },
  );
}

export async function getNotes(request: Request, ctx: FacultyCtx) {
  return djangoGet(request, "/api/v1/academics/faculty/study-materials/");
}


export async function getSyllabusProgress(request: Request, ctx: FacultyCtx) {
  return djangoGet(request, "/api/v1/academics/faculty/syllabus/");
}

export async function updateSyllabusProgress(
  request: Request,
  ctx: FacultyCtx,
  payload: { subjectId: string; batchId: string; completedUnitIds: string[] },
) {
  const res = await djangoSend<{ subject: unknown }>(
    request, "/api/v1/academics/faculty/syllabus/", "PATCH", payload,
  );
  return (res as { subject?: unknown }).subject ?? res;
}

export async function getSettings(request: Request, subdomain: string) {
  return djangoGet(request, "/api/v1/organizations/attendance-settings/");
}

export async function getPayslip(
  request: Request,
  ctx: FacultyCtx,
  month?: string,
) {
  return djangoGet(
    request,
    `/api/v1/hr/me/payslip/${month ? `?month=${encodeURIComponent(month)}` : ""}`,
  );
}

export async function getInvigilation(request: Request, ctx: FacultyCtx) {
  return djangoGet(request, "/api/v1/examinations/me/invigilation/");
}

export async function getTimetable(
  request: Request,
  ctx: FacultyCtx,
  params: { year?: number; month?: number; date?: string },
): Promise<FacultyTimetableData> {
  const qs = new URLSearchParams();
  if (params.year != null) qs.set("year", String(params.year));
  if (params.month != null) qs.set("month", String(params.month));
  if (params.date) qs.set("date", params.date);
  const suffix = qs.toString() ? `?${qs.toString()}` : "";
  return djangoGet<FacultyTimetableData>(request, `/api/v1/academics/faculty/timetable/${suffix}`);
}

export async function getQuizDrafts(request: Request, ctx: FacultyCtx) {
  return backendNotImplemented("AI quizzes");
}

export async function generateAiQuestionPaper(
  request: Request,
  ctx: FacultyCtx,
  input: unknown,
) {
  return backendNotImplemented("AI question paper");
}

export async function getLiveAttendance(request: Request, subdomain: string) {
  return djangoGet(request, "/api/v1/attendance/live/");
}

export async function getProfileForm(request: Request, ctx: FacultyCtx) {
  return djangoGet(request, "/api/v1/auth/me/faculty-profile/");
}

export async function updateProfileForm(
  request: Request,
  ctx: FacultyCtx,
  input: UpdateFacultyProfileInput,
) {
  return djangoSend(request, "/api/v1/auth/me/faculty-profile/", "PATCH", input);
}

export async function changeFacultyPassword(
  request: Request,
  ctx: FacultyCtx,
  input: { currentPassword: string; newPassword: string },
) {
  return djangoSend(request, "/api/v1/auth/me/faculty-profile/", "POST", input);
}
