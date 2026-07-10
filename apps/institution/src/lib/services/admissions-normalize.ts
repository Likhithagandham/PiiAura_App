import type { DuplicateEnrollmentWarning, MeritListEntry, PipelineStage } from "@eduos/types";

const STATUS_TO_STAGE: Record<string, PipelineStage> = {
  draft: "application",
  submitted: "application",
  under_review: "documents",
  accepted: "verification",
  waitlisted: "application",
  enrolled: "enrollment",
  rejected: "application",
};

/** Normalize Django ApplicationSerializer → frontend Application shape. */
export function normalizeApplication(raw: Record<string, unknown>): Record<string, unknown> {
  const enq = (raw.enquiry ?? {}) as Record<string, unknown>;
  const step = (raw.step ?? {}) as Record<string, unknown>;
  const eligResult = (raw.eligibilityResult ?? null) as Record<string, unknown> | null;
  const docs = (raw.documents ?? []) as unknown[];
  const status = String(raw.status ?? "draft");
  const applicantStep = (step.applicant ?? {}) as Record<string, unknown>;

  return {
    id: raw.id,
    applicantName: enq.applicantName ?? enq.applicant_name ?? "",
    phone: enq.phone ?? "",
    email: enq.email ?? "",
    course: raw.courseName ?? raw.course ?? "",
    intake: "",
    stage: STATUS_TO_STAGE[status] ?? "application",
    source: enq.source ?? "walk_in",
    wizard: {
      currentStep: (step.currentStep ?? step.step ?? 0) as number,
      completedSteps: (step.completedSteps ?? []) as number[],
      lastSavedAt: String(step.lastSavedAt ?? ""),
    },
    applicant: {
      dateOfBirth: applicantStep.dateOfBirth ?? "",
      gender: applicantStep.gender ?? "",
      previousSchool: applicantStep.previousSchool ?? "",
      previousGrade: applicantStep.previousGrade ?? "",
      previousMarksPercent: applicantStep.previousMarksPercent ?? null,
      parentGuardianName: applicantStep.parentGuardianName ?? "",
      address: applicantStep.address ?? "",
    },
    eligibility: eligResult && "eligible" in eligResult ? eligResult : null,
    documents: docs.map((d: unknown) => {
      const doc = d as Record<string, unknown>;
      return {
        id: doc.id,
        name: doc.docType ?? doc.doc_type ?? "",
        status: doc.verificationStatus ?? doc.verification_status ?? "pending",
        uploadedAt: doc.createdAt ?? doc.created_at ?? "",
        storageKey: doc.s3Key ?? doc.s3_key ?? "",
      };
    }),
    meritScore: null,
    waitlisted: Boolean(raw.waitlisted),
    waitlistRank: raw.waitlistRank ?? null,
    waitlistEntryId: raw.waitlistEntryId ?? null,
    parentPhone: enq.phone ?? null,
    parentLinkedWarning: false,
    status: status === "rejected" ? "rejected" : "active",
    rejection: status === "rejected"
      ? { reason: raw.rejectionReason ?? "", rejectedAt: String(raw.updatedAt ?? "") }
      : null,
    feeSnapshot: null,
    provisioning: null,
    archivedBranchLink: null,
    enrolledStudentId: raw.enrolledStudentId ?? null,
    photoS3Key: null,
    photoUrl: null,
    idCardGeneratedAt: null,
    createdAt: raw.createdAt ?? raw.created_at ?? "",
    updatedAt: raw.updatedAt ?? raw.updated_at ?? "",
  };
}

export function normalizeDuplicateWarning(
  dup: Record<string, unknown>,
): DuplicateEnrollmentWarning {
  const matches = Array.isArray(dup.matches) ? (dup.matches as string[]) : [];
  return {
    existingStudentId: matches[0] ?? "",
    existingName: String(dup.message ?? "Existing student record"),
    matchFields: ["name", "date of birth", "phone"],
    allowTwinConfirm: true,
  };
}

export function normalizeParentLinkDetails(
  details: Record<string, unknown>,
  fallbackPhone?: string,
): { phone: string; matchHint: string; existingUserId?: string } {
  return {
    phone: fallbackPhone ?? String(details.phone ?? "this phone number"),
    matchHint: String(
      details.message ?? "An existing account may belong to the same family.",
    ),
    existingUserId: details.existingUserId
      ? String(details.existingUserId)
      : undefined,
  };
}

export function meritListFromApplications(
  apps: Record<string, unknown>[],
): MeritListEntry[] {
  return apps.map((raw, index) => {
    const enq = (raw.enquiry ?? {}) as Record<string, unknown>;
    const step = (raw.step ?? {}) as Record<string, unknown>;
    const applicant = (step.applicant ?? {}) as Record<string, unknown>;
    const marks = applicant.previousMarksPercent;
    const score = typeof marks === "number" ? marks : Number(marks) || 0;
    return {
      rank: index + 1,
      applicationId: String(raw.id ?? ""),
      applicantName: String(enq.applicantName ?? enq.applicant_name ?? ""),
      course: String(raw.courseName ?? ""),
      score,
    };
  });
}
