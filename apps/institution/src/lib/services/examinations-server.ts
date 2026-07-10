/**
 * Admin examinations — Django boundary for school exam flow.
 */

import type {
  ExamFacultyOption,
  ExamMarkEntry,
  ExamResultStatus,
  ExamSlot,
  ExamSummary,
  ExaminationsData,
  InvigilationAssignment,
  ResultPublishConfirmation,
  ResultsAnalytics,
  ResultsPreflightResult,
  SaveExamSlotInput,
  SeatingPlan,
  SeatingPreflightResult,
  SeatingBulkError,
  SeatingGenerateMode,
  SeatingOrder,
  SeatingSession,
  StudentExamProfile,
} from "@eduos/types";
import { computeClashesFromSlots } from "@/components/admin/examinations/examUtils";
import { apiGet, apiSend } from "@/lib/api/client";
import { getAccessTokenFromRequest } from "@/lib/auth/cookies";
import { getApiBaseUrl } from "@/lib/config";
import { DjangoApiError } from "./django-client";
import { getTenantSubdomainFromRequest } from "@/lib/tenant";

interface DjangoExam {
  id: string;
  name: string;
  isPublished?: boolean;
  resultStatus?: string;
  marksDeadline?: string | null;
  examType?: string;
}

interface DjangoExamSlot {
  id: string;
  name: string;
  examId?: string;
  examName?: string;
  classSectionId: string;
  classLabel: string;
  subjectId: string;
  subjectName: string;
  date: string;
  startTime: string;
  endTime: string;
  roomId: string;
  roomName: string;
  status: "draft" | "published";
  marksEntryDeadlineAt?: string;
  requiredInvigilators?: number;
}

interface DjangoManagedUser {
  id: string;
  name: string;
  role: string;
}

function formatApiError(res: { message: string; errors?: Record<string, unknown> }): string {
  if (res.errors && Object.keys(res.errors).length > 0) {
    return Object.entries(res.errors)
      .flatMap(([field, value]) => {
        if (Array.isArray(value)) return value.map((v) => `${field}: ${String(v)}`);
        return `${field}: ${String(value)}`;
      })
      .join(" ");
  }
  return res.message;
}

function throwApiError(res: { message: string; status: number; errors?: Record<string, unknown> }): never {
  throw new DjangoApiError(friendlyApiError(formatApiError(res), res.status), res.status, res.errors);
}

function friendlyApiError(message: string, status: number): string {
  if (status === 401 || message === "Unauthorized") {
    return "Your session expired. Please refresh the page and sign in again.";
  }
  return message;
}


async function resolveExamSlot(
  request: Request,
  examSlotId: string,
): Promise<{ examId: string; slot: DjangoExamSlot } | null> {
  const examsRes = await apiGet<{ exams: DjangoExam[] }>(request, "/examinations/exams/");
  if (!examsRes.ok) throw new DjangoApiError(examsRes.message, examsRes.status);

  for (const exam of examsRes.data.exams ?? []) {
    const slotsRes = await apiGet<{ slots: DjangoExamSlot[] }>(
      request,
      `/examinations/exams/${exam.id}/schedule/`,
    );
    if (!slotsRes.ok) continue;
    const slot = (slotsRes.data.slots ?? []).find((s) => s.id === examSlotId);
    if (slot) return { examId: exam.id, slot };
  }
  return null;
}

async function resolveExamIdForSlot(
  request: Request,
  examSlotId: string,
): Promise<string | null> {
  const resolved = await resolveExamSlot(request, examSlotId);
  return resolved?.examId ?? null;
}

async function ensureBatchRegistered(
  request: Request,
  examId: string,
  classSectionId: string,
): Promise<void> {
  const res = await apiSend(
    request,
    `/examinations/exams/${examId}/register/`,
    "POST",
    { classSectionId },
  );
  if (!res.ok) throwApiError(res);
}

async function resolveDefaultExamId(request: Request): Promise<string> {
  const examsRes = await apiGet<{ exams: DjangoExam[] }>(request, "/examinations/exams/");
  if (!examsRes.ok) throw new DjangoApiError(examsRes.message, examsRes.status);
  const existing = examsRes.data.exams?.[0];
  if (existing) return existing.id;

  const academicsRes = await apiGet<{
    academicYears?: { id: string; isCurrent?: boolean; periods?: { id: string }[] }[];
  }>(request, "/academics/admin-overview/");
  if (!academicsRes.ok) throw new DjangoApiError("Could not resolve academic period for exam.", 400);
  const year =
    academicsRes.data.academicYears?.find((y) => y.isCurrent) ??
    academicsRes.data.academicYears?.[0];
  const periodId = year?.periods?.[0]?.id;
  if (!periodId) throw new DjangoApiError("No academic period found.", 400);

  const createRes = await apiSend<{ exam: DjangoExam }>(
    request,
    "/examinations/exams/",
    "POST",
    {
      name: "Term examinations",
      examType: "final",
      academicPeriodId: periodId,
      examFeePaise: 0,
    },
  );
  if (!createRes.ok) throw new DjangoApiError(createRes.message, createRes.status);
  return createRes.data.exam.id;
}

async function fetchInvigilation(request: Request): Promise<InvigilationAssignment[]> {
  const examsRes = await apiGet<{ exams: DjangoExam[] }>(request, "/examinations/exams/");
  if (!examsRes.ok) throw new DjangoApiError(examsRes.message, examsRes.status);

  const assignments: InvigilationAssignment[] = [];
  for (const exam of examsRes.data.exams ?? []) {
    const invRes = await apiGet<{ invigilation: InvigilationAssignment[] }>(
      request,
      `/examinations/exams/${exam.id}/invigilators/`,
    );
    if (invRes.ok) assignments.push(...(invRes.data.invigilation ?? []));
  }
  return assignments;
}

async function fetchFacultyOptions(request: Request): Promise<ExamFacultyOption[]> {
  // /auth/users/management/ is now server-paginated (StandardPagination, max
  // page_size 100) — filter by role server-side and take the max page size
  // instead of the old unbounded fetch-everything-then-filter-client-side.
  const res = await apiGet<{ users: { results: DjangoManagedUser[] } }>(
    request,
    "/auth/users/management/?role=faculty&page_size=100",
  );
  if (!res.ok) return [];
  return (res.data.users?.results ?? []).map((u) => ({ userId: u.id, name: u.name }));
}

async function fetchExaminationsFromDjango(
  request: Request,
  subdomain: string,
): Promise<ExaminationsData> {
  const tenantRes = await apiGet<{ institution_type?: string }>(
    request,
    `/organizations/tenant-config/?subdomain=${encodeURIComponent(subdomain)}`,
  );
  const institutionType =
    tenantRes.ok && tenantRes.data.institution_type === "college" ? "college" : "school";

  const academicsRes = await apiGet<{
    classSections?: ExaminationsData["classSections"];
    rooms?: { id: string; name: string }[];
    subjects?: { id: string; name: string }[];
  }>(request, "/academics/admin-overview/");
  const classSections = academicsRes.ok ? (academicsRes.data.classSections ?? []) : [];
  const rooms =
    academicsRes.ok && academicsRes.data.rooms?.length
      ? academicsRes.data.rooms.map((r, idx) => ({
          id: r.id,
          name: r.name,
          capacity: idx === 0 ? 30 : 24,
        }))
      : [];
  const subjects =
    academicsRes.ok && academicsRes.data.subjects?.length
      ? academicsRes.data.subjects.map((s) => ({ id: s.id, name: s.name }))
      : [];

  // One batched Django call replaces what used to be a per-exam loop (schedule,
  // students-per-class-section, results-status, invigilators, seating fetched
  // once per exam — an N×M chain of sequential round trips). The Django view
  // (apps/examinations/views/admin_overview.py) also scopes exams to the
  // current academic year, so this never grows unbounded across the school's
  // history the way the old unscoped `/examinations/exams/` list did.
  const overviewRes = await apiGet<{
    exams: ExamSummary[];
    slots: DjangoExamSlot[];
    students: StudentExamProfile[];
    seatingPlans: SeatingPlan[];
    invigilation: InvigilationAssignment[];
    resultStatusByExam: Record<string, ExamResultStatus>;
    publishedResults: ExaminationsData["publishedResults"];
  }>(request, "/examinations/admin-overview/");
  if (!overviewRes.ok) {
    throw new DjangoApiError(friendlyApiError(overviewRes.message, overviewRes.status), overviewRes.status);
  }
  const {
    exams,
    slots,
    students,
    seatingPlans,
    invigilation,
    resultStatusByExam,
    publishedResults,
  } = overviewRes.data;

  const faculty = await fetchFacultyOptions(request);
  const classes = classSections?.map((c) => ({ id: c.id, label: c.label })) ?? [];

  return {
    institutionType,
    exams,
    slots: slots as ExamSlot[],
    clashes: computeClashesFromSlots(slots as ExamSlot[]),
    rooms,
    classes,
    classSections,
    subjects,
    faculty,
    students,
    seatingPlans,
    invigilation,
    resultsConfig: { absentAsNullEnabled: false, excludeAbsentFromGpa: false },
    graceMarks: { enabled: false, maxPerSubject: 0, passPercent: 35 },
    resultStatusByExam,
    markEntries: [],
    publishedResults,
    arrears: [],
    gpaMetrics: [],
    warningsByExam: {},
  };
}

export async function getExaminationsData(
  request: Request,
  subdomain: string,
): Promise<ExaminationsData> {
  return fetchExaminationsFromDjango(request, subdomain);
}

export async function saveSlot(
  request: Request,
  subdomain: string,
  input: SaveExamSlotInput,
): Promise<{ slot: ExamSlot; clashes?: unknown[]; warnings?: unknown[] }> {
  const examId = input.id
    ? await resolveExamIdForSlot(request, input.id)
    : await resolveDefaultExamId(request);
  if (!examId) throw new DjangoApiError("Exam not found.", 404);

  const body = {
    name: input.name,
    classSectionId: input.classSectionId,
    subjectId: input.subjectId,
    date: input.date,
    startTime: input.startTime,
    endTime: input.endTime,
    roomId: input.roomId,
    status: input.status,
    ...(input.requiredInvigilators != null
      ? { requiredInvigilators: input.requiredInvigilators }
      : {}),
  };

  if (input.id) {
    const res = await apiSend<{ slot: DjangoExamSlot; warnings?: unknown[] }>(
      request,
      `/examinations/exams/${examId}/schedule/${input.id}/`,
      "PATCH",
      body,
    );
    if (!res.ok) throw new DjangoApiError(res.message, res.status);
    return { slot: res.data.slot as ExamSlot, warnings: res.data.warnings };
  }

  const res = await apiSend<{
    slot?: DjangoExamSlot;
    warnings?: unknown[];
    requiresOverride?: boolean;
  }>(request, `/examinations/exams/${examId}/schedule/`, "POST", body);
  if (!res.ok) throw new DjangoApiError(res.message, res.status);
  if (res.data.requiresOverride) {
    return { slot: res.data.slot as ExamSlot, warnings: res.data.warnings };
  }
  return { slot: res.data.slot as ExamSlot, warnings: res.data.warnings };
}

export async function deleteSlot(request: Request, slotId: string): Promise<void> {
  const examId = await resolveExamIdForSlot(request, slotId);
  if (!examId) throw new DjangoApiError("Exam slot not found.", 404);
  const res = await apiSend(request, `/examinations/exams/${examId}/schedule/${slotId}/`, "DELETE");
  if (!res.ok) throw new DjangoApiError(res.message, res.status);
}

export async function saveMarks(
  request: Request,
  subdomain: string,
  payload: {
    examSlotId: string;
    studentId: string;
    marks: number | null;
    override?: boolean;
    overrideReason?: string;
  },
  options: { actorId: string; actorName: string; ipAddress?: string },
): Promise<ExamMarkEntry[]> {
  const res = await apiSend<{ entries: ExamMarkEntry[] }>(
    request,
    `/examinations/schedule-slots/${payload.examSlotId}/marks/`,
    "POST",
    {
      entries: [
        {
          studentId: payload.studentId,
          marks: payload.marks,
          isAbsent: payload.marks == null,
        },
      ],
      override: payload.override ?? false,
      overrideReason: payload.overrideReason ?? "",
    },
  );
  if (!res.ok) throw new DjangoApiError(friendlyApiError(formatApiError(res), res.status), res.status, res.errors);
  return res.data.entries;
}

interface RosterRow {
  studentId: string;
  studentName: string;
  classLabel: string;
  marks?: number | null;
  isAbsent?: boolean;
  marksStatus?: string;
}

async function rosterToMarkEntries(
  request: Request,
  examSlotId: string,
  roster: RosterRow[],
): Promise<ExamMarkEntry[]> {
  const resolved = await resolveExamSlot(request, examSlotId);
  const subjectName = resolved?.slot.subjectName ?? "";
  const maxMarks = 100;
  const now = new Date().toISOString();
  return roster.map((r) => ({
    examSlotId,
    studentId: r.studentId,
    studentName: r.studentName,
    classLabel: r.classLabel,
    subjectName,
    marks: r.marks ?? null,
    maxMarks,
    updatedAt: now,
    marksStatus: (r.marksStatus as ExamMarkEntry["marksStatus"]) ?? "draft",
  }));
}

export async function loadSlotMarks(
  request: Request,
  subdomain: string,
  examSlotId: string,
): Promise<ExamMarkEntry[]> {
  const rosterRes = await apiGet<{ roster: RosterRow[] }>(
    request,
    `/examinations/schedule-slots/${examSlotId}/roster/`,
  );
  if (rosterRes.ok && (rosterRes.data.roster?.length ?? 0) > 0) {
    return rosterToMarkEntries(request, examSlotId, rosterRes.data.roster);
  }
  const res = await apiGet<{ entries: ExamMarkEntry[] }>(
    request,
    `/examinations/schedule-slots/${examSlotId}/marks/`,
  );
  if (!res.ok) {
    throw new DjangoApiError(friendlyApiError(res.message, res.status), res.status);
  }
  return (res.data.entries ?? []).map((e) => ({ ...e, examSlotId }));
}

export async function submitSlotMarks(
  request: Request,
  examSlotId: string,
  options?: { override?: boolean; overrideReason?: string },
): Promise<{ submittedCount: number; entries: ExamMarkEntry[] }> {
  const res = await apiSend<{ submittedCount: number }>(
    request,
    `/examinations/schedule-slots/${examSlotId}/marks/submit/`,
    "POST",
    {
      override: options?.override ?? false,
      overrideReason: options?.overrideReason ?? "",
    },
  );
  if (!res.ok) {
    throw new DjangoApiError(friendlyApiError(formatApiError(res), res.status), res.status, res.errors);
  }
  const subdomain = getTenantSubdomainFromRequest(request);
  const entries = await loadSlotMarks(request, subdomain, examSlotId);
  return { submittedCount: res.data.submittedCount, entries };
}

export async function preflightResults(
  request: Request,
  examSlotId: string,
): Promise<ResultsPreflightResult> {
  const examId = await resolveExamIdForSlot(request, examSlotId);
  if (!examId) throw new DjangoApiError("Exam slot not found.", 404);
  const res = await apiSend<{ preflight: ResultsPreflightResult }>(
    request,
    `/examinations/exams/${examId}/results/preflight/`,
    "POST",
    {},
  );
  if (!res.ok) throwApiError(res);
  return res.data.preflight;
}

async function resolveExamIdForSlots(
  request: Request,
  examSlotIds: string[],
): Promise<string | null> {
  if (!examSlotIds.length) return resolveDefaultExamId(request);
  return resolveExamIdForSlot(request, examSlotIds[0]!);
}

export async function preflightSeating(
  request: Request,
  examSlotIds: string[],
): Promise<SeatingPreflightResult> {
  const examId = await resolveExamIdForSlots(request, examSlotIds);
  if (!examId) throw new DjangoApiError("Exam not found.", 404);
  const res = await apiSend<{ preflight: SeatingPreflightResult }>(
    request,
    `/examinations/exams/${examId}/seating/preflight/`,
    "POST",
    { examSlotIds: examSlotIds.length ? examSlotIds : undefined },
  );
  if (!res.ok) throwApiError(res);
  return res.data.preflight;
}

export async function generateSeatingBulk(
  request: Request,
  subdomain: string,
  payload: {
    examSlotIds?: string[];
    mode?: SeatingGenerateMode;
    seatingOrder?: SeatingOrder;
    roomIds?: string[];
    hallRoomId?: string;
  },
): Promise<{ seatingPlans: SeatingPlan[]; errors: SeatingBulkError[] }> {
  const examSlotIds = payload.examSlotIds ?? [];
  const examId = await resolveExamIdForSlots(request, examSlotIds);
  if (!examId) throw new DjangoApiError("Exam not found.", 404);

  if (!examSlotIds.length) {
    const slotsRes = await apiGet<{ slots: DjangoExamSlot[] }>(
      request,
      `/examinations/exams/${examId}/schedule/`,
    );
    if (slotsRes.ok) {
      for (const slot of slotsRes.data.slots ?? []) {
        await ensureBatchRegistered(request, examId, slot.classSectionId);
      }
    }
  } else {
    for (const slotId of examSlotIds) {
      const resolved = await resolveExamSlot(request, slotId);
      if (resolved) {
        await ensureBatchRegistered(request, examId, resolved.slot.classSectionId);
      }
    }
  }

  if (payload.mode === "combined" && payload.hallRoomId && examSlotIds.length) {
    const sessionRes = await apiSend(
      request,
      `/examinations/exams/${examId}/seating-sessions/`,
      "POST",
      { hallRoomId: payload.hallRoomId, examSlotIds, name: "Combined hall" },
    );
    if (!sessionRes.ok) throwApiError(sessionRes);
  }

  const res = await apiSend<{
    seatingPlans: SeatingPlan[];
    errors: SeatingBulkError[];
  }>(request, `/examinations/exams/${examId}/seating/generate/`, "POST", {
    examSlotIds: examSlotIds.length ? examSlotIds : undefined,
    mode: payload.mode ?? "per_slot",
    seatingOrder: payload.seatingOrder ?? "random",
    roomIds:
      payload.mode === "combined" && payload.hallRoomId
        ? [payload.hallRoomId, ...(payload.roomIds ?? [])]
        : payload.roomIds,
  });
  if (!res.ok) throwApiError(res);
  return {
    seatingPlans: res.data.seatingPlans ?? [],
    errors: res.data.errors ?? [],
  };
}

/** Server-generated CSV for an arbitrary set of exam slots (may span multiple exams —
 * the admin Seating tab filters by date/subject/grade across the whole branch). */
export async function exportSeatingCsv(request: Request, examSlotIds: string[]): Promise<string> {
  const accessToken = getAccessTokenFromRequest(request);
  const qs = encodeURIComponent(examSlotIds.join(","));
  const res = await fetch(
    `${getApiBaseUrl()}/api/v1/examinations/seating/export/?examSlotIds=${qs}`,
    { headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {} },
  );
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const msg =
      body && typeof body === "object" && "message" in body
        ? String(body.message)
        : `Export failed (${res.status})`;
    throw new DjangoApiError(friendlyApiError(msg, res.status), res.status);
  }
  return res.text();
}

export async function generateSeating(
  request: Request,
  subdomain: string,
  examSlotId: string,
): Promise<SeatingPlan> {
  const result = await generateSeatingBulk(request, subdomain, {
    examSlotIds: [examSlotId],
    seatingOrder: "random",
  });
  const plan = result.seatingPlans.find((p) => p.examSlotId === examSlotId);
  if (!plan) {
    const err = result.errors[0];
    throw new DjangoApiError(
      err ? JSON.stringify(err.errors) : "Seating plan not returned.",
      400,
    );
  }
  return plan;
}

export async function startPublish(
  request: Request,
  subdomain: string,
  examSlotId: string,
): Promise<ResultPublishConfirmation> {
  const examId = await resolveExamIdForSlot(request, examSlotId);
  if (!examId) throw new DjangoApiError("Exam slot not found.", 404);
  const res = await apiSend<{ confirmation: ResultPublishConfirmation }>(
    request,
    `/examinations/exams/${examId}/results/compute/`,
    "POST",
    {},
  );
  if (!res.ok) throw new DjangoApiError(friendlyApiError(res.message, res.status), res.status);
  const c = res.data.confirmation as ResultPublishConfirmation & { confirmToken?: string };
  const token = c.token ?? c.confirmToken ?? "";
  const examsRes = await apiGet<{ exams: DjangoExam[] }>(request, "/examinations/exams/");
  const examName = examsRes.ok
    ? (examsRes.data.exams?.find((e) => e.id === examId)?.name ?? "")
    : "";
  return {
    token,
    createdAt: c.createdAt,
    expiresAt: c.expiresAt,
    summary: {
      ...c.summary,
      examSlotId,
      examId: c.summary.examId ?? examId,
      examName: c.summary.examName ?? examName,
    },
  };
}

export async function confirmPublish(
  request: Request,
  subdomain: string,
  payload: { examSlotId: string; token: string; note?: string; publishedByUserId: string },
): Promise<unknown> {
  const examId = await resolveExamIdForSlot(request, payload.examSlotId);
  if (!examId) throw new DjangoApiError("Exam slot not found.", 404);
  const res = await apiSend(
    request,
    `/examinations/exams/${examId}/results/publish/`,
    "POST",
    { confirmToken: payload.token, note: payload.note ?? "" },
  );
  if (!res.ok) throw new DjangoApiError(res.message, res.status);
  return res.data;
}

export async function reviseResult(
  request: Request,
  subdomain: string,
  payload: { examSlotId: string; note: string; revisedByUserId: string },
): Promise<unknown> {
  const examId = await resolveExamIdForSlot(request, payload.examSlotId);
  if (!examId) throw new DjangoApiError("Exam slot not found.", 404);
  const res = await apiSend(request, `/examinations/exams/${examId}/results/revise/`, "POST", {
    note: payload.note,
  });
  if (!res.ok) throw new DjangoApiError(res.message, res.status);
  return res.data;
}

export async function getAnalytics(
  request: Request,
  subdomain: string,
  examSlotId: string,
): Promise<ResultsAnalytics> {
  const examId = await resolveExamIdForSlot(request, examSlotId);
  if (!examId) throw new DjangoApiError("Exam slot not found.", 404);
  const res = await apiGet<{ analytics: ResultsAnalytics }>(
    request,
    `/examinations/exams/${examId}/analytics/`,
  );
  if (!res.ok) throw new DjangoApiError(res.message, res.status);
  return { ...res.data.analytics, examSlotId };
}

export async function exportReportCardPdf(
  request: Request,
  subdomain: string,
  studentId: string,
  examSlotId?: string,
): Promise<{ content: string; fileName: string; canDownload: boolean; blockedReason?: string }> {
  let examId: string | null = null;
  if (examSlotId) {
    examId = await resolveExamIdForSlot(request, examSlotId);
  } else {
    examId = await resolveDefaultExamId(request);
  }
  if (!examId) throw new DjangoApiError("Exam not found.", 404);
  const res = await apiGet<{
    reportCard: {
      canDownload: boolean;
      blockedReason?: string;
      fileName: string;
      content: string;
    };
  }>(request, `/examinations/exams/${examId}/report-card/?studentId=${encodeURIComponent(studentId)}`);
  if (!res.ok) throw new DjangoApiError(friendlyApiError(res.message, res.status), res.status);
  const card = res.data.reportCard;
  return {
    canDownload: card.canDownload,
    blockedReason: card.blockedReason,
    fileName: card.fileName,
    content: card.content,
  };
}

export async function autoAssignInvigilators(
  request: Request,
): Promise<{ invigilation: InvigilationAssignment[] }> {
  const examsRes = await apiGet<{ exams: DjangoExam[] }>(request, "/examinations/exams/");
  if (!examsRes.ok) throw new DjangoApiError(examsRes.message, examsRes.status);

  const invigilation: InvigilationAssignment[] = [];
  for (const exam of examsRes.data.exams ?? []) {
    const res = await apiSend<{ invigilation: InvigilationAssignment[] }>(
      request,
      `/examinations/exams/${exam.id}/invigilators/`,
      "POST",
      { autoAssign: true },
    );
    if (!res.ok) throw new DjangoApiError(res.message, res.status);
    invigilation.push(...(res.data.invigilation ?? []));
  }
  return { invigilation };
}

export async function manageInvigilator(
  request: Request,
  payload: {
    examSlotId: string;
    facultyId: string;
    mode: "add" | "replace" | "remove";
    replaceFacultyId?: string;
  },
): Promise<{ invigilation: InvigilationAssignment[] }> {
  const examId = await resolveExamIdForSlot(request, payload.examSlotId);
  if (!examId) throw new DjangoApiError("Exam slot not found.", 404);
  const res = await apiSend<{ invigilation: InvigilationAssignment[] }>(
    request,
    `/examinations/exams/${examId}/invigilators/`,
    "POST",
    {
      examSlotId: payload.examSlotId,
      facultyId: payload.facultyId,
      mode: payload.mode,
      ...(payload.replaceFacultyId ? { replaceFacultyId: payload.replaceFacultyId } : {}),
    },
  );
  if (!res.ok) throwApiError(res);
  const invigilation = await fetchInvigilation(request);
  return { invigilation };
}

export async function updateRequiredInvigilators(
  request: Request,
  payload: { examSlotId: string; requiredInvigilators: number },
): Promise<{ slot: ExamSlot }> {
  const examId = await resolveExamIdForSlot(request, payload.examSlotId);
  if (!examId) throw new DjangoApiError("Exam slot not found.", 404);
  const res = await apiSend<{ slot: DjangoExamSlot }>(
    request,
    `/examinations/exams/${examId}/schedule/${payload.examSlotId}/`,
    "PATCH",
    { requiredInvigilators: payload.requiredInvigilators },
  );
  if (!res.ok) throwApiError(res);
  return { slot: res.data.slot as ExamSlot };
}

export async function exportClassResultsCsv(
  request: Request,
  examId: string,
  classSectionId: string,
): Promise<string> {
  const accessToken = getAccessTokenFromRequest(request);
  const res = await fetch(
    `${getApiBaseUrl()}/api/v1/examinations/exams/${examId}/results/export/?classSectionId=${encodeURIComponent(classSectionId)}`,
    { headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {} },
  );
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const msg =
      body && typeof body === "object" && "message" in body
        ? String(body.message)
        : `Export failed (${res.status})`;
    throw new DjangoApiError(friendlyApiError(msg, res.status), res.status);
  }
  return res.text();
}

/** @deprecated Use manageInvigilator with mode add */
export async function assignInvigilator(
  request: Request,
  payload: { examSlotId: string; facultyId: string },
): Promise<{ invigilation: InvigilationAssignment[] }> {
  return manageInvigilator(request, { ...payload, mode: "add" });
}
