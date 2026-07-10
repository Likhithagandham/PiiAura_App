"use client";

import { useEffect, useMemo, useState } from "react";
import type {
  SuperAdminBranchFeeLedgerData,
  SuperAdminStudentTransferOversightData,
  SuperAdminTransferStatus,
} from "@eduos/types";
import { EmptyState, ListSearchBar, SkeletonTable, TruncatedText, filterBySearch } from "@eduos/ui";
import { SuperAdminShell } from "@/components/super-admin/SuperAdminShell";
import { useApiData, useSuperAdminBranchesQuery } from "@/lib/queries";

function statusLabel(s: SuperAdminTransferStatus): string {
  if (s === "completed") return "Completed";
  if (s === "in_review") return "In review";
  return "Needs action";
}

function statusTagStyle(s: SuperAdminTransferStatus): React.CSSProperties {
  if (s === "completed") return { background: "rgba(34, 197, 94, 0.12)", borderColor: "rgba(34, 197, 94, 0.35)" };
  if (s === "in_review") return { background: "rgba(59, 130, 246, 0.12)", borderColor: "rgba(59, 130, 246, 0.35)" };
  return { background: "rgba(245, 158, 11, 0.14)", borderColor: "rgba(245, 158, 11, 0.4)" };
}

function formatDateTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

function formatInr(n: number): string {
  try {
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);
  } catch {
    return `₹${n}`;
  }
}

export default function SuperAdminTransfersPage() {
  useEffect(() => {
    window.location.replace("/super-admin/operations");
  }, []);
  return <p className="eduos-empty">Redirecting…</p>;
}

export function SuperAdminTransfersView({ embedded = false }: { embedded?: boolean }) {
  const [selectedBranchId, setSelectedBranchId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const { data, error: dataErr } = useApiData<SuperAdminStudentTransferOversightData>(
    "/api/super-admin/transfers",
  );
  const { data: branches } = useSuperAdminBranchesQuery();
  const error = dataErr ? (dataErr instanceof Error ? dataErr.message : "Failed to load") : null;

  // Default to the first active branch; user selection (if any) overrides — derived,
  // so no setState-in-effect.
  const defaultBranchId = branches
    ? branches.branches.find((b) => b.isActive)?.id ?? branches.branches[0]?.id ?? ""
    : "";
  const ledgerBranchId = selectedBranchId ?? defaultBranchId;

  const { data: ledger, error: ledgerErr } = useApiData<SuperAdminBranchFeeLedgerData>(
    ledgerBranchId ? `/api/super-admin/transfers/ledger?branchId=${encodeURIComponent(ledgerBranchId)}` : null,
  );
  const ledgerError = ledgerErr
    ? ledgerErr instanceof Error
      ? ledgerErr.message
      : "Failed to load branch ledger"
    : null;

  const counts = useMemo(() => {
    const rows = data?.rows ?? [];
    const completed = rows.filter((r) => r.status === "completed").length;
    const inReview = rows.filter((r) => r.status === "in_review").length;
    const needsAction = rows.filter((r) => r.status === "needs_action").length;
    const sourceDueTotal = rows.reduce((sum, r) => sum + r.feeSnapshot.sourceBranchOpenDue, 0);
    return { completed, inReview, needsAction, total: rows.length, sourceDueTotal };
  }, [data]);

  const filteredRows = useMemo(
    () =>
      filterBySearch(data?.rows ?? [], search, (r) => [
        r.studentName,
        r.studentId,
        r.archivedAdmissionNo,
        r.archivedFromBranchName,
        r.enrolledToBranchName,
        r.notes,
      ]),
    [data?.rows, search],
  );

  const body = (
    <>
      {error ? <p className="eduos-admin-message eduos-admin-message--error">{error}</p> : null}
      {!data ? (
        <SkeletonTable columns={8} rows={5} />
      ) : (
        <>
          <section className="eduos-panel">
            <h2 className="eduos-section-title">Fee policy</h2>
            <p className="eduos-section-desc">{data.feePolicyLabel}</p>
            <p className="eduos-section-desc" style={{ marginTop: "0.35rem" }}>
              After a branch transfer, collect outstanding fees at the <strong>source (archived)</strong> branch.
              Destination ledgers only show fees for the new enrollment.
            </p>
          </section>

          <section className="eduos-panel">
            <h2 className="eduos-section-title">Overview</h2>
            <p className="eduos-section-desc">Archived source-branch record and active destination enrollment.</p>
            <div className="eduos-portal-toolbar" style={{ marginTop: "0.5rem", alignItems: "center" }}>
              <span className="eduos-tag">Transfers: {counts.total}</span>
              <span className="eduos-tag" style={{ fontWeight: 700 }}>
                Source ledger open due: {formatInr(counts.sourceDueTotal)}
              </span>
              <span className="eduos-tag" style={statusTagStyle("completed")}>
                Completed: {counts.completed}
              </span>
              <span className="eduos-tag" style={statusTagStyle("in_review")}>
                In review: {counts.inReview}
              </span>
              <span className="eduos-tag" style={statusTagStyle("needs_action")}>
                Needs action: {counts.needsAction}
              </span>
            </div>
          </section>

          <section className="eduos-panel">
            <h2 className="eduos-section-title">Transfers</h2>
            {data.rows.length === 0 ? (
              <EmptyState title="No transfers" description="No student transfer records yet." />
            ) : (
              <div className="eduos-table-wrap">
                <ListSearchBar
                  value={search}
                  onChange={setSearch}
                  placeholder="Search student, admission no., or branch…"
                  total={data.rows.length}
                  filtered={filteredRows.length}
                />
                <table className="eduos-admin-table">
                  <thead>
                    <tr>
                      <th>Student</th>
                      <th className="eduos-admin-table__nowrap">Source (archived)</th>
                      <th className="eduos-admin-table__nowrap">Source open due</th>
                      <th className="eduos-admin-table__nowrap">Destination (active)</th>
                      <th className="eduos-admin-table__nowrap">Dest. open due</th>
                      <th className="eduos-admin-table__nowrap">Enrolled at</th>
                      <th className="eduos-admin-table__nowrap">Status</th>
                      <th>Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRows.map((r) => (
                      <tr key={r.transferId}>
                        <td>
                          <div style={{ fontWeight: 700 }}>
                            <TruncatedText text={r.studentName} maxWidth="16rem" />
                          </div>
                          <div style={{ fontSize: "0.75rem", color: "var(--eduos-text-muted)" }}>
                            {r.studentId} · {r.archivedAdmissionNo}
                          </div>
                        </td>
                        <td style={{ fontWeight: 600 }}>
                          <TruncatedText text={r.archivedFromBranchName} maxWidth="16rem" />
                        </td>
                        <td className="eduos-admin-table__nowrap" style={{ fontWeight: 700, color: "var(--eduos-danger)" }}>
                          {formatInr(r.feeSnapshot.sourceBranchOpenDue)}
                        </td>
                        <td style={{ fontWeight: 600 }}>
                          <TruncatedText text={r.enrolledToBranchName} maxWidth="16rem" />
                        </td>
                        <td className="eduos-admin-table__nowrap">{formatInr(r.feeSnapshot.destinationBranchOpenDue)}</td>
                        <td className="eduos-admin-table__nowrap">{formatDateTime(r.enrolledAt)}</td>
                        <td>
                          <span className="eduos-tag" style={{ ...statusTagStyle(r.status) }}>
                            {statusLabel(r.status)}
                          </span>
                        </td>
                        <td style={{ fontSize: "0.8125rem", color: "var(--eduos-text-muted)" }}>
                          <TruncatedText text={r.notes ?? "—"} maxWidth="16rem" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section className="eduos-panel">
            <h2 className="eduos-section-title">Branch fee ledger</h2>
            <p className="eduos-section-desc">
              Open dues by branch, including archived enrollments after transfer.
            </p>
            {branches ? (
              <label style={{ display: "block", marginTop: "0.5rem", fontSize: "0.8125rem", maxWidth: "16rem" }}>
                Branch
                <select
                  className="eduos-input eduos-input--field"
                  style={{ display: "block", marginTop: "0.25rem", width: "100%" }}
                  value={ledgerBranchId}
                  onChange={(e) => setSelectedBranchId(e.target.value)}
                >
                  {branches.branches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                      {!b.isActive ? " (inactive)" : ""}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}
            {ledgerError ? (
              <p className="eduos-admin-message eduos-admin-message--error" style={{ marginTop: "0.5rem" }}>
                {ledgerError}
              </p>
            ) : null}
            {!ledger ? (
              <div style={{ marginTop: "0.75rem" }}>
                <SkeletonTable columns={4} rows={5} />
              </div>
            ) : ledger.rows.length === 0 ? (
              <EmptyState
                compact
                title="No open dues"
                description="This branch ledger has no open dues."
              />
            ) : (
              <>
                <div className="eduos-portal-toolbar" style={{ marginTop: "0.75rem" }}>
                  <span className="eduos-tag" style={{ fontWeight: 800 }}>
                    {ledger.branchName} total open: {formatInr(ledger.totalOpenDue)}
                  </span>
                </div>
                <div className="eduos-table-wrap" style={{ marginTop: "0.5rem" }}>
                  <table className="eduos-admin-table">
                    <thead>
                      <tr>
                        <th>Student</th>
                        <th className="eduos-admin-table__nowrap">Enrollment</th>
                        <th className="eduos-admin-table__nowrap">Open due</th>
                        <th className="eduos-admin-table__nowrap">Updated</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ledger.rows.map((row) => (
                        <tr key={row.ledgerId}>
                          <td>
                            <div style={{ fontWeight: 700 }}>
                              <TruncatedText text={row.studentName} maxWidth="16rem" />
                            </div>
                            <div style={{ fontSize: "0.75rem", color: "var(--eduos-text-muted)" }}>{row.studentId}</div>
                          </td>
                          <td className="eduos-admin-table__nowrap">
                            {row.enrollmentStatus === "archived_at_branch" ? "Archived" : "Active"}
                          </td>
                          <td className="eduos-admin-table__nowrap" style={{ fontWeight: 700 }}>
                            {formatInr(row.openDue)}
                          </td>
                          <td className="eduos-admin-table__nowrap">{formatDateTime(row.updatedAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </section>
        </>
      )}
    </>
  );

  if (embedded) return body;
  return <SuperAdminShell title="Student transfers">{body}</SuperAdminShell>;
}
