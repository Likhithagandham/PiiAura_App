"use client";

import type { StudentApplyLeaveInput, StudentLeaveData } from "@eduos/types";
import { Button, EmptyState, SkeletonTable, TruncatedText } from "@eduos/ui";
import { useState } from "react";
import { LeaveRequestStatusTag } from "@/components/shared/LeaveRequestStatusTag";
import { StudentShell } from "@/components/student/StudentShell";
import { useApiData } from "@/lib/queries";

export default function StudentLeavePage() {
  const { data, error: queryError, refetch } = useApiData<StudentLeaveData>("/api/student/leave");
  const load = refetch;
  const error = queryError ? "Failed to load." : null;
  const [message, setMessage] = useState<string | null>(null);
  const [form, setForm] = useState<StudentApplyLeaveInput>({
    fromDate: new Date().toISOString().slice(0, 10),
    toDate: new Date().toISOString().slice(0, 10),
    reason: "",
  });

  return (
    <StudentShell title="Leave">
      {error ? <p className="eduos-admin-message eduos-admin-message--error">{error}</p> : null}
      {message ? <p className="eduos-admin-message">{message}</p> : null}

      <section className="eduos-panel">
        <h2 className="eduos-section-title">Apply for leave</h2>
        <p className="eduos-section-desc">
          Submit a leave request. Faculty or admin will approve or reject it.
        </p>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(9rem, 1fr))",
            gap: "0.5rem",
            marginTop: "0.5rem",
            maxWidth: "28rem",
          }}
        >
          <label style={{ fontSize: "0.8125rem" }}>
            From
            <input
              type="date"
              className="eduos-input eduos-input--field"
              style={{ display: "block", marginTop: "0.2rem" }}
              value={form.fromDate}
              onChange={(e) => setForm((p) => ({ ...p, fromDate: e.target.value }))}
            />
          </label>
          <label style={{ fontSize: "0.8125rem" }}>
            To
            <input
              type="date"
              className="eduos-input eduos-input--field"
              style={{ display: "block", marginTop: "0.2rem" }}
              value={form.toDate}
              onChange={(e) => setForm((p) => ({ ...p, toDate: e.target.value }))}
            />
          </label>
        </div>
        <textarea
          className="eduos-input"
          rows={2}
          placeholder="Reason"
          value={form.reason}
          onChange={(e) => setForm((p) => ({ ...p, reason: e.target.value }))}
          style={{ marginTop: "0.5rem", maxWidth: "28rem" }}
        />
        <div style={{ marginTop: "0.5rem" }}>
          <Button
            type="button"
            className="eduos-admin-btn-sm"
            onClick={async () => {
              setMessage(null);
              const res = await fetch("/api/student/leave", {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
              });
              const json = await res.json().catch(() => ({}));
              if (!res.ok) {
                setMessage((json as { error?: string }).error ?? "Submit failed");
                return;
              }
              setMessage("Leave request submitted.");
              setForm((p) => ({ ...p, reason: "" }));
              await load();
            }}
          >
            Submit
          </Button>
        </div>
      </section>

      <section className="eduos-panel">
        <h2 className="eduos-section-title">My requests</h2>
        <div className="eduos-table-wrap">
          {!data ? (
            <SkeletonTable columns={5} rows={5} />
          ) : data.requests.length === 0 ? (
            <EmptyState title="No leave requests yet" description="Submit a request above and track its status here." />
          ) : (
            <table className="eduos-admin-table">
              <thead>
                <tr>
                  <th>Dates</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th>Decision</th>
                  <th>Applied</th>
                </tr>
              </thead>
              <tbody>
                {data.requests.map((r) => (
                  <tr key={r.id}>
                    <td className="eduos-admin-table__nowrap">
                      {r.fromDate} → {r.toDate}
                    </td>
                    <td className="eduos-admin-table__reason">
                      <TruncatedText text={r.reason} maxWidth="16rem" />
                    </td>
                    <td>
                      <LeaveRequestStatusTag status={r.status} />
                    </td>
                    <td style={{ fontSize: "0.8125rem", color: "var(--eduos-text-muted)" }}>
                      {r.status === "pending"
                        ? "Awaiting review"
                        : r.reviewedByName
                          ? `${r.status === "approved" ? "Approved" : "Rejected"} by ${r.reviewedByName}`
                          : "—"}
                      {r.reviewNote ? ` · ${r.reviewNote}` : null}
                    </td>
                    <td className="eduos-admin-table__nowrap" style={{ color: "var(--eduos-text-muted)" }}>
                      {new Date(r.appliedAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </StudentShell>
  );
}
