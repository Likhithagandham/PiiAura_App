"use client";

import { useMemo, useState } from "react";
import {
  BarChart,
  EmptyState,
  IconAlertTriangle,
  IconBuilding,
  IconCalendar,
  IconRupee,
  IconUserCheck,
  IconUsers,
  StatCard,
  TruncatedText,
  chartColor,
  PortalWelcomeStrip,
  PortalDashboardSkeleton,
  PortalFilterBar,
  filterBySearch,
} from "@eduos/ui";
import { SuperAdminShell } from "@/components/super-admin/SuperAdminShell";
import { useSuperAdminDashboardQuery, useTenantBrandingQuery } from "@/lib/queries";

function alertSeverityClass(severity: string): string {
  if (severity === "critical") return "portal-alert-card--critical";
  if (severity === "warning") return "portal-alert-card--warning";
  return "portal-alert-card--info";
}

function severityTagClass(severity: string): string {
  if (severity === "critical") return "portal-severity-tag portal-severity-tag--critical";
  if (severity === "warning") return "portal-severity-tag portal-severity-tag--warning";
  return "portal-severity-tag portal-severity-tag--info";
}

function alertIconColor(severity: string): string {
  if (severity === "critical") return "#dc2626";
  if (severity === "warning") return "#d97706";
  return "#2563eb";
}

export default function SuperAdminDashboardPage() {
  const [branchSearch, setBranchSearch] = useState("");
  const [alertSeverity, setAlertSeverity] = useState<"all" | "critical" | "warning" | "info">("all");

  const { data, error: dashError } = useSuperAdminDashboardQuery();
  const { data: branding } = useTenantBrandingQuery();
  const error = dashError ? (dashError instanceof Error ? dashError.message : "Failed to load") : null;

  const filteredBranchKpis = useMemo(
    () => filterBySearch(data?.branchKpis ?? [], branchSearch, (k) => [k.branchName, k.branchId]),
    [data?.branchKpis, branchSearch],
  );

  const filteredAlerts = useMemo(() => {
    const rows = data?.alerts ?? [];
    if (alertSeverity === "all") return rows;
    return rows.filter((a) => a.severity === alertSeverity);
  }, [data?.alerts, alertSeverity]);

  return (
    <SuperAdminShell title="Dashboard">
      {error ? <p className="eduos-admin-message eduos-admin-message--error">{error}</p> : null}
      {!data ? (
        <PortalDashboardSkeleton statCount={6} />
      ) : (
        <div className="portal-dashboard-stack" data-tour="dashboard-main">
          <PortalWelcomeStrip
            eyebrow="Institution overview"
            title={branding?.institutionName ?? "Your institution"}
            description={`Consolidated metrics across ${data.branchesCount} branch${data.branchesCount === 1 ? "" : "es"} — students, attendance, and fee collection at a glance.`}
            badge={`${data.totalStudents.toLocaleString("en-IN")} students`}
          />

          <div className="eduos-admin-stat-grid" data-tour="dashboard-kpis">
            <StatCard label="Branches" value={data.branchesCount} icon={<IconBuilding />} />
            <StatCard
              label="Students"
              value={data.totalStudents}
              icon={<IconUsers />}
              accent="#2563eb"
            />
            <StatCard
              label="Faculty"
              value={data.totalFaculty}
              icon={<IconUserCheck />}
              accent="#7c3aed"
            />
            <StatCard
              label="Attendance"
              value={`${data.overallAttendancePercent}%`}
              icon={<IconCalendar />}
              accent="#1a5f4a"
            />
            <StatCard
              label="Fees collected"
              value={`₹${data.totalFeeCollected.toLocaleString("en-IN")}`}
              icon={<IconRupee />}
              accent="#1a5f4a"
            />
            <StatCard
              label="Fee due"
              value={`₹${data.totalFeeDue.toLocaleString("en-IN")}`}
              icon={<IconRupee />}
              accent="#d69e2e"
            />
          </div>

          <section className="eduos-panel">
            <div className="portal-panel-header">
              <h2 className="eduos-section-title">Branch KPIs</h2>
              <p className="eduos-section-desc">Consolidated view across branches.</p>
            </div>
            <PortalFilterBar
              search={branchSearch}
              onSearchChange={setBranchSearch}
              searchPlaceholder="Search branch name…"
              total={data.branchKpis.length}
              filtered={filteredBranchKpis.length}
            />
            {filteredBranchKpis.length > 0 ? (
              <div className="portal-chart-block">
                <h3 className="eduos-subsection-title">Attendance by branch</h3>
                <BarChart
                  data={filteredBranchKpis.map((k, i) => ({
                    label: k.branchName,
                    value: k.attendancePercent,
                    color: chartColor(i),
                    valueLabel: `${k.attendancePercent}%`,
                  }))}
                />
              </div>
            ) : null}
            <div className="eduos-table-wrap">
              <table className="eduos-admin-table">
                <thead>
                  <tr>
                    <th>Branch</th>
                    <th className="eduos-admin-table__nowrap">Students</th>
                    <th className="eduos-admin-table__nowrap">Faculty</th>
                    <th className="eduos-admin-table__nowrap">Attendance</th>
                    <th className="eduos-admin-table__nowrap">Fees collected</th>
                    <th className="eduos-admin-table__nowrap">Fee due</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBranchKpis.map((k) => (
                    <tr key={k.branchId}>
                      <td className="portal-table-emphasis">
                        <TruncatedText text={k.branchName} maxWidth="16rem" />
                      </td>
                      <td>{k.students}</td>
                      <td>{k.faculty}</td>
                      <td>{k.attendancePercent}%</td>
                      <td>₹{k.feeCollected.toLocaleString("en-IN")}</td>
                      <td>₹{k.feeDue.toLocaleString("en-IN")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="eduos-panel">
            <div className="portal-panel-header">
              <h2 className="eduos-section-title">Alerts</h2>
              <p className="eduos-section-desc">Active items that may need attention.</p>
            </div>
            <PortalFilterBar
              selects={[
                {
                  id: "severity",
                  label: "Severity",
                  value: alertSeverity,
                  onChange: (v) => setAlertSeverity(v as typeof alertSeverity),
                  options: [
                    { value: "all", label: "All severities" },
                    { value: "critical", label: "Critical" },
                    { value: "warning", label: "Warning" },
                    { value: "info", label: "Info" },
                  ],
                },
              ]}
            />
            {filteredAlerts.length === 0 ? (
              <EmptyState title="No alerts" description="There are no active alerts right now." />
            ) : (
              <div className="portal-alert-list">
                {filteredAlerts.slice(0, 6).map((a) => (
                  <div key={a.id} className={`portal-alert-card ${alertSeverityClass(a.severity)}`}>
                    <div className="portal-alert-card__head">
                      <div className="portal-alert-card__title">
                        <IconAlertTriangle size={16} color={alertIconColor(a.severity)} />
                        {a.title}
                      </div>
                      <span className={severityTagClass(a.severity)}>{a.severity}</span>
                    </div>
                    <div className="portal-alert-card__message">{a.message}</div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      )}
    </SuperAdminShell>
  );
}
