"use client";

import type { PipelineNotificationBatch } from "@eduos/types";
import { Button } from "@eduos/ui";
import { AdminModal } from "../AdminModal";

const STAGE_LABELS: Record<string, string> = {
  enquiry: "Enquiry",
  application: "Application",
  documents: "Documents",
  verification: "Verification",
  enrollment: "Enrolled",
};

function statusColor(status: string): string {
  if (status === "sent") return "var(--eduos-primary)";
  if (status === "failed") return "var(--eduos-danger)";
  return "var(--eduos-text-muted)";
}

export function PipelineNotificationsModal({
  batch,
  onClose,
  onRetry,
  retrying = false,
}: {
  batch: PipelineNotificationBatch;
  onClose: () => void;
  onRetry?: () => void;
  retrying?: boolean;
}) {
  const smsSent = batch.recipients.filter((r) => r.smsStatus === "sent").length;
  const emailSent = batch.recipients.filter((r) => r.emailStatus === "sent").length;
  const failed = batch.recipients.filter(
    (r) => r.smsStatus === "failed" || r.emailStatus === "failed",
  ).length;

  return (
    <AdminModal title="Pipeline notifications sent" onClose={onClose}>
      <p style={{ fontSize: "0.875rem", marginBottom: "0.75rem" }}>
        <strong>{batch.applicantName}</strong> — {STAGE_LABELS[batch.fromStage] ?? batch.fromStage}{" "}
        → {STAGE_LABELS[batch.toStage] ?? batch.toStage}
      </p>
      <p style={{ fontSize: "0.8125rem", color: "var(--eduos-text-muted)", marginBottom: "1rem" }}>
        {batch.message}
      </p>
      <div
        style={{
          display: "flex",
          gap: "1rem",
          fontSize: "0.8125rem",
          marginBottom: "1rem",
          flexWrap: "wrap",
        }}
      >
        <span>SMS sent: {smsSent}</span>
        <span>Email sent: {emailSent}</span>
        {failed > 0 ? (
          <span style={{ color: "var(--eduos-danger)" }}>Failed: {failed}</span>
        ) : null}
      </div>
      <table className="eduos-admin-table">
        <thead>
          <tr style={{ textAlign: "left", borderBottom: "1px solid var(--eduos-border)" }}>
            <th style={{ padding: "0.5rem 0.25rem" }}>Recipient</th>
            <th style={{ padding: "0.5rem 0.25rem" }}>SMS</th>
            <th style={{ padding: "0.5rem 0.25rem" }}>Email</th>
          </tr>
        </thead>
        <tbody>
          {batch.recipients.map((r) => (
            <tr key={r.label} style={{ borderBottom: "1px solid var(--eduos-border)" }}>
              <td style={{ padding: "0.5rem 0.25rem" }}>
                <div style={{ fontWeight: 600 }}>{r.label}</div>
                <div style={{ fontSize: "0.75rem", color: "var(--eduos-text-muted)" }}>
                  {r.phone ?? "—"}
                  {r.email ? ` · ${r.email}` : ""}
                </div>
              </td>
              <td style={{ padding: "0.5rem 0.25rem", color: statusColor(r.smsStatus) }}>
                {r.smsStatus}
              </td>
              <td style={{ padding: "0.5rem 0.25rem", color: statusColor(r.emailStatus) }}>
                {r.emailStatus}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p style={{ fontSize: "0.75rem", color: "var(--eduos-text-muted)", marginTop: "1rem" }}>
        Sent {new Date(batch.sentAt).toLocaleString()}
      </p>
      <div
        style={{
          marginTop: "1rem",
          display: "flex",
          flexDirection: "column",
          gap: "0.5rem",
        }}
      >
        {failed > 0 && onRetry ? (
          <Button type="button" onClick={onRetry} disabled={retrying}>
            {retrying ? "Retrying…" : "Retry failed notifications"}
          </Button>
        ) : null}
        <Button type="button" variant={failed > 0 ? "secondary" : undefined} onClick={onClose}>
          Done
        </Button>
      </div>
    </AdminModal>
  );
}
