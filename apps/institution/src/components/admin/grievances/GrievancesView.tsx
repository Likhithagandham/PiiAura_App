"use client";

import { useMemo, useState } from "react";
import type { AdminGrievanceRow, AdminGrievancesData, StudentGrievanceStatus } from "@eduos/types";
import {
  Button,
  EmptyState,
  ListSearchBar,
  Modal,
  SkeletonTable,
  TruncatedText,
  filterBySearch,
} from "@eduos/ui";
import { AdminShell } from "../AdminShell";
import { AdminMessage, AdminTabs } from "../ui";
import { useApiData } from "@/lib/queries";

type StatusFilter = "all" | StudentGrievanceStatus;

const STATUS_LABELS: Record<StudentGrievanceStatus, string> = {
  open: "Open",
  in_review: "In review",
  resolved: "Resolved",
  closed: "Closed",
};

const STATUS_COLORS: Record<StudentGrievanceStatus, string> = {
  open: "var(--eduos-danger)",
  in_review: "#d69e2e",
  resolved: "var(--eduos-primary)",
  closed: "var(--eduos-text-muted)",
};

function idemHeaders(): HeadersInit {
  return {
    "Content-Type": "application/json",
    "Idempotency-Key": `grievances-${Date.now()}`,
  };
}

export function GrievancesView() {
  const { data, refetch } = useApiData<AdminGrievancesData>("/api/admin/grievances");
  const load = refetch;
  const [filter, setFilter] = useState<StatusFilter>("all");
  const [message, setMessage] = useState<string | null>(null);
  const [resolving, setResolving] = useState<AdminGrievanceRow | null>(null);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [search, setSearch] = useState("");

  async function action(body: Record<string, unknown>, successMsg: string) {
    setBusy(true);
    const res = await fetch("/api/admin/grievances/actions", {
      method: "PATCH",
      credentials: "include",
      headers: idemHeaders(),
      body: JSON.stringify(body),
    });
    const json = await res.json();
    setBusy(false);
    if (!res.ok) {
      setMessage(json.error ?? "Action failed");
      return false;
    }
    setMessage(successMsg);
    await load();
    return true;
  }

  const grievances = useMemo(() => data?.grievances ?? [], [data]);
  const filtered = useMemo(() => {
    const byStatus =
      filter === "all" ? grievances : grievances.filter((g) => g.status === filter);
    return filterBySearch(byStatus, search, (g) => [
      g.raisedByName,
      g.subject,
      g.category,
      g.classLabel,
      g.assignedToName,
      STATUS_LABELS[g.status],
    ]);
  }, [grievances, filter, search]);

  const counts = useMemo(() => {
    const open = grievances.filter((g) => g.status === "open").length;
    const review = grievances.filter((g) => g.status === "in_review").length;
    return { open, review };
  }, [grievances]);

  return (
    <AdminShell title="Grievances">
      <p style={{ fontSize: "0.875rem", color: "var(--eduos-text-muted)", marginBottom: "1rem" }}>
        Student and parent grievances. {counts.open} open · {counts.review} in review.
      </p>

      <AdminMessage>{message}</AdminMessage>

      <AdminTabs
        tabs={[
          { id: "all", label: "All" },
          { id: "open", label: "Open" },
          { id: "in_review", label: "In review" },
          { id: "resolved", label: "Resolved" },
          { id: "closed", label: "Closed" },
        ]}
        active={filter}
        onChange={(id) => setFilter(id as StatusFilter)}
      />

      <div className="eduos-panel">
        {data && grievances.length > 0 ? (
          <ListSearchBar
            value={search}
            onChange={setSearch}
            placeholder="Search student, subject, category…"
            total={grievances.length}
            filtered={filtered.length}
          />
        ) : null}
        {!data ? (
          <SkeletonTable rows={5} columns={6} label="Loading grievances…" />
        ) : filtered.length === 0 ? (
          <EmptyState
            title={
              search.trim()
                ? "No matches"
                : filter === "all"
                  ? "No grievances yet"
                  : `No ${STATUS_LABELS[filter as StudentGrievanceStatus].toLowerCase()} grievances`
            }
            description="Grievances raised by students or parents will appear here for triage."
          />
        ) : (
          <div className="eduos-table-wrap">
            <table className="eduos-admin-table">
              <thead>
                <tr>
                  <th>Raised by</th>
                  <th>Subject</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Assigned to</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((g) => (
                  <tr key={g.id} style={{ borderBottom: "1px solid var(--eduos-border)" }}>
                    <td style={{ padding: "0.5rem" }}>
                      <div style={{ fontWeight: 600 }}>{g.raisedByName}</div>
                      <div style={{ fontSize: "0.7rem", color: "var(--eduos-text-muted)" }}>
                        {g.raisedByRole === "parent" ? "Parent" : "Student"} · {g.classLabel}
                      </div>
                    </td>
                    <td style={{ padding: "0.5rem" }}>
                      <TruncatedText text={g.subject} maxWidth="14rem" />
                    </td>
                    <td style={{ padding: "0.5rem" }}>{g.category}</td>
                    <td style={{ padding: "0.5rem", color: STATUS_COLORS[g.status], fontWeight: 600 }}>
                      {STATUS_LABELS[g.status]}
                    </td>
                    <td style={{ padding: "0.5rem", fontSize: "0.8125rem" }}>
                      {g.assignedToName ?? "—"}
                    </td>
                    <td style={{ padding: "0.5rem" }}>
                      <GrievanceActions
                        grievance={g}
                        busy={busy}
                        onAssignToMe={() =>
                          action(
                            { action: "assign", grievanceId: g.id },
                            `Assigned grievance from ${g.raisedByName} to you.`,
                          )
                        }
                        onResolve={() => {
                          setResolving(g);
                          setNote("");
                        }}
                        onReopen={() =>
                          action(
                            { action: "reopen", grievanceId: g.id },
                            `Reopened grievance from ${g.raisedByName}.`,
                          )
                        }
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {resolving ? (
        <Modal
          title="Resolve grievance"
          onClose={busy ? undefined : () => setResolving(null)}
          footer={
            <>
              <Button variant="secondary" onClick={() => setResolving(null)} disabled={busy}>
                Cancel
              </Button>
              <Button
                onClick={async () => {
                  const ok = await action(
                    {
                      action: "resolve",
                      grievanceId: resolving.id,
                      resolutionNote: note,
                      status: "resolved",
                    },
                    `Resolved grievance from ${resolving.raisedByName}.`,
                  );
                  if (ok) setResolving(null);
                }}
                disabled={busy || !note.trim()}
              >
                {busy ? "Saving…" : "Mark resolved"}
              </Button>
            </>
          }
        >
          <p style={{ marginTop: 0, fontSize: "0.8125rem", color: "var(--eduos-text-muted)" }}>
            <strong>{resolving.subject}</strong>
            <br />
            {resolving.description}
          </p>
          <label className="eduos-label" htmlFor="grievance-resolution">
            Resolution note
          </label>
          <textarea
            id="grievance-resolution"
            className="eduos-input"
            rows={4}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Describe how this grievance was addressed…"
          />
        </Modal>
      ) : null}
    </AdminShell>
  );
}

function GrievanceActions({
  grievance,
  busy,
  onAssignToMe,
  onResolve,
  onReopen,
}: {
  grievance: AdminGrievanceRow;
  busy: boolean;
  onAssignToMe: () => void;
  onResolve: () => void;
  onReopen: () => void;
}) {
  const linkBtn: React.CSSProperties = {
    background: "none",
    border: "none",
    padding: "0 0.5rem 0 0",
    fontSize: "0.75rem",
    color: "var(--eduos-primary)",
    cursor: "pointer",
    textDecoration: "underline",
  };

  const isClosedOrResolved = grievance.status === "resolved" || grievance.status === "closed";

  return (
    <>
      {!grievance.assignedToId && !isClosedOrResolved ? (
        <button type="button" style={linkBtn} onClick={onAssignToMe} disabled={busy}>
          Assign to me
        </button>
      ) : null}
      {!isClosedOrResolved ? (
        <button type="button" style={linkBtn} onClick={onResolve} disabled={busy}>
          Resolve
        </button>
      ) : (
        <button type="button" style={linkBtn} onClick={onReopen} disabled={busy}>
          Reopen
        </button>
      )}
    </>
  );
}
