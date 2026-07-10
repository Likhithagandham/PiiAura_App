"use client";

import type { FacultyPayslipData } from "@eduos/types";
import { useMemo, useState } from "react";
import { FacultyShell } from "@/components/faculty/FacultyShell";
import { useApiData } from "@/lib/queries";
import {
  Button,
  ChartLegend,
  DonutChart,
  EmptyState,
  IconCalendar,
  IconCheckCircle,
  IconClock,
  SkeletonText,
  StatCard,
} from "@eduos/ui";

function downloadBlob(fileName: string, content: string, mime = "application/pdf") {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(url);
}

async function postExport(action: "export_form16" | "export_pf", fields: { year?: string; month?: string }) {
  const res = await fetch("/api/faculty/payslip", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, ...fields }),
  });
  if (!res.ok) {
    const json = await res.json().catch(() => ({}));
    throw new Error((json as { error?: string }).error ?? "Export failed");
  }
  const blob = await res.blob();
  const disposition = res.headers.get("Content-Disposition") ?? "";
  const match = disposition.match(/filename="([^"]+)"/);
  const fileName = match?.[1] ?? (action === "export_form16" ? "form16.csv" : "pf.csv");
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(url);
}

export default function FacultySalaryPage() {
  // Selected payroll month drives the query URL; null means "use the server default".
  const [monthOverride, setMonthOverride] = useState<string | null>(null);
  const url = useMemo(
    () =>
      `/api/faculty/payslip${
        monthOverride ? `?month=${encodeURIComponent(monthOverride)}` : ""
      }`,
    [monthOverride],
  );
  const { data, error: queryError, refetch } = useApiData<FacultyPayslipData>(url);
  const load = refetch;
  const month = monthOverride ?? data?.selectedMonth ?? "";
  const [form16Year, setForm16Year] = useState(String(new Date().getFullYear()));
  const [pfMonthOverride, setPfMonthOverride] = useState<string | null>(null);
  const pfMonth = pfMonthOverride ?? data?.selectedMonth ?? new Date().toISOString().slice(0, 7);
  const [exportError, setExportError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [exporting, setExporting] = useState<string | null>(null);

  const error = exportError ?? (queryError ? "Failed to load." : null);

  async function runExport(kind: "export_form16" | "export_pf") {
    setMessage(null);
    setExportError(null);
    setExporting(kind);
    try {
      if (kind === "export_form16") await postExport(kind, { year: form16Year });
      else await postExport(kind, { month: pfMonth });
      setMessage("Download started.");
    } catch (e) {
      setExportError(e instanceof Error ? e.message : "Export failed");
    } finally {
      setExporting(null);
    }
  }

  return (
    <FacultyShell title="My salary">
      <p className="eduos-section-desc" style={{ margin: 0 }}>
        View and download only your own payslips and compliance documents.
      </p>

      {error ? <p className="eduos-admin-message eduos-admin-message--error">{error}</p> : null}
      {message ? <p className="eduos-admin-message">{message}</p> : null}

      <section className="eduos-panel">
        <h2 className="eduos-section-title">Salary slip</h2>
        <p className="eduos-section-desc">
          Download PDF from processed payroll. Stored in S3 with a signed URL (mock).
        </p>

        {!data ? (
          <SkeletonText lines={4} />
        ) : (
          <>
            {data.employeeName ? (
              <p className="eduos-lead" style={{ marginBottom: "0.5rem" }}>
                <strong>{data.employeeName}</strong>
                {data.employeeId ? (
                  <span style={{ color: "var(--eduos-text-muted)" }}> · {data.employeeId}</span>
                ) : null}
              </p>
            ) : (
              <p className="eduos-admin-message eduos-admin-message--error">
                No HR employee record linked to your account.
              </p>
            )}

            {data.months.length > 0
              ? (() => {
                  const processed = data.months.filter((m) => m.status === "processed").length;
                  const draft = data.months.length - processed;
                  const segments = [
                    { label: "Processed", value: processed, color: "#1a5f4a" },
                    { label: "Draft", value: draft, color: "#d69e2e" },
                  ].filter((s) => s.value > 0);
                  return (
                    <>
                      <div className="eduos-admin-stat-grid" style={{ marginBottom: "0.75rem" }}>
                        <StatCard label="Payslip months" value={data.months.length} icon={<IconCalendar />} accent="#2563eb" />
                        <StatCard label="Processed" value={processed} icon={<IconCheckCircle />} accent="#1a5f4a" />
                        <StatCard label="Draft" value={draft} icon={<IconClock />} accent="#d69e2e" />
                      </div>
                      {segments.length > 1 ? (
                        <div className="eduos-chart-split" style={{ marginBottom: "0.75rem" }}>
                          <DonutChart data={segments} centerValue={data.months.length} centerLabel="months" />
                          <div className="eduos-chart-split__legend">
                            <ChartLegend
                              items={segments.map((s) => ({ label: s.label, color: s.color, value: s.value }))}
                            />
                          </div>
                        </div>
                      ) : null}
                    </>
                  );
                })()
              : null}

            <div className="eduos-portal-toolbar">
              <label style={{ fontSize: "0.8125rem" }}>
                Payroll month
                <select
                  className="eduos-input eduos-input--field"
                  value={month}
                  onChange={(e) => setMonthOverride(e.target.value)}
                  style={{ display: "block", marginTop: "0.2rem" }}
                >
                  {data.months.length === 0 ? (
                    <option value={data.selectedMonth}>{data.selectedMonth}</option>
                  ) : null}
                  {data.months.map((m) => (
                    <option key={m.month} value={m.month}>
                      {m.label}
                    </option>
                  ))}
                </select>
              </label>
              <Button type="button" variant="secondary" className="eduos-admin-btn-sm" onClick={() => load()}>
                Refresh
              </Button>
            </div>

            {!data.result ? (
              <EmptyState compact title="No payslip for this month" description="Choose another month or check back after payroll is processed." />
            ) : !data.result.canDownload ? (
              <p className="eduos-admin-message eduos-admin-message--error" style={{ marginTop: "0.5rem" }}>
                {data.result.blockedReason}
              </p>
            ) : (
              <div style={{ marginTop: "0.625rem" }}>
                <div className="eduos-portal-toolbar">
                  <span style={{ fontWeight: 600, fontSize: "0.8125rem" }}>{data.result.fileName}</span>
                  <Button
                    type="button"
                    className="eduos-admin-btn-sm"
                    onClick={() => downloadBlob(data.result!.fileName, data.result!.content)}
                  >
                    Download PDF
                  </Button>
                </div>
                {data.result.s3Key ? (
                  <p className="eduos-empty eduos-empty--sm" style={{ marginTop: "0.35rem" }}>
                    S3: <code>{data.result.s3Key}</code>
                    {data.result.downloadUrl ? (
                      <>
                        {" "}
                        ·{" "}
                        <a href={data.result.downloadUrl} className="eduos-link" target="_blank" rel="noreferrer">
                          Signed URL
                        </a>
                        {data.result.downloadUrlExpiresAt ? (
                          <span> (expires {new Date(data.result.downloadUrlExpiresAt).toLocaleString()})</span>
                        ) : null}
                      </>
                    ) : null}
                  </p>
                ) : null}
              </div>
            )}
          </>
        )}
      </section>

      <section className="eduos-panel">
        <h2 className="eduos-section-title">Form 16 &amp; PF</h2>
        <p className="eduos-section-desc">Basic compliance exports for your employee record only.</p>

        <div className="eduos-admin-grid-2" style={{ marginTop: "0.5rem" }}>
          <div>
            <label style={{ fontSize: "0.8125rem", fontWeight: 600 }}>Form 16</label>
            <div className="eduos-portal-toolbar" style={{ marginTop: "0.35rem" }}>
              <input
                type="number"
                className="eduos-input eduos-input--compact"
                style={{ width: "5.5rem" }}
                value={form16Year}
                onChange={(e) => setForm16Year(e.target.value)}
              />
              <Button
                type="button"
                variant="secondary"
                className="eduos-admin-btn-sm"
                disabled={exporting === "export_form16"}
                onClick={() => void runExport("export_form16")}
              >
                Export CSV
              </Button>
            </div>
          </div>
          <div>
            <label style={{ fontSize: "0.8125rem", fontWeight: 600 }}>PF statement</label>
            <div className="eduos-portal-toolbar" style={{ marginTop: "0.35rem" }}>
              <input
                type="month"
                className="eduos-input eduos-input--field"
                style={{ maxWidth: "10rem" }}
                value={pfMonth}
                onChange={(e) => setPfMonthOverride(e.target.value)}
              />
              <Button
                type="button"
                variant="secondary"
                className="eduos-admin-btn-sm"
                disabled={exporting === "export_pf"}
                onClick={() => void runExport("export_pf")}
              >
                Export CSV
              </Button>
            </div>
          </div>
        </div>
      </section>
    </FacultyShell>
  );
}
