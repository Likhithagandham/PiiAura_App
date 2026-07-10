"use client";

import { useEffect, useMemo, useState } from "react";
import type {
  Application,
  CourseEligibilityRule,
  EligibilityResult,
} from "@eduos/types";
import { Button, Input } from "@eduos/ui";
import { AdminModal } from "../AdminModal";

const WIZARD_STEPS = ["Applicant", "Course", "Eligibility", "Documents", "Review"];

type WizardForm = {
  applicantName: string;
  phone: string;
  email: string;
  parentPhone: string;
  dateOfBirth: string;
  gender: "" | "male" | "female" | "other";
  parentGuardianName: string;
  address: string;
  course: string;
  intake: string;
  previousSchool: string;
  previousGrade: string;
  previousMarksPercent: string;
};

function formFromApp(app: Application): WizardForm {
  return {
    applicantName: app.applicantName,
    phone: app.phone,
    email: app.email,
    parentPhone: app.parentPhone ?? "",
    dateOfBirth: app.applicant?.dateOfBirth ?? "",
    gender: app.applicant?.gender ?? "",
    parentGuardianName: app.applicant?.parentGuardianName ?? "",
    address: app.applicant?.address ?? "",
    course: app.course,
    intake: app.intake,
    previousSchool: app.applicant?.previousSchool ?? "",
    previousGrade: app.applicant?.previousGrade ?? "",
    previousMarksPercent:
      app.applicant?.previousMarksPercent != null
        ? String(app.applicant.previousMarksPercent)
        : "",
  };
}

function EligibilityDisplay({ result, compact = false }: { result: EligibilityResult; compact?: boolean }) {
  if (compact && result.eligible) {
    return (
      <p style={{ fontSize: "0.8125rem", color: "var(--eduos-primary)", margin: "0.75rem 0 0" }}>
        Meets all eligibility criteria for the selected class.
      </p>
    );
  }

  return (
    <div
      style={{
        marginTop: "0.75rem",
        padding: "0.75rem",
        borderRadius: "var(--eduos-radius)",
        background: result.eligible ? "var(--eduos-primary-light)" : "#fef2f2",
        border: `1px solid ${result.eligible ? "var(--eduos-primary)" : "var(--eduos-danger)"}`,
      }}
    >
      <strong style={{ fontSize: "0.8125rem" }}>
        {result.eligible ? "Eligible" : "Not eligible"}
      </strong>
      {!compact ? (
        <ul style={{ fontSize: "0.75rem", marginTop: "0.5rem", paddingLeft: "1.1rem", marginBottom: 0 }}>
          {result.rules.map((r) => (
            <li key={r.rule} style={{ marginBottom: "0.2rem" }}>
              {r.passed ? "✓" : "✗"} {r.rule}: {r.message}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

const linkBtn: React.CSSProperties = {
  background: "none",
  border: "none",
  padding: 0,
  fontSize: "0.8125rem",
  color: "var(--eduos-primary)",
  cursor: "pointer",
  textDecoration: "underline",
};

export function ApplicationWizardModal({
  application,
  courses,
  intakes,
  eligibilityRules,
  onClose,
  onSaveStep,
  onCheckEligibility,
  onPatch,
  onDownloadIdCard,
  onMessage,
}: {
  application: Application;
  courses: string[];
  intakes: string[];
  eligibilityRules: CourseEligibilityRule[];
  onClose: () => void;
  onSaveStep: (step: number, data: Record<string, unknown>) => Promise<Application | null>;
  onCheckEligibility: () => Promise<Application | null>;
  onPatch: (payload: Record<string, unknown>) => Promise<unknown>;
  onDownloadIdCard: (applicationId: string) => void;
  onMessage: (msg: string) => void;
}) {
  const [step, setStep] = useState(application.wizard?.currentStep ?? 0);
  const [form, setForm] = useState<WizardForm>(() => formFromApp(application));
  const [saving, setSaving] = useState(false);
  const [inlineError, setInlineError] = useState<string | null>(null);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [eligibility, setEligibility] = useState<EligibilityResult | null>(
    application.eligibility,
  );

  useEffect(() => {
    setStep(application.wizard?.currentStep ?? 0);
    setForm(formFromApp(application));
    setEligibility(application.eligibility);
    setInlineError(null);
  }, [application]);

  const courseRule = useMemo(
    () => eligibilityRules.find((r) => r.course === form.course),
    [eligibilityRules, form.course],
  );

  const isEnrolled = Boolean(application.enrolledStudentId);
  const canCompleteEnrollment =
    application.stage === "verification" && (eligibility?.eligible ?? true);
  const isLastStep = step === WIZARD_STEPS.length - 1;
  const [confirmParentLink, setConfirmParentLink] = useState<null | { phone: string; matchHint: string }>(null);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  function patchForm<K extends keyof WizardForm>(key: K, value: WizardForm[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function buildStepPayload(targetStep: number): Record<string, unknown> {
    const marks = form.previousMarksPercent.trim();
    const applicant = {
      dateOfBirth: form.dateOfBirth,
      gender: form.gender,
      parentGuardianName: form.parentGuardianName,
      address: form.address,
      previousSchool: form.previousSchool,
      previousGrade: form.previousGrade,
      previousMarksPercent: marks === "" ? null : Number(marks),
    };

    if (targetStep === 0) {
      return {
        applicantName: form.applicantName,
        phone: form.phone,
        email: form.email,
        parentPhone: form.parentPhone || null,
        applicant,
      };
    }
    if (targetStep === 1) {
      return { course: form.course, intake: form.intake, applicant };
    }
    if (targetStep === 2) {
      return { applicant };
    }
    return {};
  }

  async function handleSaveAndContinue() {
    setSaving(true);
    setInlineError(null);
    const updated = await onSaveStep(step, buildStepPayload(step));
    setSaving(false);
    if (!updated) {
      setInlineError("Couldn’t save. Please refresh and sign in again if needed.");
      return;
    }
    setEligibility(updated.eligibility);
    if (step === 2) {
      onMessage(
        updated.eligibility?.eligible
          ? "Eligibility check passed."
          : "Review failed eligibility rules.",
      );
    }
    if (step < WIZARD_STEPS.length - 1) {
      setStep(step + 1);
    }
  }

  async function handleEnroll() {
    setSaving(true);
    const res = (await onPatch({
      action: "enroll",
      applicationId: application.id,
      parentPhone: application.parentPhone ?? application.phone,
    })) as { parentLinkConfirmationRequired?: boolean; details?: { phone?: string; matchHint?: string } } | null;
    if (res?.parentLinkConfirmationRequired && res?.details?.phone && res.details.matchHint) {
      setConfirmParentLink({ phone: res.details.phone, matchHint: res.details.matchHint });
    }
    setSaving(false);
  }

  async function handleConfirmParentLink() {
    if (!confirmParentLink) return;
    setSaving(true);
    setInlineError(null);
    setConfirmParentLink(null);
    const res = (await onPatch({
      action: "enroll",
      applicationId: application.id,
      confirmParentLink: true,
      parentPhone: application.parentPhone ?? application.phone,
    })) as { parentLinkConfirmationRequired?: boolean } | null;
    if (res?.parentLinkConfirmationRequired) {
      setInlineError("Couldn’t confirm parent link. Please try again.");
    }
    setSaving(false);
  }

  async function handleUploadPhoto() {
    if (photoUploading) return;
    setInlineError(null);
    setPhotoUploading(true);
    try {
      const res = await onPatch({ action: "upload_photo", applicationId: application.id });
      if (!res) {
        setInlineError("Couldn’t upload photo. Please try again.");
        return;
      }
      onMessage("Photo uploaded to storage.");
    } finally {
      setPhotoUploading(false);
    }
  }

  async function handleRunCheck() {
    setSaving(true);
    await onSaveStep(2, buildStepPayload(2));
    const updated = await onCheckEligibility();
    setSaving(false);
    if (updated) {
      setEligibility(updated.eligibility);
      onMessage(updated.eligibility?.eligible ? "Eligible." : "Not eligible.");
    }
  }

  async function toggleWaitlist() {
    const next = !application.waitlisted;
    await onPatch({
      action: "waitlist",
      applicationId: application.id,
      waitlisted: next,
    });
    onMessage(next ? "Added to waitlist." : "Removed from waitlist.");
  }

  return (
    <AdminModal title={application.applicantName} onClose={onClose} wide>
      {application.parentLinkedWarning ? (
        <p
          style={{
            background: "#fffbeb",
            padding: "0.625rem 0.75rem",
            borderRadius: "var(--eduos-radius)",
            fontSize: "0.8125rem",
            marginBottom: "0.875rem",
          }}
        >
          Parent account may already be linked — verify before portal invite.
        </p>
      ) : null}

      <div style={{ marginBottom: "1rem" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            marginBottom: "0.5rem",
          }}
        >
          <span style={{ fontSize: "0.9375rem", fontWeight: 600 }}>{WIZARD_STEPS[step]}</span>
          <span style={{ fontSize: "0.75rem", color: "var(--eduos-text-muted)" }}>
            Step {step + 1} of {WIZARD_STEPS.length}
          </span>
        </div>
        <div style={{ display: "flex", gap: "0.25rem" }}>
          {WIZARD_STEPS.map((label, i) => (
            <button
              key={label}
              type="button"
              title={label}
              aria-label={`${label}, step ${i + 1}`}
              onClick={() => setStep(i)}
              style={{
                flex: 1,
                height: "4px",
                padding: 0,
                border: "none",
                borderRadius: "2px",
                cursor: "pointer",
                background:
                  i <= step ? "var(--eduos-primary)" : "var(--eduos-border)",
              }}
            />
          ))}
        </div>
      </div>

      <div style={{ minHeight: "200px" }}>
        {step === 0 ? (
          <div style={{ display: "grid", gap: "0.625rem" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.625rem" }}>
              <Input
                label="Applicant name"
                value={form.applicantName}
                onChange={(e) => patchForm("applicantName", e.target.value)}
                required
              />
              <Input
                label="Date of birth"
                type="date"
                value={form.dateOfBirth}
                onChange={(e) => patchForm("dateOfBirth", e.target.value)}
                required
              />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.625rem" }}>
              <Input
                label="Phone"
                value={form.phone}
                onChange={(e) => patchForm("phone", e.target.value)}
                required
              />
              <Input
                label="Email"
                type="email"
                value={form.email}
                onChange={(e) => patchForm("email", e.target.value)}
              />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.625rem" }}>
              <div>
                <label className="eduos-label">Gender</label>
                <select
                  className="eduos-input"
                  value={form.gender}
                  onChange={(e) => patchForm("gender", e.target.value as WizardForm["gender"])}
                >
                  <option value="">Select</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <Input
                label="Parent phone"
                value={form.parentPhone}
                onChange={(e) => patchForm("parentPhone", e.target.value)}
              />
            </div>
            <Input
              label="Parent / guardian name"
              value={form.parentGuardianName}
              onChange={(e) => patchForm("parentGuardianName", e.target.value)}
            />
            <Input
              label="Address"
              value={form.address}
              onChange={(e) => patchForm("address", e.target.value)}
            />
          </div>
        ) : null}

        {step === 1 ? (
          <div style={{ display: "grid", gap: "0.625rem" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.625rem" }}>
              <div>
                <label className="eduos-label">Class / course</label>
                <select
                  className="eduos-input"
                  value={form.course}
                  onChange={(e) => patchForm("course", e.target.value)}
                >
                  {courses.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="eduos-label">Intake</label>
                <select
                  className="eduos-input"
                  value={form.intake}
                  onChange={(e) => patchForm("intake", e.target.value)}
                >
                  {intakes.map((i) => (
                    <option key={i} value={i}>
                      {i}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            {courseRule ? (
              <p style={{ fontSize: "0.8125rem", color: "var(--eduos-text-muted)", margin: 0 }}>
                Requires {courseRule.requiredPreviousGrade}, min {courseRule.minMarksPercent}% marks,
                age {courseRule.minAge}
                {courseRule.maxAge ? `–${courseRule.maxAge}` : "+"} years.
              </p>
            ) : null}
          </div>
        ) : null}

        {step === 2 ? (
          <div style={{ display: "grid", gap: "0.625rem" }}>
            <Input
              label="Previous school"
              value={form.previousSchool}
              onChange={(e) => patchForm("previousSchool", e.target.value)}
            />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.625rem" }}>
              <Input
                label="Previous grade"
                value={form.previousGrade}
                onChange={(e) => patchForm("previousGrade", e.target.value)}
                placeholder={courseRule?.requiredPreviousGrade ?? "Class 9"}
              />
              <Input
                label="Marks (%)"
                type="number"
                min={0}
                max={100}
                value={form.previousMarksPercent}
                onChange={(e) => patchForm("previousMarksPercent", e.target.value)}
              />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
              <Button type="button" variant="secondary" onClick={handleRunCheck} disabled={saving}>
                {saving ? "Checking…" : "Run eligibility check"}
              </Button>
              <span style={{ fontSize: "0.6875rem", fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", background: "var(--eduos-primary-light)", color: "var(--eduos-primary)", border: "1px solid var(--eduos-primary)", borderRadius: "999px", padding: "0.1rem 0.55rem" }}>
                Coming soon — rules engine
              </span>
            </div>
            {eligibility ? <EligibilityDisplay result={eligibility} /> : null}
          </div>
        ) : null}

        {step === 3 ? (
          <div>
            {application.documents.length === 0 ? (
              <p style={{ fontSize: "0.875rem", color: "var(--eduos-text-muted)", marginTop: 0 }}>
                No documents uploaded yet.
              </p>
            ) : (
              <ul
                style={{
                  listStyle: "none",
                  padding: 0,
                  margin: "0 0 0.75rem",
                  fontSize: "0.8125rem",
                }}
              >
                {application.documents.map((d) => (
                  <li
                    key={d.id}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "0.5rem 0",
                      borderBottom: "1px solid var(--eduos-border)",
                    }}
                  >
                    <span>
                      {d.name}{" "}
                      <span style={{ color: "var(--eduos-text-muted)" }}>({d.status})</span>
                    </span>
                    {d.status === "pending" ? (
                      <button
                        type="button"
                        style={linkBtn}
                        onClick={() =>
                          onPatch({
                            action: "verify_document",
                            applicationId: application.id,
                            docId: d.id,
                            docStatus: "verified",
                          })
                        }
                      >
                        Verify
                      </button>
                    ) : null}
                  </li>
                ))}
              </ul>
            )}
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap", marginTop: "0.25rem" }}>
              <button
                type="button"
                style={linkBtn}
                onClick={() =>
                  onPatch({
                    action: "upload_document",
                    applicationId: application.id,
                    docName: "Mark sheet",
                  })
                }
              >
                + Upload mark sheet
              </button>
              <span style={{ fontSize: "0.6875rem", fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", background: "var(--eduos-primary-light)", color: "var(--eduos-primary)", border: "1px solid var(--eduos-primary)", borderRadius: "999px", padding: "0.1rem 0.55rem" }}>
                Coming soon — S3 upload
              </span>
            </div>
          </div>
        ) : null}

        {step === 4 ? (
          <div style={{ fontSize: "0.875rem" }}>
            <dl
              style={{
                display: "grid",
                gridTemplateColumns: "100px 1fr",
                gap: "0.35rem 0.75rem",
                margin: 0,
              }}
            >
              <dt style={{ color: "var(--eduos-text-muted)", margin: 0 }}>Name</dt>
              <dd style={{ margin: 0 }}>{form.applicantName}</dd>
              <dt style={{ color: "var(--eduos-text-muted)", margin: 0 }}>DOB</dt>
              <dd style={{ margin: 0 }}>{form.dateOfBirth || "—"}</dd>
              <dt style={{ color: "var(--eduos-text-muted)", margin: 0 }}>Class</dt>
              <dd style={{ margin: 0 }}>{form.course}</dd>
              <dt style={{ color: "var(--eduos-text-muted)", margin: 0 }}>Intake</dt>
              <dd style={{ margin: 0 }}>{form.intake}</dd>
              <dt style={{ color: "var(--eduos-text-muted)", margin: 0 }}>Previous</dt>
              <dd style={{ margin: 0 }}>
                {form.previousGrade || "—"} · {form.previousMarksPercent || "—"}%
              </dd>
              <dt style={{ color: "var(--eduos-text-muted)", margin: 0 }}>Status</dt>
              <dd style={{ margin: 0 }}>
                {application.waitlisted ? (
                  <span style={{ color: "#d69e2e" }}>Waitlisted</span>
                ) : (
                  STAGE_LABELS[application.stage] ?? application.stage
                )}
              </dd>
            </dl>
            {eligibility ? (
              <EligibilityDisplay result={eligibility} compact={eligibility.eligible} />
            ) : null}

            <div
              style={{
                marginTop: "1rem",
                padding: "0.875rem",
                borderRadius: "var(--eduos-radius)",
                border: "1px solid var(--eduos-border)",
                background: "var(--eduos-bg, #fafafa)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: "1rem",
                  flexWrap: "wrap",
                }}
              >
                <div>
                  <div style={{ fontWeight: 600, fontSize: "0.875rem" }}>Student ID card</div>
                  <p
                    style={{
                      fontSize: "0.8125rem",
                      color: "var(--eduos-text-muted)",
                      margin: "0.25rem 0 0",
                    }}
                  >
                    {isEnrolled
                      ? application.enrolledStudentId
                      : "Issued after enrollment"}
                  </p>
                </div>
                <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                  {isEnrolled ? (
                    <>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.25rem" }}>
                        <Button
                          type="button"
                          onClick={() => onDownloadIdCard(application.id)}
                        >
                          Download PDF
                        </Button>
                        <span style={{ fontSize: "0.6875rem", fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", background: "var(--eduos-primary-light)", color: "var(--eduos-primary)", border: "1px solid var(--eduos-primary)", borderRadius: "999px", padding: "0.1rem 0.55rem" }}>Coming soon — ID card</span>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.25rem" }}>
                        <Button
                          type="button"
                          variant="secondary"
                          onClick={handleUploadPhoto}
                          disabled={photoUploading}
                        >
                          {photoUploading ? "Uploading…" : "Photo"}
                        </Button>
                        <span style={{ fontSize: "0.6875rem", fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", background: "var(--eduos-primary-light)", color: "var(--eduos-primary)", border: "1px solid var(--eduos-primary)", borderRadius: "999px", padding: "0.1rem 0.55rem" }}>Coming soon — S3</span>
                      </div>
                    </>
                  ) : canCompleteEnrollment ? (
                    <Button type="button" onClick={handleEnroll} disabled={saving}>
                      {saving ? "Enrolling…" : "Complete enrollment"}
                    </Button>
                  ) : null}
                </div>
              </div>
              {!isEnrolled && application.stage !== "verification" ? (
                <p style={{ fontSize: "0.75rem", color: "var(--eduos-text-muted)", margin: "0.5rem 0 0" }}>
                  Advance to <strong>Verification</strong> on the pipeline to enroll.
                </p>
              ) : null}
            </div>
          </div>
        ) : null}
      </div>

      <div
        style={{
          marginTop: "1.25rem",
          paddingTop: "1rem",
          borderTop: "1px solid var(--eduos-border)",
        }}
      >
        {inlineError ? (
          <p style={{ margin: "0 0 0.75rem", fontSize: "0.8125rem", color: "var(--eduos-danger)" }}>
            {inlineError}
          </p>
        ) : null}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "0.75rem",
            flexWrap: "wrap",
          }}
        >
          <div>
            {step > 0 ? (
              <button
                type="button"
                style={linkBtn}
                onClick={() => setStep(step - 1)}
                disabled={saving}
              >
                ← Back
              </button>
            ) : (
              <span />
            )}
          </div>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            {!isLastStep ? (
              <Button type="button" onClick={handleSaveAndContinue} disabled={saving}>
                {saving ? "Saving…" : "Save & continue"}
              </Button>
            ) : null}
            {isLastStep && !isEnrolled && application.status !== "rejected" ? (
              <Button type="button" variant="secondary" onClick={() => setRejectOpen(true)} disabled={saving}>
                Reject
              </Button>
            ) : null}
            <Button type="button" variant="secondary" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
        <div style={{ marginTop: "0.625rem" }}>
          <button type="button" style={linkBtn} onClick={toggleWaitlist}>
            {application.waitlisted ? "Remove from waitlist" : "Add to waitlist"}
          </button>
        </div>
      </div>

      {confirmParentLink ? (
        <AdminModal title="Confirm parent link" onClose={() => setConfirmParentLink(null)}>
          <p style={{ fontSize: "0.875rem", marginTop: 0 }}>
            A parent account may already exist for <strong>{confirmParentLink.phone}</strong>.
          </p>
          <p style={{ fontSize: "0.8125rem", color: "var(--eduos-text-muted)" }}>
            {confirmParentLink.matchHint} Confirm to link and send invite. Cancel to edit the parent phone.
          </p>
          <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem", flexWrap: "wrap" }}>
            <Button type="button" onClick={handleConfirmParentLink} disabled={saving}>
              {saving ? "Confirming…" : "Confirm & enroll"}
            </Button>
            <Button type="button" variant="secondary" onClick={() => setConfirmParentLink(null)}>
              Cancel
            </Button>
          </div>
        </AdminModal>
      ) : null}

      {rejectOpen ? (
        <AdminModal title="Reject application" onClose={() => setRejectOpen(false)}>
          <p style={{ fontSize: "0.8125rem", color: "var(--eduos-text-muted)", marginTop: 0 }}>
            Provide a reason (sent to applicant by SMS/email).
          </p>
          <Input label="Reason" value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} />
          <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem", flexWrap: "wrap" }}>
            <Button
              type="button"
              onClick={async () => {
                setSaving(true);
                const res = await onPatch({
                  action: "reject",
                  applicationId: application.id,
                  reason: rejectReason,
                });
                setSaving(false);
                if (res) {
                  setRejectOpen(false);
                  setRejectReason("");
                  onMessage("Application rejected and applicant notified.");
                }
              }}
              disabled={saving}
            >
              {saving ? "Rejecting…" : "Reject & notify"}
            </Button>
            <Button type="button" variant="secondary" onClick={() => setRejectOpen(false)} disabled={saving}>
              Cancel
            </Button>
          </div>
        </AdminModal>
      ) : null}
    </AdminModal>
  );
}

const STAGE_LABELS: Record<string, string> = {
  enquiry: "Enquiry",
  application: "Application",
  documents: "Documents",
  verification: "Verification",
  enrollment: "Enrolled",
};
