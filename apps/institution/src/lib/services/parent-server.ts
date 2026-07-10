/**
 * Parent portal — Django backend calls.
 */

import type {
  ParentApplyLeaveInput,
  ParentFeesData,
  StudentFeePaymentRow,
  UpdateNotificationChannelsInput,
} from "@eduos/types";
import { backendNotImplemented } from "./data-source";
import { djangoGet, djangoSend } from "./django-client";
import { mapPaymentToRazorpayOrder, pickOpenInvoice, type DjangoInvoice } from "./fees-portal-mapper";

type ParentCtx = { subdomain: string; parentUserId: string };

export async function getDashboard(
  request: Request,
  ctx: ParentCtx,
  childId: string,
) {
  return backendNotImplemented("parent dashboard");
}

export async function listChildren(request: Request, ctx: ParentCtx) {
  return backendNotImplemented("parent children list");
}

export async function getFees(request: Request, ctx: ParentCtx, childId: string): Promise<ParentFeesData> {
  return djangoGet<ParentFeesData>(request, `/api/v1/fees/children/${childId}/fees/`);
}

async function fetchChildOpenInvoices(request: Request, childId: string) {
  return djangoGet<DjangoInvoice[]>(request, `/api/v1/fees/children/${childId}/dues/`);
}

export async function createFeePaymentOrder(
  request: Request,
  ctx: ParentCtx,
  childId: string,
  amount: number,
  invoiceId?: string,
) {
  const fees = await getFees(request, ctx, childId);
  const invoices = await fetchChildOpenInvoices(request, childId);
  const open = invoices.filter((i) => i.totalPaise - i.paidPaise > 0);
  const target =
    (invoiceId ? open.find((i) => i.id === invoiceId) : null) ?? pickOpenInvoice(open);
  if (!target) throw new Error("No open invoice to pay.");
  const balancePaise = Math.max(0, target.totalPaise - target.paidPaise);
  const amountPaise = Math.min(Math.round(amount * 100) || balancePaise, balancePaise);
  const payment = await djangoSend<{
    id: string;
    amountPaise: number;
    razorpayOrderId?: string;
  }>(request, `/api/v1/fees/children/${childId}/pay/`, "POST", {
    invoiceId: target.id,
    amountPaise,
    idempotencyKey: `parent-${ctx.parentUserId}-${childId}-${Date.now()}`,
  });
  return mapPaymentToRazorpayOrder(payment, fees.razorpayKeyId);
}

export async function captureFeePayment(
  request: Request,
  ctx: ParentCtx,
  childId: string,
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
  });
}

export async function payExamFee(
  request: Request,
  ctx: ParentCtx,
  childId: string,
  invoiceId: string,
) {
  const fees = await getFees(request, ctx, childId);
  const row = fees.examFees.rows.find((r) => r.invoiceId === invoiceId);
  if (!row || row.status !== "unpaid") throw new Error("Exam fee not payable.");
  const order = await createFeePaymentOrder(request, ctx, childId, row.amount, invoiceId);
  await captureFeePayment(request, ctx, childId, {
    orderId: order.orderId,
    paymentId: `pay_exam_${Date.now()}`,
    amount: order.amount,
    backendPaymentId: order.backendPaymentId,
  });
  return row;
}

export async function getLeave(request: Request, ctx: ParentCtx, childId: string) {
  return djangoGet(request, "/api/v1/attendance/leave/");
}

export async function applyLeave(
  request: Request,
  ctx: ParentCtx,
  childId: string,
  input: ParentApplyLeaveInput,
) {
  return djangoSend(request, "/api/v1/attendance/leave/", "POST", { ...input, studentId: childId });
}

export async function getAbsenceAlertPrefs(request: Request, ctx: ParentCtx, childId: string) {
  return backendNotImplemented("absence alert preferences");
}

export async function updateAbsenceAlertPrefs(
  request: Request,
  ctx: ParentCtx,
  childId: string,
  body: unknown,
) {
  return backendNotImplemented("absence alert preferences");
}

export async function getResults(request: Request, ctx: ParentCtx, childId: string) {
  return backendNotImplemented("parent results");
}

export async function getAssignments(request: Request, ctx: ParentCtx, childId: string) {
  return backendNotImplemented("parent assignments");
}

export async function getAnnouncements(
  request: Request,
  ctx: ParentCtx,
  childId: string,
) {
  return Promise.resolve({ announcements: [] });
}

export async function getGrievances(request: Request, ctx: ParentCtx, childId: string) {
  return Promise.resolve({ grievances: [] });
}

export async function getNotificationPreferences(request: Request, ctx: ParentCtx) {
  return djangoGet(request, "/api/v1/communications/notification-preferences/");
}

export async function updateNotificationPreferences(
  request: Request,
  ctx: ParentCtx,
  channels: UpdateNotificationChannelsInput,
) {
  return djangoSend(request, "/api/v1/communications/notification-preferences/", "PATCH", channels);
}
