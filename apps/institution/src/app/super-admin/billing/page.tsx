"use client";

import { useState } from "react";
import { SkeletonTable, SkeletonText, StatCard } from "@eduos/ui";
import { SuperAdminShell } from "@/components/super-admin/SuperAdminShell";
import {
  useLicensingStudentsQuery,
  useLicensingSummaryQuery,
} from "@/lib/licensing-queries";

function formatInr(n: number | undefined | null): string {
  if (n == null || !Number.isFinite(n)) return "—";
  return `₹${n.toLocaleString("en-IN")}`;
}

function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export default function SuperAdminBillingPage() {
  const { data: summary, error } = useLicensingSummaryQuery("super-admin");
  const [rosterStatus, setRosterStatus] = useState<"unlicensed" | "licensed" | "all">("unlicensed");
  const { data: students, isLoading: loadingStudents } = useLicensingStudentsQuery(
    "super-admin",
    rosterStatus,
  );

  return (
    <SuperAdminShell title="Billing & licenses">
      {error ? (
        <p className="eduos-admin-message eduos-admin-message--error">
          Could not load licensing data.
        </p>
      ) : null}

      {!summary ? (
        <SkeletonText lines={4} />
      ) : (
        <>
          <div className="eduos-admin-stat-grid">
            <StatCard label="Licenses purchased" value={summary.licensesPurchased} accent="#1a5f4a" />
            <StatCard label="Licenses consumed" value={summary.licensesConsumed} accent="#2563eb" />
            <StatCard
              label="Unpaid students"
              value={summary.unlicensedStudents}
              accent={summary.unlicensedStudents > 0 ? "#dc2626" : "#1a5f4a"}
            />
            <StatCard
              label="Pending amount"
              value={formatInr(summary.pendingAmountInr)}
              accent="#d69e2e"
            />
          </div>

          <section className="eduos-panel">
            <h2 className="eduos-section-title">Subscription</h2>
            <dl style={{ display: "grid", gap: "0.5rem", fontSize: "0.875rem" }}>
              <div>
                <dt style={{ fontWeight: 600, display: "inline" }}>Period: </dt>
                <dd style={{ display: "inline" }}>
                  {formatDate(summary.period?.startDate)} → {formatDate(summary.period?.endDate)}
                </dd>
              </div>
              <div>
                <dt style={{ fontWeight: 600, display: "inline" }}>Status: </dt>
                <dd style={{ display: "inline", textTransform: "capitalize" }}>
                  {summary.period?.status ?? "—"}
                  {summary.period?.status === "grace" && summary.period.graceEndsAt
                    ? ` (until ${formatDate(summary.period.graceEndsAt)})`
                    : null}
                </dd>
              </div>
              <div>
                <dt style={{ fontWeight: 600, display: "inline" }}>Price: </dt>
                <dd style={{ display: "inline" }}>{formatInr(summary.unitPriceInr)}/student/year</dd>
              </div>
            </dl>
            <p className="eduos-body-sm" style={{ marginTop: "0.75rem", color: "var(--eduos-muted)" }}>
              Licenses are consumed permanently — one per admitted student. When students beyond
              your purchased licenses are admitted they stay unpaid until the platform team records
              your payment, which licenses the oldest unpaid students first automatically.
            </p>
          </section>

          {summary.payments && summary.payments.length > 0 ? (
            <section className="eduos-panel">
              <h2 className="eduos-section-title">Payment history</h2>
              <div className="eduos-table-wrap">
                <table className="eduos-admin-table">
                  <thead>
                    <tr>
                      <th className="eduos-admin-table__nowrap">Date</th>
                      <th className="eduos-admin-table__nowrap">Licenses</th>
                      <th className="eduos-admin-table__nowrap">Amount</th>
                      <th className="eduos-admin-table__nowrap">Mode</th>
                      <th className="eduos-admin-table__nowrap">Reference</th>
                    </tr>
                  </thead>
                  <tbody>
                    {summary.payments.map((p) => (
                      <tr key={p.id}>
                        <td className="eduos-admin-table__nowrap">{formatDate(p.paidAt)}</td>
                        <td className="eduos-admin-table__nowrap">+{p.licensesGranted}</td>
                        <td className="eduos-admin-table__nowrap">{formatInr(p.amountInr)}</td>
                        <td className="eduos-admin-table__nowrap" style={{ textTransform: "capitalize" }}>
                          {p.paymentMode.replace("_", " ")}
                        </td>
                        <td className="eduos-admin-table__nowrap">{p.referenceNumber || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          ) : null}

          <section className="eduos-panel">
            <div className="eduos-panel__header">
              <div>
                <h2 className="eduos-section-title">Student license roster</h2>
                <p className="eduos-section-desc">
                  Unpaid students are converted oldest-first when a payment is recorded.
                </p>
              </div>
              <div>
                <label className="eduos-label" htmlFor="roster-status">
                  Show
                </label>
                <select
                  id="roster-status"
                  className="eduos-input"
                  value={rosterStatus}
                  onChange={(e) => setRosterStatus(e.target.value as typeof rosterStatus)}
                >
                  <option value="unlicensed">Unpaid students</option>
                  <option value="licensed">Licensed students</option>
                  <option value="all">All students</option>
                </select>
              </div>
            </div>
            {loadingStudents ? (
              <SkeletonTable columns={5} rows={5} />
            ) : !students || students.length === 0 ? (
              <p className="eduos-body-sm">
                {rosterStatus === "unlicensed"
                  ? "All active students are licensed."
                  : "No students found."}
              </p>
            ) : (
              <div className="eduos-table-wrap">
                <table className="eduos-admin-table">
                  <thead>
                    <tr>
                      <th>Student</th>
                      <th className="eduos-admin-table__nowrap">Roll no.</th>
                      <th className="eduos-admin-table__nowrap">Branch</th>
                      <th className="eduos-admin-table__nowrap">Enrolled</th>
                      <th className="eduos-admin-table__nowrap">License</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((s) => (
                      <tr key={s.id}>
                        <td style={{ fontWeight: 600 }}>{s.studentName || "—"}</td>
                        <td className="eduos-admin-table__nowrap">{s.admissionNumber ?? "—"}</td>
                        <td className="eduos-admin-table__nowrap">{s.branchName ?? "—"}</td>
                        <td className="eduos-admin-table__nowrap">{formatDate(s.enrolledAt)}</td>
                        <td className="eduos-admin-table__nowrap">
                          {s.licenseStatus === "licensed" ? (
                            <span className="eduos-tag" style={{ background: "rgba(34,197,94,0.12)" }}>
                              Licensed
                            </span>
                          ) : (
                            <span className="eduos-tag" style={{ background: "rgba(239,68,68,0.12)" }}>
                              Unpaid
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}
    </SuperAdminShell>
  );
}
