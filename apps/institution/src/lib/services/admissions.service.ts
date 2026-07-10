/**
 * Admissions service — Django backend.
 *
 * Reads use the backend aggregate (GET /api/v1/admissions/admin-overview/), which
 * returns the AdmissionsData shape. Write actions that have a clean backend
 * endpoint are wired here.
 */

import type { AdmissionsData, CreateEnquiryInput, Enquiry, MeritListEntry } from "@eduos/types";
import { meritListFromApplications } from "./admissions-normalize";
import { djangoGet, djangoRaw, djangoSend } from "./django-client";

export async function getAdmissionsData(
  request: Request,
  subdomain: string,
): Promise<AdmissionsData> {
  return djangoGet<AdmissionsData>(request, "/api/v1/admissions/admin-overview/");
}

interface DjangoEnquiry {
  id: string;
  applicantName?: string;
  applicant_name?: string;
  phone?: string;
  email?: string;
  notes?: string;
  courseName?: string;
}

export async function createEnquiry(
  request: Request,
  subdomain: string,
  input: CreateEnquiryInput,
): Promise<Enquiry> {
  const res = await djangoSend<{ enquiry?: DjangoEnquiry } & DjangoEnquiry>(
    request,
    "/api/v1/admissions/enquiries/",
    "POST",
    {
      source: input.source,
      applicantName: input.applicantName,
      phone: input.phone,
      email: input.email,
      notes: input.notes ?? "",
      ...(input.courseInterest?.trim() ? { courseName: input.courseInterest.trim() } : {}),
    },
  );
  const created = res.enquiry ?? res;
  return {
    id: created.id,
    applicantName: created.applicantName ?? created.applicant_name ?? input.applicantName,
    phone: created.phone ?? input.phone,
    email: created.email ?? input.email,
    source: input.source,
    courseInterest: created.courseName ?? input.courseInterest,
    notes: created.notes ?? input.notes ?? "",
    createdAt: new Date().toISOString(),
  };
}

export function rejectApplication(request: Request, applicationId: string, reason: string) {
  return djangoSend(
    request,
    `/api/v1/admissions/applications/${applicationId}/reject/`,
    "POST",
    { rejectionReason: reason },
  );
}

export function saveApplicationStep(
  request: Request,
  applicationId: string,
  step: Record<string, unknown>,
) {
  return djangoSend(
    request,
    `/api/v1/admissions/applications/${applicationId}/step/`,
    "PATCH",
    { step },
  );
}

export function convertEnquiry(request: Request, enquiryId: string) {
  return djangoSend(
    request,
    `/api/v1/admissions/enquiries/${enquiryId}/convert/`,
    "POST",
    {},
  );
}

export function uploadApplicationDocument(
  request: Request,
  applicationId: string,
  docName: string,
) {
  return djangoSend(
    request,
    `/api/v1/admissions/applications/${applicationId}/documents/`,
    "POST",
    { docType: docName, s3Key: `documents/${applicationId}/${docName.replace(/\s+/g, "-").toLowerCase()}` },
  );
}

export function verifyDocument(
  request: Request,
  documentId: string,
  status: "verified" | "rejected",
) {
  return djangoSend(
    request,
    `/api/v1/admissions/documents/${documentId}/verify/`,
    "PATCH",
    { verificationStatus: status },
  );
}

export function advanceApplicationStatus(
  request: Request,
  applicationId: string,
  newStatus: "under_review" | "accepted",
) {
  return djangoSend(
    request,
    `/api/v1/admissions/applications/${applicationId}/status/`,
    "PATCH",
    { status: newStatus },
  );
}

export function addToWaitlist(request: Request, applicationId: string, rank: number) {
  return djangoSend(
    request,
    "/api/v1/admissions/waitlist/",
    "POST",
    { applicationId, rank },
  );
}

export function promoteWaitlistEntry(request: Request, waitlistEntryId: string) {
  return djangoSend(
    request,
    `/api/v1/admissions/waitlist/${waitlistEntryId}/promote/`,
    "POST",
    {},
  );
}

export async function getMeritList(
  request: Request,
  courseName: string,
  courseCatalog?: Array<{ id: string; name: string }>,
): Promise<MeritListEntry[]> {
  const catalog = courseCatalog ?? [];
  const match = catalog.find((c) => c.name === courseName);
  if (!match) return [];
  const res = await djangoGet<{ meritList?: Record<string, unknown>[] }>(
    request,
    `/api/v1/admissions/courses/${match.id}/merit-list/`,
  );
  return meritListFromApplications(res.meritList ?? []);
}

export function enrollFromApplication(
  request: Request,
  applicationId: string,
  opts: { confirmDuplicate?: boolean; confirmLinked?: boolean; batchId?: string },
) {
  return djangoRaw(
    request,
    `/api/v1/admissions/applications/${applicationId}/enroll-from-application/`,
    "POST",
    {
      confirmDuplicate: !!opts.confirmDuplicate,
      confirmLinked: !!opts.confirmLinked,
      ...(opts.batchId ? { batchId: opts.batchId } : {}),
    },
  );
}
