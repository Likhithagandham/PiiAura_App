"use client";

import { useState } from "react";
import { Button } from "@eduos/ui";

interface ExportReport {
  status: string;
  downloadUrl?: string;
  rowCount?: number;
  error?: string;
}

interface ExportCsvButtonProps {
  /** BFF POST route, e.g. "/api/student/exports/attendance" */
  endpoint: string;
  /** Extra JSON body fields (e.g. { fromDate, toDate }) */
  params?: Record<string, unknown>;
  label?: string;
}

export function ExportCsvButton({ endpoint, params, label = "Download CSV" }: ExportCsvButtonProps) {
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);

  async function handleClick() {
    setPending(true);
    setMessage(null);
    setIsError(false);
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params ?? {}),
      });
      const json = (await res.json().catch(() => ({}))) as { report?: ExportReport; error?: string };
      if (!res.ok) {
        throw new Error(json.error ?? "Export failed");
      }
      const report = json.report;
      if (report?.status === "ready" && report.downloadUrl) {
        window.open(report.downloadUrl, "_blank");
        setMessage(report.rowCount === 0 ? "No rows to export." : "Download started.");
      } else if (report?.status === "failed") {
        throw new Error(report.error ?? "Export failed.");
      } else {
        setMessage("Export queued — check back shortly.");
      }
    } catch (err) {
      setIsError(true);
      setMessage(err instanceof Error ? err.message : "Export failed");
    } finally {
      setPending(false);
    }
  }

  return (
    <div style={{ display: "inline-flex", flexDirection: "column", gap: "0.25rem" }}>
      <Button
        type="button"
        variant="secondary"
        onClick={handleClick}
        disabled={pending}
        style={{ width: "auto", padding: "0.4rem 0.75rem", fontSize: "0.8125rem", fontWeight: 600 }}
      >
        {pending ? "Exporting…" : label}
      </Button>
      {message ? (
        <span
          style={{
            fontSize: "0.75rem",
            color: isError ? "var(--eduos-danger)" : "var(--eduos-text-muted)",
          }}
        >
          {message}
        </span>
      ) : null}
    </div>
  );
}
