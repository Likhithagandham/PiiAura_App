/**
 * Student portal — Django backend service.
 */

import type {
  StudentApplyLeaveInput,
  StudentDashboardData,
  StudentFeesData,
  StudentMaterialsData,
  StudentResultsData,
  StudentAssignmentsData,
  StudentRazorpayOrder,
  StudentFeePaymentRow,
  UpdateStudentProfileInput,
  UpdateNotificationChannelsInput,
} from "@eduos/types";
import { backendNotImplemented } from "./data-source";
import { djangoGet, djangoSend } from "./django-client";
import { mapPaymentToRazorpayOrder, pickOpenInvoice, type DjangoInvoice } from "./fees-portal-mapper";

type StudentCtx = { subdomain: string; userId: string; rollNumber: string | null; studentName: string };

export async function getDashboard(
  request: Request,
  ctx: StudentCtx,
): Promise<StudentDashboardData> {
  return djangoGet<StudentDashboardData>(request, "/api/v1/auth/me/dashboard/");
}

export async function getFees(request: Request, ctx: StudentCtx): Promise<StudentFeesData> {
  return djangoGet<StudentFeesData>(request, "/api/v1/fees/me/fees/");
}

export async function getMaterials(
  request: Request,
  ctx: StudentCtx,
): Promise<StudentMaterialsData> {
  return djangoGet<StudentMaterialsData>(request, "/api/v1/academics/me/study-materials/");
}

export async function createFeePaymentOrder(
  request: Request,
  ctx: StudentCtx,
  amount: number,
  invoiceId?: string,
) {
  const fees = await djangoGet<StudentFeesData>(request, "/api/v1/fees/me/fees/");
  const invoices = await djangoGet<DjangoInvoice[]>(request, "/api/v1/fees/me/dues/");
  const open = invoices.filter((i) => i.totalPaise - i.paidPaise > 0);
  const target =
    (invoiceId ? open.find((i) => i.id === invoiceId) : null) ?? pickOpenInvoice(open);
  if (!target) throw new Error("No open invoice to pay.");
  const balancePaise = Math.max(0, target.totalPaise - target.paidPaise);
  const amountPaise = Math.min(Math.round(amount * 100) || balancePaise, balancePaise);
  if (amountPaise <= 0) throw new Error("No balance due.");
  const payment = await djangoSend<{
    id: string;
    amountPaise: number;
    razorpayOrderId?: string;
  }>(request, "/api/v1/fees/orders/", "POST", {
    invoiceId: target.id,
    amountPaise,
    idempotencyKey: `student-${ctx.userId}-${Date.now()}`,
  });
  return mapPaymentToRazorpayOrder(payment, fees.razorpayKeyId);
}

export async function captureFeePayment(
  request: Request,
  ctx: StudentCtx,
  input: {
    orderId: string;
    paymentId: string;
    amount: number;
    backendPaymentId?: string;
  },
) {
  return djangoSend<StudentFeePaymentRow>(request, "/api/v1/fees/payments/verify/", "POST", {
    paymentId: input.backendPaymentId ?? input.paymentId,
    razorpayPaymentId: input.paymentId,
    razorpayOrderId: input.orderId,
    razorpaySignature: "sandbox_sig_placeholder",
  });
}

export async function getResults(request: Request, ctx: StudentCtx): Promise<StudentResultsData> {
  const data = await djangoGet<{ results: StudentResultsData }>(request, "/api/v1/examinations/me/results/");
  return data.results ?? (data as unknown as StudentResultsData);
}

export async function getExams(request: Request, ctx: StudentCtx) {
  return djangoGet(request, "/api/v1/examinations/me/exams/");
}

export async function getAssignments(request: Request, ctx: StudentCtx): Promise<StudentAssignmentsData> {
  const data = await djangoGet<{ hub: StudentAssignmentsData }>(
    request,
    "/api/v1/examinations/me/assignments/",
  );
  return data.hub ?? (data as unknown as StudentAssignmentsData);
}

export async function getProfile(request: Request, ctx: StudentCtx) {
  return djangoGet(request, "/api/v1/auth/me/");
}

export async function updateProfile(
  request: Request,
  ctx: StudentCtx,
  input: UpdateStudentProfileInput,
) {
  return backendNotImplemented("student profile update");
}

export async function getProfileForm(request: Request, ctx: StudentCtx) {
  return djangoGet(request, "/api/v1/auth/me/student-profile/");
}

export async function updateProfileForm(
  request: Request,
  ctx: StudentCtx,
  input: UpdateStudentProfileInput,
) {
  return djangoSend(request, "/api/v1/auth/me/student-profile/", "PATCH", input);
}

export async function changeStudentPassword(
  request: Request,
  ctx: StudentCtx,
  input: { currentPassword: string; newPassword: string },
) {
  return djangoSend(request, "/api/v1/auth/me/student-profile/", "POST", input);
}

export async function getLeave(request: Request, ctx: StudentCtx) {
  return djangoGet(request, "/api/v1/attendance/me/leave/");
}

export async function applyLeave(
  request: Request,
  ctx: StudentCtx,
  input: StudentApplyLeaveInput,
) {
  const res = await djangoSend<{ leave: unknown }>(
    request, "/api/v1/attendance/me/leave/", "POST", input,
  );
  return (res as { leave?: unknown }).leave ?? res;
}

export async function getPerformance(request: Request, ctx: StudentCtx) {
  return backendNotImplemented("performance");
}

export async function getGrievances(request: Request, ctx: StudentCtx) {
  return djangoGet(request, "/api/v1/grievances/me/");
}

export async function createGrievance(request: Request, ctx: StudentCtx, input: unknown) {
  return djangoSend(request, "/api/v1/grievances/me/", "POST", input);
}

export async function listAnnouncements(request: Request, subdomain: string) {
  const data = await djangoGet<{ announcements: unknown[] }>(
    request, "/api/v1/communications/announcements/me/",
  );
  return data.announcements ?? [];
}

export async function getNotificationPreferences(request: Request, ctx: StudentCtx) {
  return djangoGet(request, "/api/v1/communications/notification-preferences/");
}

export async function updateNotificationPreferences(
  request: Request,
  ctx: StudentCtx,
  channels: UpdateNotificationChannelsInput,
) {
  return djangoSend(request, "/api/v1/communications/notification-preferences/", "PATCH", channels);
}

export async function listPracticeQuizzes(request: Request, subdomain: string) {
  return Promise.resolve([]);
}

export async function getPracticeQuiz(request: Request, subdomain: string, quizId: string) {
  return backendNotImplemented("practice quizzes");
}

export async function submitPracticeQuiz(request: Request, subdomain: string, quizId: string, answers: unknown) {
  return backendNotImplemented("practice quizzes");
}

export async function getSessions(request: Request, userId: string, accessToken: string) {
  const raw = await djangoGet<{ sessions: Array<{ id: string; device_info: string; ip_address: string | null; created_at: string; expires_at: string }> }>(request, "/api/v1/auth/sessions/");
  return {
    concurrentSessionsAllowed: true,
    sessions: raw.sessions.map((s) => ({
      sessionId: s.id,
      deviceLabel: s.device_info || "Unknown device",
      deviceType: "web",
      lastActiveAt: s.created_at,
      expiresAt: s.expires_at,
      isCurrent: false,
    })),
  };
}

export async function revokeSession(
  request: Request,
  userId: string,
  accessToken: string,
  sessionId: string,
) {
  await djangoSend(request, `/api/v1/auth/sessions/${encodeURIComponent(sessionId)}/`, "DELETE");
}

export async function getElectives(request: Request, ctx: StudentCtx) {
  return Promise.resolve({ electives: [] });
}

export async function payExamFee(
  request: Request,
  ctx: StudentCtx,
  invoiceId: string,
) {
  const fees = await djangoGet<StudentFeesData>(request, "/api/v1/fees/me/fees/");
  const row = fees.examFees.rows.find((r) => r.invoiceId === invoiceId);
  if (!row || row.status !== "unpaid") throw new Error("Exam fee not payable.");
  const order = await createFeePaymentOrder(request, ctx, row.amount, invoiceId);
  await captureFeePayment(request, ctx, {
    orderId: order.orderId,
    paymentId: `pay_exam_${Date.now()}`,
    amount: order.amount,
    backendPaymentId: order.backendPaymentId,
  });
  return row;
}

export async function getFeeReceipt(request: Request, ctx: StudentCtx, receiptId: string) {
  return djangoGet(request, `/api/v1/fees/me/receipts/?id=${encodeURIComponent(receiptId)}`);
}
