"use client";

import type { ParentApplyLeaveInput, ParentLeaveData } from "@eduos/types";
import { Button, EmptyState, SkeletonTable, TruncatedText } from "@eduos/ui";
import { useCallback, useEffect, useState } from "react";
import { LeaveRequestStatusTag } from "@/components/shared/LeaveRequestStatusTag";
import { parentApiUrl, useParentChild } from "@/lib/parent/parent-child-context";

export default function ParentLeavePage() {
  const { childId, activeChild } = useParentChild();
  const [data, setData] = useState<ParentLeaveData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [form, setForm] = useState<ParentApplyLeaveInput>({
    fromDate: new Date().toISOString().slice(0, 10),
    toDate: new Date().toISOString().slice(0, 10),
    reason: "",
  });

  const load = useCallback(async () => {
    if (!childId) return;
    setError(null);
    const res = await fetch(parentApiUrl("/api/parent/leave", childId), { credentials: "include" });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError((json as { error?: string }).error ?? "Failed to load");
      return;
    }
    setData(json as ParentLeaveData);
  }, [childId]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <>
      <p className="eduos-section-desc">
        Apply leave on behalf of {activeChild?.name ?? "your child"}. Faculty or admin
        approves or rejects each request.
      </p>
      {error ? <p className="eduos-admin-message eduos-admin-message--error">{error}</p> : null}
      {message ? <p className="eduos-admin-message">{message}</p> : null}

      <section className="eduos-panel">
        <h2 className="eduos-section-title">New request</h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(9rem, 1fr))",
            gap: "0.5rem",
            maxWidth: "28rem",
          }}
        >
          <label style={{ fontSize: "0.8125rem" }}>
            From
            <input
              type="date"
              className="eduos-input eduos-input--field"
              style={{ display: "block", marginTop: "0.25rem", width: "100%" }}
              value={form.fromDate}
              onChange={(e) => setForm((f) => ({ ...f, fromDate: e.target.value }))}
            />
          </label>
          <label style={{ fontSize: "0.8125rem" }}>
            To
            <input
              type="date"
              className="eduos-input eduos-input--field"
              style={{ display: "block", marginTop: "0.25rem", width: "100%" }}
              value={form.toDate}
              onChange={(e) => setForm((f) => ({ ...f, toDate: e.target.value }))}
            />
          </label>
        </div>
        <label style={{ fontSize: "0.8125rem", display: "block", marginTop: "0.5rem", maxWidth: "28rem" }}>
          Reason
          <textarea
            className="eduos-input eduos-input--field"
            rows={3}
            style={{ display: "block", marginTop: "0.25rem", width: "100%" }}
            value={form.reason}
            onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))}
          />
        </label>
        <Button
          type="button"
          className="eduos-admin-btn-sm"
          style={{ marginTop: "0.75rem" }}
          onClick={async () => {
            if (!childId) return;
            setMessage(null);
            const res = await fetch(parentApiUrl("/api/parent/leave", childId), {
              method: "POST",
              credentials: "include",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(form),
            });
            const json = await res.json().catch(() => ({}));
            if (!res.ok) {
              setMessage((json as { error?: string }).error ?? "Could not submit");
              return;
            }
            setMessage("Leave request submitted.");
            await load();
          }}
        >
          Submit for child
        </Button>
      </section>

      <section className="eduos-panel">
        <h2 className="eduos-section-title">Requests</h2>
        {!data ? (
          <SkeletonTable columns={4} rows={5} />
        ) : data.requests.length === 0 ? (
          <EmptyState title="No leave requests" description="Requests you submit for your child will appear here." />
        ) : (
          <div className="eduos-table-wrap">
            <table className="eduos-admin-table">
              <thead>
                <tr>
                  <th>Dates</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th>Decision</th>
                </tr>
              </thead>
              <tbody>
                {data.requests.map((r) => (
                  <tr key={r.id}>
                    <td className="eduos-admin-table__nowrap">
                      {r.fromDate} → {r.toDate}
                    </td>
                    <td>
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
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}
