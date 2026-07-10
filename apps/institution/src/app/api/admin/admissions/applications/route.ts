import type { PipelineStage } from "@eduos/types";
import { NextResponse } from "next/server";
import { auditDiffLine, logSensitiveMutation } from "@/lib/admin/audit-log";
import { requireAdmin } from "@/lib/admin/api";
import { withIdempotency } from "@/lib/admin/idempotency";
import { DjangoApiError } from "@/lib/services/django-client";
import {
  normalizeApplication,
  normalizeDuplicateWarning,
  normalizeParentLinkDetails,
} from "@/lib/services/admissions-normalize";
import {
  addToWaitlist,
  advanceApplicationStatus,
  convertEnquiry,
  enrollFromApplication,
  promoteWaitlistEntry,
  rejectApplication,
  saveApplicationStep,
  uploadApplicationDocument,
  verifyDocument,
} from "@/lib/services/admissions.service";

function firstFieldError(fieldErrors: Record<string, unknown>): string | null {
  for (const val of Object.values(fieldErrors)) {
    if (Array.isArray(val) && val.length > 0) return String(val[0]);
    if (typeof val === "string") return val;
  }
  return null;
}

function wrapApplication(raw: Record<string, unknown>) {
  const app = (raw.application ?? raw) as Record<string, unknown>;
  return { application: normalizeApplication(app) };
}

export async function PATCH(request: Request) {
  return withIdempotency(request, async () => {
    const auth = await requireAdmin(request);
    if (!auth.ok) return auth.response;

    const body = (await request.json()) as {
      action: string;
      applicationId: string;
      stage?: PipelineStage;
      step?: number;
      data?: Record<string, unknown>;
      docName?: string;
      docId?: string;
      docStatus?: "verified" | "rejected";
      waitlisted?: boolean;
      waitlistEntryId?: string;
      enquiryId?: string;
      forceDuplicate?: boolean;
      confirmParentLink?: boolean;
      twinConfirmReason?: string;
      notificationBatchId?: string;
      reason?: string;
      parentPhone?: string;
    };

    const { subdomain, user } = auth;
    const applicationId = String(body.applicationId ?? "");

    try {
      if (body.action === "reject") {
        const raw = await rejectApplication(request, applicationId, String(body.reason ?? "")) as Record<string, unknown>;
        logSensitiveMutation(request, subdomain, user, {
          action: "admissions.application.reject", entityType: "application",
          entityId: applicationId, diff: [auditDiffLine("reason", null, String(body.reason ?? ""))],
        });
        return NextResponse.json(wrapApplication(raw));
      }

      if (body.action === "enroll") {
        const res = await enrollFromApplication(request, applicationId, {
          confirmDuplicate: Boolean(body.forceDuplicate),
          confirmLinked: Boolean(body.confirmParentLink),
        });
        if (!res.ok) {
          const data = res.data as Record<string, unknown>;
          if (res.status === 409 && data.duplicate) {
            return NextResponse.json(
              { duplicate: normalizeDuplicateWarning(data.duplicate as Record<string, unknown>) },
              { status: 409 },
            );
          }
          if (res.status === 409 && data.parentLinkConfirmationRequired) {
            return NextResponse.json({
              parentLinkConfirmationRequired: true,
              details: normalizeParentLinkDetails(
                (data.details ?? {}) as Record<string, unknown>,
                body.parentPhone,
              ),
            }, { status: 409 });
          }
          return NextResponse.json(data, { status: res.status || 400 });
        }
        logSensitiveMutation(request, subdomain, user, {
          action: "admissions.application.enroll", entityType: "application",
          entityId: applicationId, diff: [auditDiffLine("enrolled", null, "true")],
        });
        return NextResponse.json({ provisioning: res.data, ok: true });
      }

      if (body.action === "convert_enquiry") {
        const raw = await convertEnquiry(request, body.enquiryId!) as Record<string, unknown>;
        return NextResponse.json(wrapApplication(raw));
      }

      if (body.action === "save_wizard") {
        const stepPayload = { ...(body.data ?? {}), currentStep: body.step ?? 0 };
        const raw = await saveApplicationStep(request, applicationId, stepPayload) as Record<string, unknown>;
        return NextResponse.json(wrapApplication(raw));
      }

      if (body.action === "upload_document") {
        await uploadApplicationDocument(request, applicationId, body.docName ?? "Document");
        return NextResponse.json({ ok: true });
      }

      if (body.action === "verify_document") {
        await verifyDocument(request, body.docId!, body.docStatus ?? "verified");
        return NextResponse.json({ ok: true });
      }

      if (body.action === "move_stage") {
        const stageToStatus: Record<string, "under_review" | "accepted"> = {
          documents: "under_review",
          verification: "accepted",
        };
        const targetStatus = stageToStatus[String(body.stage ?? "")];
        if (targetStatus) {
          const raw = await advanceApplicationStatus(request, applicationId, targetStatus) as Record<string, unknown>;
          return NextResponse.json(wrapApplication(raw));
        }
        return NextResponse.json(
          { error: "This stage transition must be completed in the application wizard." },
          { status: 400 },
        );
      }

      if (body.action === "waitlist") {
        if (body.waitlisted) {
          const result = await addToWaitlist(request, applicationId, 999);
          return NextResponse.json(result);
        }
        return NextResponse.json(
          { error: "Removing from waitlist is not supported on the live backend yet." },
          { status: 501 },
        );
      }

      if (body.action === "promote_waitlist") {
        if (!body.waitlistEntryId) {
          return NextResponse.json({ error: "waitlistEntryId is required." }, { status: 400 });
        }
        const raw = await promoteWaitlistEntry(request, body.waitlistEntryId) as Record<string, unknown>;
        return NextResponse.json(wrapApplication(raw));
      }

      return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    } catch (err) {
      if (err instanceof DjangoApiError) {
        const detail =
          (err.fieldErrors ? firstFieldError(err.fieldErrors) : null) ?? err.message;
        return NextResponse.json({ error: detail }, { status: err.status || 400 });
      }
      return NextResponse.json(
        { error: err instanceof Error ? err.message : "Request failed" },
        { status: 400 },
      );
    }
  });
}
