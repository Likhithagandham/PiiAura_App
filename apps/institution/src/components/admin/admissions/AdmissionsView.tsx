"use client";

import { useMemo, useState } from "react";
import type {
  Application,
  CourseEligibilityRule,
  CreateEnquiryInput,
  DuplicateEnrollmentWarning,
  Enquiry,
  EnquirySource,
  FunnelMetrics,
  PipelineNotificationBatch,
  PipelineStage,
} from "@eduos/types";
import { PIPELINE_STAGES } from "@eduos/types";
import { Button, EmptyState, Input, ListSearchBar, filterBySearch } from "@eduos/ui";
import { AdminModal } from "../AdminModal";
import { AdminShell } from "../AdminShell";
import { ApplicationWizardModal } from "./ApplicationWizardModal";
import { PipelineNotificationsModal } from "./PipelineNotificationsModal";
import { AdminTabs, AdminMessage } from "../ui";
import { AdminStatCard } from "../ui/AdminStatCard";
import { useApiData } from "@/lib/queries";

interface AdmissionsData {
  enquiries?: Enquiry[];
  applications?: Application[];
  funnel?: FunnelMetrics | null;
  courses?: string[];
  intakes?: string[];
  eligibilityRules?: CourseEligibilityRule[];
  notificationLog?: PipelineNotificationBatch[];
}

type Tab = "overview" | "enquiries" | "pipeline" | "notifications" | "waitlist";

const SOURCE_LABELS: Record<EnquirySource, string> = {
  walk_in: "Walk-in",
  social: "Social",
  referral: "Referral",
  online: "Online",
};

const STAGE_LABELS: Record<PipelineStage, string> = {
  enquiry: "Enquiry",
  application: "Application",
  documents: "Documents",
  verification: "Verification",
  enrollment: "Enrolled",
};

function idemHeaders(): HeadersInit {
  return {
    "Content-Type": "application/json",
    "Idempotency-Key": `idem-${Date.now()}`,
  };
}

export function AdmissionsView() {
  const [tab, setTab] = useState<Tab>("overview");
  const [message, setMessage] = useState<string | null>(null);

  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [duplicateModal, setDuplicateModal] = useState<DuplicateEnrollmentWarning | null>(null);
  const [pendingEnrollId, setPendingEnrollId] = useState<string | null>(null);
  const [convertingEnquiryId, setConvertingEnquiryId] = useState<string | null>(null);
  const [notificationBatch, setNotificationBatch] = useState<PipelineNotificationBatch | null>(null);
  const [retryingNotifications, setRetryingNotifications] = useState(false);
  const [search, setSearch] = useState("");

  const { data: admissions, error: queryError, refetch } = useApiData<AdmissionsData>(
    "/api/admin/admissions",
  );
  const load = refetch;
  const enquiries = admissions?.enquiries ?? [];
  const applications = admissions?.applications ?? [];
  const funnel = admissions?.funnel ?? null;
  const courses = admissions?.courses ?? [];
  const intakes = admissions?.intakes ?? [];
  const eligibilityRules = admissions?.eligibilityRules ?? [];
  const notificationLog = admissions?.notificationLog ?? [];
  const displayMessage = message ?? (queryError ? "Could not load admissions data." : null);

  async function patchApp(payload: Record<string, unknown>) {
    const res = await fetch("/api/admin/admissions/applications", {
      method: "PATCH",
      credentials: "include",
      headers: idemHeaders(),
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (res.status === 409 && data.duplicate) {
      setDuplicateModal(data.duplicate);
      if (typeof payload.applicationId === "string") {
        setPendingEnrollId(payload.applicationId);
      }
      return null;
    }
    // Let the wizard handle parent-link confirmation UX
    if (res.status === 409 && data.parentLinkConfirmationRequired) {
      return data;
    }
    if (!res.ok) {
      const msg = typeof data.error === "string" ? data.error : "Request failed";
      setMessage(msg);
      return null;
    }
    await load();
    if (data.notifications) {
      setNotificationBatch(data.notifications as PipelineNotificationBatch);
    }
    if (data.application) {
      setSelectedApp(data.application as Application);
    } else if (data.id && data.applicantName) {
      setSelectedApp(data as Application);
    }
    return data;
  }

  function openIdCard(applicationId: string) {
    window.open(
      `/api/admin/admissions/id-card?applicationId=${encodeURIComponent(applicationId)}&format=pdf`,
      "_blank",
    );
  }

  async function retryNotificationBatch(batchId: string) {
    if (retryingNotifications) return;
    setRetryingNotifications(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/admissions/applications", {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "Idempotency-Key": `retry-notif-${batchId}`,
        },
        body: JSON.stringify({
          action: "retry_notifications",
          applicationId: "",
          notificationBatchId: batchId,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(typeof data.error === "string" ? data.error : "Retry failed");
        return;
      }
      setNotificationBatch(data as PipelineNotificationBatch);
      await load();
      setMessage("Failed notifications resent successfully.");
    } catch {
      setMessage("Could not retry notifications. Please try again.");
    } finally {
      setRetryingNotifications(false);
    }
  }

  async function convertEnquiry(enquiryId: string) {
    if (convertingEnquiryId) return;
    setConvertingEnquiryId(enquiryId);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/admissions/applications", {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "Idempotency-Key": `convert-enquiry-${enquiryId}`,
        },
        body: JSON.stringify({ action: "convert_enquiry", enquiryId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(data.error ?? "Could not start application");
        return;
      }
      const app = (data.application ?? data) as Application;
      setSelectedApp(app);
      await load();
      setMessage("Application started — complete the wizard to check eligibility.");
      setTab("pipeline");
    } catch {
      setMessage("Could not start application. Please try again.");
    } finally {
      setConvertingEnquiryId(null);
    }
  }

  async function handleCreateEnquiry(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const body: CreateEnquiryInput = {
      applicantName: String(fd.get("name")),
      phone: String(fd.get("phone")),
      email: String(fd.get("email")),
      source: fd.get("source") as EnquirySource,
      courseInterest: String(fd.get("course")),
      notes: String(fd.get("notes") ?? ""),
    };
    setMessage(null);
    const res = await fetch("/api/admin/admissions/enquiries", {
      method: "POST",
      credentials: "include",
      headers: idemHeaders(),
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (res.ok) {
      setMessage("Enquiry captured.");
      (e.target as HTMLFormElement).reset();
      load();
    } else {
      const firstError =
        typeof data.error === "string"
          ? data.error
          : data.applicantName?.[0] ?? data.source?.[0] ?? data.detail ?? "Could not save enquiry. Please check the fields and try again.";
      setMessage(firstError);
    }
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: "overview", label: "Funnel analytics" },
    { id: "enquiries", label: "Enquiries" },
    { id: "pipeline", label: "Pipeline" },
    { id: "notifications", label: "Notifications" },
    { id: "waitlist", label: "Waitlist" },
  ];

  const waitlisted = applications.filter((a) => a.waitlisted);

  const enquiryFields = (e: Enquiry) => [
    e.applicantName,
    e.phone,
    e.email,
    e.courseInterest,
    SOURCE_LABELS[e.source],
  ];

  const applicationFields = (a: Application) => [
    a.applicantName,
    a.phone,
    a.email,
    a.course,
    SOURCE_LABELS[a.source],
    STAGE_LABELS[a.stage],
  ];

  const filteredEnquiries = useMemo(
    () => filterBySearch(enquiries, search, enquiryFields),
    [enquiries, search],
  );

  const filteredApplications = useMemo(
    () => filterBySearch(applications, search, applicationFields),
    [applications, search],
  );

  const filteredWaitlisted = useMemo(
    () => filterBySearch(waitlisted, search, applicationFields),
    [waitlisted, search],
  );

  return (
    <AdminShell title="Admissions">
      <AdminTabs tabs={tabs} active={tab} onChange={setTab} />

      <AdminMessage>{displayMessage}</AdminMessage>

      {tab === "overview" && funnel ? (
        <div className="eduos-admin-stat-grid">
          <AdminStatCard label="Conversion rate" value={`${funnel.conversionRate}%`} />
          {PIPELINE_STAGES.map((st) => (
            <AdminStatCard key={st} label={STAGE_LABELS[st]} value={String(funnel.byStage[st])} />
          ))}
          <section className="eduos-panel" style={{ gridColumn: "1 / -1" }}>
            <h3 className="eduos-subsection-title" style={{ marginBottom: "0.5rem" }}>
              By source
            </h3>
            <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
              {(Object.keys(funnel.bySource) as EnquirySource[]).map((src) => (
                <span key={src} className="eduos-body-sm" style={{ fontSize: "0.875rem" }}>
                  {SOURCE_LABELS[src]}: <strong style={{ color: "var(--eduos-kpi-value)" }}>{funnel.bySource[src]}</strong>
                </span>
              ))}
            </div>
          </section>
        </div>
      ) : null}

      {tab === "enquiries" ? (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
          <form onSubmit={handleCreateEnquiry} className="eduos-panel" style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <h3 className="eduos-subsection-title">Capture enquiry</h3>
            <Input name="name" label="Applicant name" required />
            <Input name="phone" label="Phone" required />
            <Input name="email" label="Email" type="email" />
            <div>
              <label className="eduos-label">Source</label>
              <select name="source" className="eduos-input" defaultValue="walk_in">
                {(Object.keys(SOURCE_LABELS) as EnquirySource[]).map((s) => (
                  <option key={s} value={s}>{SOURCE_LABELS[s]}</option>
                ))}
              </select>
            </div>
            <Input name="course" label="Course interest" required />
            <Input name="notes" label="Notes" />
            <Button type="submit">Save enquiry</Button>
          </form>
          <div className="eduos-panel">
            <h3 className="eduos-subsection-title">Recent enquiries</h3>
            <ListSearchBar
              value={search}
              onChange={setSearch}
              placeholder="Search applicant, course, or contact…"
              total={enquiries.length}
              filtered={filteredEnquiries.length}
            />
            {filteredEnquiries.length === 0 ? (
              <EmptyState compact title="No matches" description="Try a different name, course, or contact." />
            ) : null}
            {filteredEnquiries.map((e) => (
              <div key={e.id} style={{ padding: "0.75rem 0", borderBottom: "1px solid var(--eduos-border)" }}>
                <div style={{ fontWeight: 600 }}>{e.applicantName}</div>
                <div style={{ fontSize: "0.8125rem", color: "var(--eduos-text-muted)" }}>
                  {SOURCE_LABELS[e.source]} · {e.courseInterest}
                </div>
                <button
                  type="button"
                  disabled={convertingEnquiryId === e.id}
                  style={{
                    marginTop: "0.5rem",
                    fontSize: "0.8125rem",
                    color: "var(--eduos-primary)",
                    background: "none",
                    border: "none",
                    cursor: convertingEnquiryId === e.id ? "wait" : "pointer",
                    opacity: convertingEnquiryId === e.id ? 0.6 : 1,
                  }}
                  onClick={() => convertEnquiry(e.id)}
                >
                  {convertingEnquiryId === e.id ? "Starting…" : "Start application →"}
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {tab === "pipeline" ? (
        <>
        <ListSearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search applicant, course, or contact…"
          total={enquiries.length + applications.length}
          filtered={filteredEnquiries.length + filteredApplications.length}
        />
        <div style={{ display: "flex", gap: "0.75rem", overflowX: "auto", paddingBottom: "0.5rem" }}>
          {PIPELINE_STAGES.map((stage) => (
            <div key={stage} style={{ minWidth: "220px", flex: "0 0 220px" }}>
              <div style={{ fontWeight: 600, fontSize: "0.875rem", marginBottom: "0.5rem", color: "var(--eduos-text-muted)" }}>
                {STAGE_LABELS[stage]}
                <span style={{ fontWeight: 400, marginLeft: "0.35rem" }}>
                  (
                  {stage === "enquiry"
                    ? filteredEnquiries.length +
                      filteredApplications.filter((a) => a.stage === stage).length
                    : filteredApplications.filter((a) => a.stage === stage).length}
                  )
                </span>
              </div>
              {stage === "enquiry"
                ? filteredEnquiries.map((e) => (
                    <div
                      key={e.id}
                      className="eduos-panel"
                      style={{
                        marginBottom: "0.5rem",
                        padding: "0.875rem",
                      }}
                    >
                      <div style={{ fontWeight: 600, fontSize: "0.875rem" }}>{e.applicantName}</div>
                      <div style={{ fontSize: "0.75rem", color: "var(--eduos-text-muted)" }}>
                        {e.courseInterest} · {SOURCE_LABELS[e.source]}
                      </div>
                      <button
                        type="button"
                        disabled={convertingEnquiryId === e.id}
                        style={{
                          marginTop: "0.5rem",
                          fontSize: "0.75rem",
                          color: "var(--eduos-primary)",
                          background: "none",
                          border: "none",
                          cursor: convertingEnquiryId === e.id ? "wait" : "pointer",
                          opacity: convertingEnquiryId === e.id ? 0.6 : 1,
                        }}
                        onClick={() => convertEnquiry(e.id)}
                      >
                        {convertingEnquiryId === e.id ? "Starting…" : "Start application →"}
                      </button>
                    </div>
                  ))
                : null}
              {filteredApplications
                .filter((a) => a.stage === stage)
                .map((a) => (
                  <div
                    key={a.id}
                    className="eduos-panel"
                    style={{
                      marginBottom: "0.5rem",
                      padding: "0.875rem",
                      cursor: "pointer",
                      opacity: a.status === "rejected" ? 0.7 : 1,
                    }}
                    onClick={() => setSelectedApp(a)}
                  >
                    <div style={{ fontWeight: 600, fontSize: "0.875rem" }}>{a.applicantName}</div>
                    <div style={{ fontSize: "0.75rem", color: "var(--eduos-text-muted)" }}>
                      {a.course} · {SOURCE_LABELS[a.source]}
                    </div>
                    {a.status === "rejected" ? (
                      <span style={{ fontSize: "0.7rem", color: "var(--eduos-danger)" }}>Rejected</span>
                    ) : null}
                    {a.waitlisted ? (
                      <div style={{ marginTop: "0.35rem" }}>
                        <span style={{ fontSize: "0.7rem", color: "#d69e2e" }}>Waitlisted</span>
                        <button
                          type="button"
                          style={{
                            display: "block",
                            marginTop: "0.25rem",
                            fontSize: "0.75rem",
                            color: "var(--eduos-primary)",
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            padding: 0,
                          }}
                          onClick={async (ev) => {
                            ev.stopPropagation();
                            await patchApp({
                              action: "waitlist",
                              applicationId: a.id,
                              waitlisted: false,
                            });
                            setMessage(`${a.applicantName} removed from waitlist.`);
                          }}
                        >
                          Remove from waitlist
                        </button>
                      </div>
                    ) : null}
                    {a.enrolledStudentId ? (
                      <button
                        type="button"
                        style={{
                          marginTop: "0.5rem",
                          fontSize: "0.75rem",
                          color: "var(--eduos-primary)",
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          display: "block",
                        }}
                        onClick={(ev) => {
                          ev.stopPropagation();
                          openIdCard(a.id);
                        }}
                      >
                        Download ID card PDF
                      </button>
                    ) : null}
                    {stage === "application" && !a.waitlisted && a.status !== "rejected" ? (
                      <button
                        type="button"
                        style={{ marginTop: "0.5rem", fontSize: "0.75rem", color: "var(--eduos-primary)", background: "none", border: "none", cursor: "pointer" }}
                        onClick={async (ev) => {
                          ev.stopPropagation();
                          const result = await patchApp({ action: "move_stage", applicationId: a.id, stage: "documents" });
                          if (result) setMessage(`${a.applicantName} moved to Documents.`);
                        }}
                      >
                        Move to documents →
                      </button>
                    ) : null}
                    {stage === "documents" && !a.waitlisted && a.status !== "rejected" ? (
                      <button
                        type="button"
                        style={{ marginTop: "0.5rem", fontSize: "0.75rem", color: "var(--eduos-primary)", background: "none", border: "none", cursor: "pointer" }}
                        onClick={async (ev) => {
                          ev.stopPropagation();
                          const result = await patchApp({ action: "move_stage", applicationId: a.id, stage: "verification" });
                          if (result) setMessage(`${a.applicantName} moved to Verification.`);
                        }}
                      >
                        Send to verification →
                      </button>
                    ) : null}
                    {stage === "verification" && !a.waitlisted && a.status !== "rejected" ? (
                      <button
                        type="button"
                        style={{ marginTop: "0.5rem", fontSize: "0.75rem", color: "var(--eduos-primary)", background: "none", border: "none", cursor: "pointer" }}
                        onClick={async (ev) => {
                          ev.stopPropagation();
                          const result = await patchApp({
                            action: "enroll",
                            applicationId: a.id,
                            parentPhone: a.parentPhone ?? a.phone,
                          });
                          if (result) setMessage(`${a.applicantName} enrolled successfully.`);
                        }}
                      >
                        Enroll →
                      </button>
                    ) : null}
                  </div>
                ))}
            </div>
          ))}
        </div>
        </>
      ) : null}

      {tab === "notifications" ? (
        <div className="eduos-panel">
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
            <h3 className="eduos-subsection-title" style={{ margin: 0 }}>Pipeline notifications</h3>
            <span
              style={{
                fontSize: "0.6875rem",
                fontWeight: 600,
                letterSpacing: "0.04em",
                textTransform: "uppercase",
                background: "var(--eduos-primary-light)",
                color: "var(--eduos-primary)",
                border: "1px solid var(--eduos-primary)",
                borderRadius: "999px",
                padding: "0.1rem 0.55rem",
              }}
            >
              Coming soon
            </span>
          </div>
          <p style={{ fontSize: "0.875rem", color: "var(--eduos-text-muted)", marginBottom: "1.25rem", maxWidth: 520 }}>
            When this feature is live, the system will automatically send SMS and email alerts to
            applicants and parents every time an application moves between stages — from enquiry
            to application, documents submitted, verification complete, and final enrollment
            confirmation. You will also be able to retry failed deliveries and view a full log of
            every message sent.
          </p>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.5rem",
              fontSize: "0.8125rem",
              color: "var(--eduos-text-muted)",
              borderLeft: "3px solid var(--eduos-border)",
              paddingLeft: "0.875rem",
            }}
          >
            <span>📬 Auto-alerts on stage changes (Enquiry → Enrolled)</span>
            <span>📱 SMS + Email delivery per applicant and parent</span>
            <span>🔁 One-click retry for failed messages</span>
            <span>📋 Full delivery log with timestamps</span>
          </div>
          {notificationLog.length === 0 ? null : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {notificationLog.map((batch) => {
                const smsOk = batch.recipients.filter((r) => r.smsStatus === "sent").length;
                const emailOk = batch.recipients.filter((r) => r.emailStatus === "sent").length;
                const failed = batch.recipients.some(
                  (r) => r.smsStatus === "failed" || r.emailStatus === "failed",
                );
                return (
                  <div
                    key={batch.id}
                    style={{
                      padding: "0.875rem",
                      border: "1px solid var(--eduos-border)",
                      borderRadius: "var(--eduos-radius)",
                    }}
                  >
                    <div style={{ fontWeight: 600, fontSize: "0.875rem" }}>{batch.applicantName}</div>
                    <div style={{ fontSize: "0.75rem", color: "var(--eduos-text-muted)", marginTop: "0.25rem" }}>
                      {STAGE_LABELS[batch.fromStage]} → {STAGE_LABELS[batch.toStage]} ·{" "}
                      {new Date(batch.sentAt).toLocaleString()}
                    </div>
                    <div style={{ fontSize: "0.8125rem", marginTop: "0.5rem" }}>
                      SMS: {smsOk} sent · Email: {emailOk} sent
                      {failed ? (
                        <span style={{ color: "var(--eduos-danger)", marginLeft: "0.5rem" }}>
                          (some failed)
                        </span>
                      ) : null}
                    </div>
                    <button
                      type="button"
                      style={{
                        marginTop: "0.5rem",
                        fontSize: "0.75rem",
                        color: "var(--eduos-primary)",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                      }}
                      onClick={() => setNotificationBatch(batch)}
                    >
                      View delivery details →
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : null}

      {tab === "waitlist" ? (
        <div className="eduos-panel">
          <h3 className="eduos-subsection-title">Waitlist</h3>
          <ListSearchBar
            value={search}
            onChange={setSearch}
            placeholder="Search applicant or course…"
            total={waitlisted.length}
            filtered={filteredWaitlisted.length}
          />
          {filteredWaitlisted.length === 0 ? (
            <p style={{ fontSize: "0.875rem", color: "var(--eduos-text-muted)" }}>
              {waitlisted.length === 0 ? "No waitlisted applicants." : "No matches for your search."}
            </p>
          ) : (
            filteredWaitlisted
              .slice()
              .sort((a, b) => (a.waitlistRank ?? 9999) - (b.waitlistRank ?? 9999))
              .map((a) => (
              <div key={a.id} style={{ marginBottom: "0.75rem" }}>
                <div style={{ fontWeight: 600 }}>
                  #{a.waitlistRank ?? "—"} {a.applicantName}
                </div>
                <div style={{ fontSize: "0.8125rem", color: "var(--eduos-text-muted)" }}>{a.course}</div>
                <button
                  type="button"
                  style={{ marginTop: "0.25rem", fontSize: "0.75rem", color: "var(--eduos-primary)", background: "none", border: "none", cursor: "pointer" }}
                  onClick={() => patchApp({ action: "promote_waitlist", applicationId: a.id, waitlistEntryId: a.waitlistEntryId })}
                >
                  Promote to application
                </button>
                <button
                  type="button"
                  style={{ marginLeft: "0.5rem", fontSize: "0.75rem", color: "var(--eduos-primary)", background: "none", border: "none", cursor: "pointer" }}
                  onClick={() => patchApp({ action: "waitlist", applicationId: a.id, waitlisted: false })}
                >
                  Remove from waitlist
                </button>
              </div>
            ))
          )}
          <p style={{ fontSize: "0.8125rem", color: "var(--eduos-text-muted)", marginTop: "1rem" }}>
            You can also remove waitlisted applicants from the Pipeline tab (link on their card) or from the
            application detail modal.
          </p>
        </div>
      ) : null}

      {selectedApp ? (
        <ApplicationWizardModal
          application={selectedApp}
          courses={courses}
          intakes={intakes}
          eligibilityRules={eligibilityRules}
          onClose={() => setSelectedApp(null)}
          onMessage={setMessage}
          onSaveStep={async (step, data) => {
            const result = await patchApp({
              action: "save_wizard",
              applicationId: selectedApp.id,
              step,
              data,
            });
            if (!result) return null;
            return (result.application ?? result) as Application;
          }}
          onCheckEligibility={async () => {
            const result = await patchApp({
              action: "check_eligibility",
              applicationId: selectedApp.id,
            });
            if (!result) return null;
            return (result.application ?? result) as Application;
          }}
          onDownloadIdCard={openIdCard}
          onPatch={async (payload) => {
            const result = await patchApp(payload);
            if (payload.action === "enroll" && result) {
              if (result.application) {
                setSelectedApp(result.application as Application);
              }
              if (result.idCardUrl) {
                openIdCard(selectedApp.id);
              }
              if (result.provisioning || result.application) {
                setMessage("Student enrolled successfully.");
              }
            }
            if (payload.action === "generate_id_card" && result?.idCardUrl) {
              openIdCard(selectedApp.id);
              setMessage("ID card PDF downloaded.");
            }
            if (payload.action === "upload_photo" && result) {
              setMessage("Photo uploaded to storage.");
            }
            return result;
          }}
        />
      ) : null}

      {duplicateModal ? (
        <AdminModal title="Possible duplicate student" onClose={() => setDuplicateModal(null)} wide>
          <p style={{ fontSize: "0.875rem", marginBottom: "0.75rem" }}>
            Conflicting record: <strong>{duplicateModal.existingName}</strong>
            {duplicateModal.dateOfBirth ? ` · DOB ${duplicateModal.dateOfBirth}` : ""}
            {duplicateModal.phone ? ` · ${duplicateModal.phone}` : ""}
          </p>
          <p style={{ fontSize: "0.8125rem", color: "var(--eduos-text-muted)", marginBottom: "1rem" }}>
            Matched on: {(duplicateModal.matchFields ?? [duplicateModal.matchField]).filter(Boolean).join(", ")}
            {duplicateModal.siblingGroupId ? ` · sibling group ${duplicateModal.siblingGroupId}` : ""}
          </p>
          {duplicateModal.allowTwinConfirm !== false ? (
            <TwinConfirmForm
              onCancel={() => setDuplicateModal(null)}
              onConfirm={async (reason) => {
                const appId = pendingEnrollId ?? selectedApp?.id;
                const result = await patchApp({
                  action: "enroll",
                  applicationId: appId,
                  forceDuplicate: true,
                  twinConfirmReason: reason,
                  parentPhone: selectedApp?.parentPhone ?? selectedApp?.phone,
                });
                if (result?.application) setSelectedApp(result.application as Application);
                if (result?.idCardUrl) openIdCard(appId ?? "");
                if (result?.provisioning || result?.application) {
                  setDuplicateModal(null);
                  setMessage("Enrolled as a separate child (twin) — sibling group linked.");
                }
              }}
            />
          ) : (
            <Button
              type="button"
              onClick={async () => {
                const result = await patchApp({
                  action: "enroll",
                  applicationId: pendingEnrollId ?? selectedApp?.id,
                  forceDuplicate: true,
                  parentPhone: selectedApp?.parentPhone ?? selectedApp?.phone,
                });
                if (result?.application) setSelectedApp(result.application as Application);
                if (result?.provisioning || result?.application) {
                  setDuplicateModal(null);
                  setMessage("Enrolled with duplicate override.");
                }
              }}
            >
              Enroll anyway
            </Button>
          )}
        </AdminModal>
      ) : null}

      {notificationBatch ? (
        <PipelineNotificationsModal
          batch={notificationBatch}
          onClose={() => setNotificationBatch(null)}
          onRetry={() => retryNotificationBatch(notificationBatch.id)}
          retrying={retryingNotifications}
        />
      ) : null}
    </AdminShell>
  );
}

function TwinConfirmForm({
  onConfirm,
  onCancel,
}: {
  onConfirm: (reason: string) => void | Promise<void>;
  onCancel: () => void;
}) {
  const [reason, setReason] = useState("");
  return (
    <div>
      <label style={{ fontSize: "0.8125rem", display: "block", marginBottom: "0.5rem" }}>
        Reason this is a different child (e.g. twin)
        <textarea
          className="eduos-input"
          rows={3}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          style={{ display: "block", marginTop: "0.25rem", width: "100%" }}
        />
      </label>
      <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="button" disabled={!reason.trim()} onClick={() => onConfirm(reason.trim())}>
          Confirm different child
        </Button>
      </div>
    </div>
  );
}

