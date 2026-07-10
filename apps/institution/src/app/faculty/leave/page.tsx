"use client";

import type {
  FacultyApplyLeaveInput,
  FacultyLeaveData,
  FacultyMyLeaveData,
  HrLeaveRequest,
  LeaveRequest,
  ReviewLeaveInput,
} from "@eduos/types";
import { useMemo, useState } from "react";
import { LeaveRequestStatusTag } from "@/components/shared/LeaveRequestStatusTag";
import { FacultyShell } from "@/components/faculty/FacultyShell";
import { useApiData } from "@/lib/queries";
import { Button, EmptyState, Input, SkeletonTable, SkeletonText, TruncatedText } from "@eduos/ui";

export default function FacultyLeavePage() {
  const [mode, setMode] = useState<"apply" | "approve">("apply");
  const { data, error: dataError, refetch: refetchData } = useApiData<FacultyLeaveData>(
    "/api/faculty/leave",
  );
  const { data: mine, error: mineError, refetch: refetchMine } = useApiData<FacultyMyLeaveData>(
    "/api/faculty/my-leave",
  );
  const load = () => Promise.all([refetchData(), refetchMine()]);
  const error = dataError
    ? "Failed to load approval queue."
    : mineError
      ? "Failed to load your leave."
      : null;
  const [message, setMessage] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [apply, setApply] = useState<FacultyApplyLeaveInput>({
    leaveType: "casual",
    fromDate: new Date().toISOString().slice(0, 10),
    toDate: new Date().toISOString().slice(0, 10),
    reason: "",
  });

  const pending = useMemo(() => data?.pending ?? [], [data?.pending]);
  const myRequests = useMemo(() => mine?.requests ?? [], [mine?.requests]);
  const balances = useMemo(() => mine?.balances ?? [], [mine?.balances]);

  async function review(req: LeaveRequest, decision: "approved" | "rejected") {
    setMessage(null);
    const payload: ReviewLeaveInput = {
      requestId: req.id,
      approve: decision === "approved",
      reviewNote: note.trim() || undefined,
    };
    const res = await fetch("/api/faculty/leave", {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ payload }),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      setMessage((json as { error?: string }).error ?? "Review failed");
      return;
    }
    setNote("");
    setMessage(`Leave ${decision}.`);
    await load();
  }

  const tabBtn = (active: boolean): React.CSSProperties => ({
    padding: "0.35rem 0.65rem",
    fontSize: "0.8125rem",
    borderRadius: "var(--eduos-radius)",
    border: "1px solid var(--eduos-border)",
    background: active ? "var(--eduos-primary-light)" : "var(--eduos-card)",
    color: active ? "var(--eduos-primary)" : "var(--eduos-text)",
    fontWeight: active ? 700 : 500,
    cursor: "pointer",
  });

  return (
    <FacultyShell title="My leave">
      {error ? <p className="eduos-admin-message eduos-admin-message--error">{error}</p> : null}
      {message ? <p className="eduos-admin-message">{message}</p> : null}

      <div className="eduos-portal-toolbar">
        {(
          [
            { id: "apply" as const, label: "My leave" },
            { id: "approve" as const, label: "Student leave" },
          ] as const
        ).map((t) => (
          <button key={t.id} type="button" style={tabBtn(mode === t.id)} onClick={() => setMode(t.id)}>
            {t.label}
          </button>
        ))}
        <Button type="button" variant="secondary" className="eduos-admin-btn-sm" onClick={() => void load()}>
          Refresh
        </Button>
      </div>

      {mode === "apply" ? (
        <>
          <section className="eduos-panel">
            <h2 className="eduos-section-title">Leave balance</h2>
            <p className="eduos-section-desc">Remaining days before you apply.</p>
            {!mine ? (
              <SkeletonText lines={4} />
            ) : balances.length === 0 ? (
              <EmptyState compact title="No leave balance on file" description="Contact HR if this looks wrong." />
            ) : (
              <div className="eduos-admin-stat-grid" style={{ marginTop: "0.5rem" }}>
                {balances.map((b) => (
                  <div key={b.leaveType} className="eduos-kpi eduos-kpi--compact">
                    <div className="eduos-kpi__label">{b.leaveType}</div>
                    <div className="eduos-kpi__value eduos-kpi__value--md">{b.balanceDays}</div>
                    <div className="eduos-kpi__sub">days left</div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="eduos-panel">
            <h2 className="eduos-section-title">Apply for leave</h2>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(9rem, 1fr))",
                gap: "0.5rem",
                marginTop: "0.5rem",
              }}
            >
              <label style={{ fontSize: "0.8125rem" }}>
                Type
                <select
                  className="eduos-input eduos-input--field"
                  value={apply.leaveType}
                  onChange={(e) => setApply((p) => ({ ...p, leaveType: e.target.value as FacultyApplyLeaveInput["leaveType"] }))}
                  style={{ display: "block", marginTop: "0.2rem", maxWidth: "100%" }}
                >
                  <option value="casual">Casual</option>
                  <option value="sick">Sick</option>
                  <option value="earned">Earned</option>
                  <option value="unpaid">Unpaid</option>
                </select>
              </label>
              <Input label="From" value={apply.fromDate} onChange={(e) => setApply((p) => ({ ...p, fromDate: e.target.value }))} />
              <Input label="To" value={apply.toDate} onChange={(e) => setApply((p) => ({ ...p, toDate: e.target.value }))} />
            </div>
            <textarea
              className="eduos-input"
              rows={2}
              placeholder="Reason"
              value={apply.reason}
              onChange={(e) => setApply((p) => ({ ...p, reason: e.target.value }))}
              style={{ marginTop: "0.5rem", maxWidth: "28rem" }}
            />
            <div style={{ marginTop: "0.5rem" }}>
              <Button
                type="button"
                className="eduos-admin-btn-sm"
                onClick={async () => {
                  setMessage(null);
                  const res = await fetch("/api/faculty/my-leave", {
                    method: "POST",
                    credentials: "include",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(apply),
                  });
                  const j = await res.json().catch(() => ({}));
                  if (!res.ok) {
                    setMessage((j as { error?: string }).error ?? "Apply failed");
                    return;
                  }
                  setMessage("Leave request submitted.");
                  setApply((p) => ({ ...p, reason: "" }));
                  await load();
                }}
              >
                Submit request
              </Button>
            </div>
          </section>

          <section className="eduos-panel">
            <h2 className="eduos-section-title">My requests</h2>
            <div className="eduos-table-wrap">
              {!mine ? (
                <SkeletonTable columns={5} rows={5} />
              ) : myRequests.length === 0 ? (
                <EmptyState title="No requests yet" description="Leave requests you submit will appear here." />
              ) : (
                <table className="eduos-admin-table">
                  <thead>
                    <tr>
                      <th>Type</th>
                      <th>Dates</th>
                      <th>Days</th>
                      <th>Status</th>
                      <th>Reviewer</th>
                    </tr>
                  </thead>
                  <tbody>
                    {myRequests.slice(0, 12).map((r: HrLeaveRequest) => (
                      <tr key={r.id}>
                        <td>{r.leaveType}</td>
                        <td className="eduos-admin-table__nowrap">
                          {r.fromDate} → {r.toDate}
                        </td>
                        <td>{r.days}</td>
                        <td>{r.status}</td>
                        <td>{r.reviewerName ?? "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </section>
        </>
      ) : null}

      {mode === "approve" && !data ? (
        <SkeletonText lines={4} />
      ) : mode === "approve" && data ? (
        <>
          <section className="eduos-panel">
            <h2 className="eduos-section-title">Pending ({pending.length})</h2>
            <p className="eduos-section-desc">Approve or reject student/guardian leave.</p>
            <div className="eduos-form-field">
              <Input
                label="Review note (optional)"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="eduos-input"
              />
            </div>
            <div className="eduos-table-wrap">
              <table className="eduos-admin-table">
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Class</th>
                    <th>Dates</th>
                    <th>Reason</th>
                    <th>Applied by</th>
                    <th className="eduos-admin-table__actions">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pending.length === 0 ? (
                    <tr>
                      <td colSpan={6}>
                        <EmptyState compact title="No pending requests" description="Leave requests awaiting your review will appear here." />
                      </td>
                    </tr>
                  ) : (
                    pending.map((r) => (
                      <tr key={r.id}>
                        <td>
                          <TruncatedText text={r.studentName} maxWidth="16rem" />
                        </td>
                        <td>{r.classLabel}</td>
                        <td className="eduos-admin-table__nowrap">
                          {r.fromDate} → {r.toDate}
                        </td>
                        <td className="eduos-admin-table__reason">
                          <TruncatedText text={r.reason} maxWidth="16rem" />
                        </td>
                        <td>
                          {r.appliedByName} ({r.appliedByRole})
                        </td>
                        <td className="eduos-admin-table__actions">
                          <div className="eduos-portal-toolbar">
                            <Button type="button" className="eduos-admin-btn-sm" onClick={() => review(r, "approved")}>
                              Approve
                            </Button>
                            <Button
                              type="button"
                              variant="secondary"
                              className="eduos-admin-btn-sm"
                              onClick={() => review(r, "rejected")}
                            >
                              Reject
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <section className="eduos-panel">
            <h2 className="eduos-section-title">Recent decisions</h2>
            <div className="eduos-table-wrap">
              <table className="eduos-admin-table">
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Status</th>
                    <th>Reviewer</th>
                    <th>Reviewed</th>
                  </tr>
                </thead>
                <tbody>
                  {(data.decided ?? []).slice(0, 8).map((r) => (
                    <tr key={r.id}>
                      <td>
                        <TruncatedText text={r.studentName} maxWidth="16rem" />
                      </td>
                      <td>
                        <LeaveRequestStatusTag status={r.status} />
                      </td>
                      <td>{r.reviewedByName ?? "—"}</td>
                      <td className="eduos-admin-table__nowrap">
                        {r.reviewedAt ? new Date(r.reviewedAt).toLocaleString() : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      ) : null}
    </FacultyShell>
  );
}
