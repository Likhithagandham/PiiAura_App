import type {
  ReviewConcessionInput,
  RequestCreditNoteInput,
  ReviewCreditNoteInput,
  ReviewRefundInput,
  SaveConcessionRuleInput,
  SaveFeeStructureInput,
} from "@eduos/types";
import { NextResponse } from "next/server";
import { auditDiffLine, logSensitiveMutation } from "@/lib/admin/audit-log";
import { requireAdmin } from "@/lib/admin/api";
import { withIdempotency } from "@/lib/admin/idempotency";
import {
  approveRefund,
  generateInvoices,
  recordPaymentByStudent,
  rejectRefund,
  requestRefund,
  reviewConcession,
  runReconciliation,
  saveConcessionRule,
  saveFeeStructure,
  writeOffInvoice,
} from "@/lib/services/fees.service";

export async function PATCH(request: Request) {
  return withIdempotency(request, async () => {
    const auth = await requireAdmin(request);
    if (!auth.ok) return auth.response;

    const body = (await request.json()) as { action: string; [key: string]: unknown };
    const { subdomain, user } = auth;

    try {
      switch (body.action) {
        case "review_concession": {
          const result = await reviewConcession(request, body.payload as ReviewConcessionInput);
          logSensitiveMutation(request, subdomain, user, {
            action: "fees.concession.review",
            entityType: "concession_request",
            entityId: String((body.payload as ReviewConcessionInput)?.requestId ?? ""),
            diff: [auditDiffLine("approved", null, (body.payload as ReviewConcessionInput)?.approve)],
          });
          return NextResponse.json(result);
        }
        case "record_payment": {
          const result = await recordPaymentByStudent(request, {
            studentId: String(body.studentId),
            amount: Number(body.amount),
            method: String(body.method),
            referenceNo: typeof body.referenceNo === "string" ? body.referenceNo : undefined,
          });
          logSensitiveMutation(request, subdomain, user, {
            action: "fees.payment.record",
            entityType: "payment",
            entityId: "",
            diff: [
              auditDiffLine("studentId", null, String(body.studentId)),
              auditDiffLine("amount", null, Number(body.amount)),
            ],
          });
          return NextResponse.json(result);
        }
        case "save_structure": {
          const result = await saveFeeStructure(request, body.payload as SaveFeeStructureInput);
          logSensitiveMutation(request, subdomain, user, {
            action: "fees.structure.save",
            entityType: "fee_structure",
            entityId: String((body.payload as SaveFeeStructureInput)?.id ?? ""),
            diff: [auditDiffLine("name", null, (body.payload as SaveFeeStructureInput)?.name ?? "")],
          });
          return NextResponse.json(result);
        }
        case "save_concession_rule": {
          const result = await saveConcessionRule(request, body.payload as SaveConcessionRuleInput);
          logSensitiveMutation(request, subdomain, user, {
            action: "fees.concession_rule.save",
            entityType: "concession_rule",
            entityId: String((body.payload as SaveConcessionRuleInput)?.id ?? ""),
            diff: [auditDiffLine("name", null, (body.payload as SaveConcessionRuleInput)?.name ?? "")],
          });
          return NextResponse.json(result);
        }
        case "generate_invoices": {
          const result = await generateInvoices(request, {
            batchId: String(body.batchId),
            feeStructureId: String(body.feeStructureId),
            academicYearId: String(body.academicYearId),
          });
          return NextResponse.json(result);
        }
        case "request_refund": {
          const result = await requestRefund(request, {
            paymentId: String(body.paymentId),
            amount: Number(body.amount),
            reason: String(body.reason ?? ""),
          });
          return NextResponse.json(result);
        }
        case "review_refund": {
          const payload = body.payload as ReviewRefundInput;
          const result = payload.approve
            ? await approveRefund(request, payload)
            : await rejectRefund(request, payload);
          logSensitiveMutation(request, subdomain, user, {
            action: "fees.refund.review",
            entityType: "refund",
            entityId: payload.refundId,
            diff: [auditDiffLine("approved", null, payload.approve)],
          });
          return NextResponse.json(result);
        }
        case "reconcile": {
          const result = await runReconciliation(request);
          return NextResponse.json(result);
        }
        case "write_off_invoice": {
          const result = await writeOffInvoice(request, String(body.invoiceId));
          logSensitiveMutation(request, subdomain, user, {
            action: "fees.invoice.write_off",
            entityType: "fee_invoice",
            entityId: String(body.invoiceId),
            diff: [],
          });
          return NextResponse.json(result);
        }
        case "escalate_defaulter":
        case "request_credit_note":
        case "review_credit_note":
        case "process_refund":
        case "simulate_webhook":
          return NextResponse.json(
            { error: `${body.action} is not available on the real backend yet.` },
            { status: 501 },
          );
        default:
          return NextResponse.json({ error: "Unknown action" }, { status: 400 });
      }
    } catch (err) {
      return NextResponse.json(
        { error: err instanceof Error ? err.message : "Request failed" },
        { status: 400 },
      );
    }
  });
}
