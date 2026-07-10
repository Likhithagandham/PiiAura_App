/**
 * Fees service — Django backend calls.
 */

import type {
  FeePayment,
  FeePaymentsSummary,
  FeesData,
  PaginatedResult,
  ReviewConcessionInput,
  ReviewRefundInput,
  SaveConcessionRuleInput,
  SaveFeeStructureInput,
} from "@eduos/types";
import { djangoGet, djangoSend } from "./django-client";

export async function getFeesData(
  request: Request,
  subdomain: string,
): Promise<FeesData> {
  return djangoGet<FeesData>(request, "/api/v1/fees/admin-overview/");
}

export interface FeesPaymentsFilters {
  page?: string | null;
  pageSize?: string | null;
  status?: string | null;
  studentId?: string | null;
  search?: string | null;
  dateFrom?: string | null;
  dateTo?: string | null;
}

function paymentsQuery(filters?: FeesPaymentsFilters): string {
  const qs = new URLSearchParams();
  if (filters?.page) qs.set("page", filters.page);
  if (filters?.pageSize) qs.set("page_size", filters.pageSize);
  if (filters?.status) qs.set("status", filters.status);
  if (filters?.studentId) qs.set("studentId", filters.studentId);
  if (filters?.search) qs.set("search", filters.search);
  if (filters?.dateFrom) qs.set("date_from", filters.dateFrom);
  if (filters?.dateTo) qs.set("date_to", filters.dateTo);
  return qs.toString();
}

export async function getFeesPaymentsList(
  request: Request,
  filters?: FeesPaymentsFilters,
): Promise<PaginatedResult<FeePayment>> {
  const q = paymentsQuery(filters);
  return djangoGet<PaginatedResult<FeePayment>>(
    request,
    `/api/v1/fees/admin-payments/${q ? `?${q}` : ""}`,
  );
}

export async function getFeesPaymentsSummary(
  request: Request,
  filters?: FeesPaymentsFilters,
): Promise<FeePaymentsSummary> {
  const q = paymentsQuery(filters);
  return djangoGet<FeePaymentsSummary>(
    request,
    `/api/v1/fees/admin-payments/summary/${q ? `?${q}` : ""}`,
  );
}

function structureToBackendComponents(input: SaveFeeStructureInput) {
  const kind = input.components[0]?.kind ?? "tuition";
  const baseName = input.components[0]?.name ?? "Tuition";
  return input.installments.map((inst, idx) => ({
    kind,
    label: inst.label.trim() || `${baseName} — ${inst.label || `Inst ${idx + 1}`}`,
    amount_paise: Math.round((Number(inst.amount) || 0) * 100),
    due_date: inst.dueDate,
    installment_no: idx + 1,
  }));
}

export async function saveFeeStructure(request: Request, input: SaveFeeStructureInput) {
  const components = structureToBackendComponents(input);
  const body = {
    name: input.name.trim(),
    batch: input.batchId ?? null,
    academicYear: input.academicYearId,
    components,
  };
  if (input.id) {
    return djangoSend(request, `/api/v1/fees/structures/${input.id}/`, "PATCH", body);
  }
  return djangoSend(request, "/api/v1/fees/structures/", "POST", body);
}

export async function generateInvoices(
  request: Request,
  input: { batchId: string; feeStructureId: string; academicYearId: string },
) {
  return djangoSend(request, "/api/v1/fees/invoices/generate/", "POST", {
    batchId: input.batchId,
    feeStructureId: input.feeStructureId,
    academicYearId: input.academicYearId,
  });
}

export function saveConcessionRule(request: Request, input: SaveConcessionRuleInput) {
  const body = {
    name: input.name.trim(),
    percent: input.percentOff,
    criteria: { description: input.description },
  };
  if (input.id) {
    return djangoSend(request, `/api/v1/fees/concession-rules/${input.id}/`, "PATCH", body);
  }
  return djangoSend(request, "/api/v1/fees/concession-rules/", "POST", body);
}

export function reviewConcession(request: Request, input: ReviewConcessionInput) {
  return djangoSend(
    request,
    `/api/v1/fees/concession-requests/${input.requestId}/`,
    "PATCH",
    { status: input.approve ? "approved" : "rejected", note: input.note ?? "" },
  );
}

export function approveRefund(request: Request, input: ReviewRefundInput) {
  return djangoSend(
    request,
    `/api/v1/fees/refunds/${input.refundId}/`,
    "PATCH",
    { status: "approved" },
  );
}

export function rejectRefund(request: Request, input: ReviewRefundInput) {
  return djangoSend(
    request,
    `/api/v1/fees/refunds/${input.refundId}/`,
    "PATCH",
    { status: "rejected" },
  );
}

export function requestRefund(
  request: Request,
  input: { paymentId: string; amount: number; reason: string },
) {
  return djangoSend(request, "/api/v1/fees/refunds/", "POST", {
    payment: input.paymentId,
    amountPaise: Math.round(input.amount * 100),
    reason: input.reason,
  });
}

export function recordPaymentByStudent(
  request: Request,
  input: { studentId: string; amount: number; method: string; referenceNo?: string },
) {
  return djangoSend(request, "/api/v1/fees/payments/offline-by-student/", "POST", {
    studentId: input.studentId,
    amountPaise: Math.round((input.amount || 0) * 100),
    method: input.method,
    referenceNo: input.referenceNo,
  });
}

export function runReconciliation(request: Request) {
  return djangoSend(request, "/api/v1/fees/reconciliation/run/", "POST", {});
}

export function writeOffInvoice(request: Request, invoiceId: string) {
  return djangoSend(request, `/api/v1/fees/invoices/${invoiceId}/write-off/`, "POST", {});
}

export function requestCreditNote(
  request: Request,
  input: { studentId: string; amount: number; reason: string; invoiceId?: string },
) {
  return djangoSend(request, "/api/v1/fees/credit-notes/", "POST", {
    student: input.studentId,
    amountPaise: Math.round(input.amount * 100),
    reason: input.reason,
    invoice: input.invoiceId ?? null,
  });
}

export function reviewCreditNote(
  request: Request,
  input: { creditNoteRequestId: string; approve: boolean },
) {
  return djangoSend(
    request,
    `/api/v1/fees/credit-notes/${input.creditNoteRequestId}/`,
    "PATCH",
    { status: input.approve ? "approved" : "rejected" },
  );
}
