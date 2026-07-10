"use client";

import Link from "next/link";
import { useState } from "react";
import type { ExportJob, ReportDefinition, ReportModuleId } from "@eduos/types";
import { LARGE_EXPORT_ROW_THRESHOLD } from "@eduos/constants";
import { Button, EmptyState, Input, SkeletonText } from "@eduos/ui";
import { StudentPerformanceChat } from "./StudentPerformanceChat";
import { useApiData } from "@/lib/queries";
import { AdminShell } from "../AdminShell";
import { AdminTabs, AdminMessage } from "../ui";

type Tab = "exports" | "history";

const MODULE_LABELS: Record<ReportModuleId, string> = {
  admissions: "Admissions",
  fees: "Fees",
  attendance: "Attendance",
  examinations: "Examinations",
  hr: "HR",
  academics: "Academics",
};

const STATUS_LABELS: Record<string, string> = {
  queued: "Queued",
  processing: "Processing",
  running: "Processing",
  ready: "Ready",
  failed: "Failed",
};

function idempotencyHeaders(): HeadersInit {
  return {
    "Content-Type": "application/json",
    "Idempotency-Key": `reports-${Date.now()}-${Math.random().toString(36).slice(2)}`,
  };
}

export function ReportsView() {
  const [tab, setTab] = useState<Tab>("exports");
  const [exporting, setExporting] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [attendanceYear, setAttendanceYear] = useState(String(new Date().getFullYear()));
  const [attendanceMonth, setAttendanceMonth] = useState(String(new Date().getMonth() + 1));

  const { data: reportsData, error: reportsError, refetch: loadReports } = useApiData<{
    reports?: ReportDefinition[];
  }>("/api/admin/reports");
  const reports = reportsError ? [] : reportsData?.reports ?? null;
  const loadError = reportsError ? "Could not load reports." : null;

  const { data: jobsData, refetch: loadJobs } = useApiData<{ jobs?: ExportJob[] }>(
    "/api/admin/reports/jobs",
    {
      // Poll every 5s only while a job is queued/processing.
      refetchInterval: (query) => {
        const list = query.state.data?.jobs ?? [];
        return list.some((j) => j.status === "queued" || j.status === "processing" || j.status === "running")
          ? 5000
          : false;
      },
    },
  );
  const jobs = jobsData?.jobs ?? [];

  async function handleExport(report: ReportDefinition) {
    if (report.comingSoon || report.linkHref) return;
    setExporting(report.id);
    setMessage(null);
    try {
      const params =
        report.id === "attendance_monthly"
          ? { year: Number(attendanceYear), month: Number(attendanceMonth) }
          : undefined;
      const res = await fetch("/api/admin/reports/export", {
        method: "POST",
        credentials: "include",
        headers: idempotencyHeaders(),
        body: JSON.stringify({ reportId: report.id, params }),
      });
      const job = await res.json();
      if (!res.ok) throw new Error(job.error ?? "Export failed");

      if (job.status === "ready" && job.downloadUrl) {
        window.open(job.downloadUrl, "_blank");
        setMessage("Download started.");
      } else {
        setMessage(`Large export queued (${job.rowCount} rows). Check Export history for status.`);
        setTab("history");
      }
      await loadJobs();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Export failed");
    } finally {
      setExporting(null);
    }
  }

  const grouped = (reports ?? []).reduce(
    (acc, r) => {
      if (!acc[r.module]) acc[r.module] = [];
      acc[r.module].push(r);
      return acc;
    },
    {} as Record<ReportModuleId, ReportDefinition[]>,
  );

  const tabs = [
    { id: "exports" as const, label: "Module exports" },
    { id: "history" as const, label: "Export history" },
  ];

  return (
    <AdminShell title="Reports">
      <p className="eduos-section-desc" style={{ marginBottom: "1rem" }}>
        Download CSV snapshots of branch data. Exports over {LARGE_EXPORT_ROW_THRESHOLD} rows run in the
        background — check Export history for status.
      </p>

      <AdminTabs
        tabs={tabs}
        active={tab}
        onChange={(id) => {
          setTab(id);
          setMessage(null);
        }}
      />

      <AdminMessage>{message}</AdminMessage>

      {tab === "exports" ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", marginTop: "0.75rem" }}>
          <StudentPerformanceChat />
          {reports === null ? (
            <SkeletonText lines={4} />
          ) : loadError ? (
            <EmptyState title="Could not load reports" description={loadError} />
          ) : reports.length === 0 ? (
            <EmptyState title="No reports available" description="Report exports will appear here." />
          ) : (
            (Object.keys(grouped) as ReportModuleId[]).map((mod) => (
              <section key={mod}>
                <h2 className="eduos-section-title" style={{ marginBottom: "0.75rem" }}>
                  {MODULE_LABELS[mod]}
                </h2>
                <div className="eduos-admin-grid-auto">
                  {grouped[mod]!.map((r) => (
                    <div key={r.id} className="eduos-report-card">
                      <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", flexWrap: "wrap" }}>
                        <h3 style={{ margin: 0 }}>{r.name}</h3>
                        {r.comingSoon ? (
                          <span className="eduos-tag">Coming soon</span>
                        ) : null}
                      </div>
                      <p className="eduos-section-desc" style={{ marginTop: "0.375rem" }}>
                        {r.description}
                      </p>
                      {r.id === "attendance_monthly" ? (
                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns: "1fr 1fr",
                            gap: "0.5rem",
                            marginTop: "0.75rem",
                          }}
                        >
                          <Input
                            label="Year"
                            type="number"
                            value={attendanceYear}
                            onChange={(e) => setAttendanceYear(e.target.value)}
                          />
                          <Input
                            label="Month"
                            type="number"
                            min={1}
                            max={12}
                            value={attendanceMonth}
                            onChange={(e) => setAttendanceMonth(e.target.value)}
                          />
                        </div>
                      ) : null}
                      <div style={{ marginTop: "1rem" }}>
                        {r.linkHref ? (
                          <Link href={r.linkHref} className="eduos-btn eduos-btn-primary eduos-admin-btn-sm">
                            Open Examinations
                          </Link>
                        ) : (
                          <Button
                            type="button"
                            disabled={exporting === r.id || r.comingSoon}
                            onClick={() => handleExport(r)}
                          >
                            {exporting === r.id ? "Exporting…" : "Download CSV"}
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ))
          )}
        </div>
      ) : null}

      {tab === "history" ? (
        <section className="eduos-panel" style={{ marginTop: "0.75rem" }}>
          <h2 className="eduos-section-title">Export history</h2>
          {jobs.length === 0 ? (
            <EmptyState title="No exports yet" description="Run a module export to see jobs here." />
          ) : (
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {jobs.map((j) => (
                <li
                  key={j.id}
                  style={{
                    padding: "0.875rem 0",
                    borderBottom: "1px solid var(--eduos-border)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: "1rem",
                      flexWrap: "wrap",
                      alignItems: "flex-start",
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600 }}>{j.reportName}</div>
                      <div style={{ fontSize: "0.8125rem", color: "var(--eduos-text-muted)" }}>
                        {j.rowCount} rows · Requested {new Date(j.createdAt).toLocaleString()}
                      </div>
                      {j.error ? (
                        <div style={{ fontSize: "0.75rem", color: "var(--eduos-danger)", marginTop: "0.25rem" }}>
                          {j.error}
                        </div>
                      ) : null}
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--eduos-text-muted)" }}>
                        {STATUS_LABELS[j.status] ?? j.status}
                      </span>
                      {j.status === "ready" && j.downloadUrl ? (
                        <div style={{ marginTop: "0.375rem", fontSize: "0.8125rem" }}>
                          <a href={j.downloadUrl} style={{ color: "var(--eduos-primary)", fontWeight: 600 }}>
                            Download CSV
                          </a>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : null}
    </AdminShell>
  );
}
