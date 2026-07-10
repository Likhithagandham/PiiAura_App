"use client";

import { useState } from "react";
import { SkeletonTable, SkeletonText, StatCard } from "@eduos/ui";
import { AdminShell } from "@/components/admin/AdminShell";
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

export default function AdminBillingPage() {
  const { data: summary, error } = useLicensingSummaryQuery("admin");
  const [rosterStatus, setRosterStatus] = useState<"unlicensed" | "licensed" | "all">("unlicensed");
  const { data: students, isLoading: loadingStudents } = useLicensingStudentsQuery(
    "admin",
    rosterStatus,
  );

  return (
    <AdminShell title="Billing & licenses">
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
            <StatCard
              label="Unpaid students (this branch)"
              value={summary.branchUnlicensedStudents ?? 0}
              accent={(summary.branchUnlicensedStudents ?? 0) > 0 ? "#dc2626" : "#1a5f4a"}
            />
            <StatCard
              label="Pending amount (this branch)"
              value={formatInr(summary.branchPendingAmountInr ?? 0)}
              accent="#d69e2e"
            />
            <StatCard label="Institution licenses" value={summary.licensesPurchased} accent="#2563eb" />
            <StatCard label="Licenses consumed" value={summary.licensesConsumed} accent="#1a5f4a" />
          </div>

          <section className="eduos-panel">
            <h2 className="eduos-section-title">Subscription</h2>
            <p className="eduos-section-desc">
              {formatDate(summary.period?.startDate)} → {formatDate(summary.period?.endDate)}
              {" · "}
              <span style={{ textTransform: "capitalize" }}>{summary.period?.status ?? "—"}</span>
              {" · "}
              {formatInr(summary.unitPriceInr)}/student/year
            </p>
            <p className="eduos-body-sm" style={{ color: "var(--eduos-muted)" }}>
              Admissions are never blocked. Students admitted beyond the purchased licenses stay
              unpaid until the institution's payment is recorded; licensing is handled by your
              Super Admin and the platform team.
            </p>
          </section>

          <section className="eduos-panel">
            <div className="eduos-panel__header">
              <div>
                <h2 className="eduos-section-title">Student license status</h2>
                <p className="eduos-section-desc">Students in this branch, oldest first.</p>
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
              <SkeletonTable columns={4} rows={5} />
            ) : !students || students.length === 0 ? (
              <p className="eduos-body-sm">
                {rosterStatus === "unlicensed"
                  ? "All active students in this branch are licensed."
                  : "No students found."}
              </p>
            ) : (
              <div className="eduos-table-wrap">
                <table className="eduos-admin-table">
                  <thead>
                    <tr>
                      <th>Student</th>
                      <th className="eduos-admin-table__nowrap">Roll no.</th>
                      <th className="eduos-admin-table__nowrap">Enrolled</th>
                      <th className="eduos-admin-table__nowrap">License</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((s) => (
                      <tr key={s.id}>
                        <td style={{ fontWeight: 600 }}>{s.studentName || "—"}</td>
                        <td className="eduos-admin-table__nowrap">{s.admissionNumber ?? "—"}</td>
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
    </AdminShell>
  );
}
