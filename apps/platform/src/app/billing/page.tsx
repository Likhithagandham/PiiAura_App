"use client";

import Link from "next/link";
import type { PlatformLicensingOverview } from "@eduos/types";
import {
  IconAlertTriangle,
  IconCheckCircle,
  IconRupee,
  IconUsers,
  IconWallet,
  SkeletonText,
  StatCard,
  TruncatedText,
} from "@eduos/ui";
import { PlatformOwnerShell } from "@/components/platform-owner/PlatformOwnerShell";
import { ApiError } from "@/lib/api-client";
import { useApiData } from "@/lib/queries";

function formatInr(n: number | undefined | null): string {
  if (n == null || !Number.isFinite(n)) return "—";
  return `₹${n.toLocaleString("en-IN")}`;
}

function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export default function PlatformBillingPage() {
  const { data, error: queryError } = useApiData<PlatformLicensingOverview>(
    "/api/platform-owner/licensing/overview",
  );
  const error = queryError
    ? queryError instanceof ApiError
      ? queryError.message
      : "Failed to load billing"
    : null;

  return (
    <PlatformOwnerShell title="Billing & licensing">
      {error ? <p className="eduos-admin-message eduos-admin-message--error">{error}</p> : null}

      {!data ? (
        <SkeletonText lines={4} />
      ) : (
        <>
          <div className="eduos-admin-stat-grid">
            <StatCard
              label="Schools"
              value={data.kpis.totalSchools}
              icon={<IconUsers />}
              accent="#2563eb"
            />
            <StatCard
              label="Licensed students"
              value={data.kpis.totalLicensedStudents.toLocaleString("en-IN")}
              icon={<IconCheckCircle />}
              accent="#1a5f4a"
            />
            <StatCard
              label="Unpaid students"
              value={data.kpis.totalUnlicensedStudents.toLocaleString("en-IN")}
              icon={<IconAlertTriangle />}
              accent="#dc2626"
            />
            <StatCard
              label="Pending collections"
              value={formatInr(data.kpis.pendingCollectionsInr)}
              icon={<IconRupee />}
              accent="#d69e2e"
            />
            <StatCard
              label="Revenue collected"
              value={formatInr(data.kpis.revenueCollectedInr)}
              icon={<IconWallet />}
              accent="#1a5f4a"
            />
            <StatCard
              label="Schools requiring billing"
              value={data.kpis.schoolsRequiringBilling}
              icon={<IconAlertTriangle />}
              accent="#7c3aed"
            />
          </div>

          {data.upcomingRenewals.length > 0 ? (
            <section className="eduos-panel">
              <h2 className="eduos-section-title">Upcoming renewals (next 60 days)</h2>
              <p className="eduos-section-desc">
                Renewal amount is based on total licenses consumed, not current headcount.
              </p>
              <div className="eduos-table-wrap">
                <table className="eduos-admin-table">
                  <thead>
                    <tr>
                      <th>School</th>
                      <th className="eduos-admin-table__nowrap">Subscription ends</th>
                      <th className="eduos-admin-table__nowrap">Licenses consumed</th>
                      <th className="eduos-admin-table__nowrap">Renewal amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.upcomingRenewals.map((r) => (
                      <tr key={r.tenantId}>
                        <td style={{ fontWeight: 600 }}>
                          <Link href={`/billing/${r.tenantId}`} className="eduos-link">
                            {r.tenantName}
                          </Link>
                        </td>
                        <td className="eduos-admin-table__nowrap">{formatDate(r.endDate)}</td>
                        <td className="eduos-admin-table__nowrap">{r.licensesConsumed}</td>
                        <td className="eduos-admin-table__nowrap">{formatInr(r.renewalAmountInr)}</td>
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
                <h2 className="eduos-section-title">Licensing by school</h2>
                <p className="eduos-section-desc">
                  One license per student, consumed permanently. Unpaid students convert
                  oldest-first when a payment is recorded.
                </p>
              </div>
            </div>
            <div className="eduos-table-wrap">
              <table className="eduos-admin-table">
                <thead>
                  <tr>
                    <th>School</th>
                    <th className="eduos-admin-table__nowrap">Subdomain</th>
                    <th className="eduos-admin-table__nowrap">Purchased</th>
                    <th className="eduos-admin-table__nowrap">Consumed</th>
                    <th className="eduos-admin-table__nowrap">Unpaid students</th>
                    <th className="eduos-admin-table__nowrap">Pending amount</th>
                    <th className="eduos-admin-table__nowrap">Period ends</th>
                    <th className="eduos-admin-table__nowrap" />
                  </tr>
                </thead>
                <tbody>
                  {data.schools.map((row) => (
                    <tr key={row.tenantId}>
                      <td style={{ fontWeight: 600 }}>
                        <Link href={`/billing/${row.tenantId}`} className="eduos-link">
                          <TruncatedText text={row.tenantName} maxWidth="16rem" />
                        </Link>
                      </td>
                      <td className="eduos-admin-table__nowrap">
                        <code>{row.subdomain}</code>
                      </td>
                      <td className="eduos-admin-table__nowrap">{row.licensesPurchased}</td>
                      <td className="eduos-admin-table__nowrap">{row.licensesConsumed}</td>
                      <td className="eduos-admin-table__nowrap">
                        {row.unlicensedStudents > 0 ? (
                          <strong style={{ color: "#dc2626" }}>{row.unlicensedStudents}</strong>
                        ) : (
                          0
                        )}
                      </td>
                      <td className="eduos-admin-table__nowrap">{formatInr(row.pendingAmountInr)}</td>
                      <td className="eduos-admin-table__nowrap">{formatDate(row.period?.endDate)}</td>
                      <td className="eduos-admin-table__nowrap">
                        <Link href={`/billing/${row.tenantId}`} className="eduos-link">
                          Manage
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </PlatformOwnerShell>
  );
}
