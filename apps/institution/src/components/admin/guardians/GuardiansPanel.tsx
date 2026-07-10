"use client";

import { useMemo, useState } from "react";
import type {
  GuardianManagementData,
  GuardianRelationship,
  SaveGuardianLinkInput,
  StudentGuardianLink,
} from "@eduos/types";
import { Button, EmptyState, ListSearchBar, filterBySearch, InlineLoading } from "@eduos/ui";
import { apiSend } from "@/lib/api-client";
import { useGuardiansQuery } from "@/lib/queries";
import { AdminModal } from "../AdminModal";
import { AdminMessage } from "../ui";

const smallBtn: React.CSSProperties = { width: "auto", padding: "0.45rem 0.75rem", fontSize: "0.8125rem" };

const RELATIONSHIPS: GuardianRelationship[] = [
  "father",
  "mother",
  "step_father",
  "step_mother",
  "guardian",
  "custodian",
  "sibling",
  "other",
];

function idemHeaders(): HeadersInit {
  return { "Content-Type": "application/json", "Idempotency-Key": `guardians-${Date.now()}` };
}

function defaultModal(data: GuardianManagementData | null | undefined): SaveGuardianLinkInput {
  return {
    studentId: data?.students[0]?.studentId ?? "",
    guardianUserId: data?.guardians[0]?.userId ?? "",
    relationship: "mother",
    hasPortalAccess: true,
    isPrimaryContact: false,
    canPickup: true,
    receivesNotifications: { in_app: true, sms: true, email: true },
  };
}

export function GuardiansPanel({
  apiBase = "/api/admin/guardians",
  branchQuery,
  readOnly = false,
  branches,
}: {
  apiBase?: string;
  branchQuery?: string;
  readOnly?: boolean;
  branches?: { id: string; name: string }[];
} = {}) {
  const [message, setMessage] = useState<string | null>(null);
  const [studentFilter, setStudentFilter] = useState<string>("all");
  const [branchFilter, setBranchFilter] = useState<string>("all");
  /** null = server default (first class). "all" or a label = explicit user choice. */
  const [requestedClass, setRequestedClass] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState<null | SaveGuardianLinkInput>(null);

  const url = useMemo(() => {
    const isSuperAdmin = apiBase.includes("super-admin");
    const effectiveBranch = readOnly
      ? (branchFilter === "all" ? "all" : branchFilter)
      : branchQuery != null
        ? branchQuery
        : isSuperAdmin
          ? "all"
          : undefined;
    const params = new URLSearchParams();
    if (effectiveBranch != null) {
      params.set("branch", effectiveBranch);
    }
    if (readOnly && requestedClass) {
      params.set("class", requestedClass);
    }
    const qs = params.toString();
    return qs ? `${apiBase}?${qs}` : apiBase;
  }, [apiBase, branchQuery, readOnly, branchFilter, requestedClass]);

  const { data, error, refetch } = useGuardiansQuery(url);
  const loadError = error ? "Could not load guardian links." : null;

  async function patchAction(body: Record<string, unknown>) {
    setMessage(null);
    const isSuperAdmin = apiBase.includes("super-admin");
    const actionUrl = isSuperAdmin ? apiBase : `${apiBase}/actions`;
    try {
      await apiSend(actionUrl, isSuperAdmin ? "POST" : "PATCH", body, { headers: idemHeaders() });
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Request failed");
      return false;
    }
    await refetch();
    return true;
  }

  const canLink = Boolean(data?.students.length && data?.guardians.length);

  const classOptions = useMemo(() => {
    if (readOnly) {
      return data?.classOptions ?? [];
    }
    const labels = new Set<string>();
    for (const s of data?.students ?? []) {
      if (s.classLabel) labels.add(s.classLabel);
    }
    for (const l of data?.links ?? []) {
      if (l.classLabel) labels.add(l.classLabel);
    }
    return Array.from(labels).sort((a, b) => a.localeCompare(b));
  }, [data?.students, data?.links, data?.classOptions, readOnly]);

  const filtered = useMemo(() => {
    const links = data?.links ?? [];
    const byStudent =
      studentFilter === "all" ? links : links.filter((l) => l.studentId === studentFilter);
    const byClass =
      readOnly || !requestedClass || requestedClass === "all"
        ? byStudent
        : byStudent.filter((l) => l.classLabel === requestedClass);
    return filterBySearch(byClass, search, (l) => [
      l.studentName,
      l.studentId,
      l.guardianName,
      l.guardianUserId,
      l.relationship,
      l.classLabel ?? "",
      l.branchName ?? "",
    ]);
  }, [data?.links, studentFilter, requestedClass, search, readOnly]);

  const groupedByStudent = useMemo(() => {
    const map = new Map<string, StudentGuardianLink[]>();
    for (const l of filtered) {
      const arr = map.get(l.studentId) ?? [];
      arr.push(l);
      map.set(l.studentId, arr);
    }
    return map;
  }, [filtered]);

  return (
    <div>
      <p style={{ fontSize: "0.875rem", color: "var(--eduos-text-muted)", marginBottom: "1rem" }}>
        {readOnly
          ? "View guardian links across branches. One class loads at a time by default — choose All classes to load everything."
          : "Link parent accounts to students. Set primary contact, portal access per child, pickup authorization, and which channels each guardian receives for that child."}
      </p>

      <AdminMessage>{message}</AdminMessage>
      {loadError ? <p style={{ color: "var(--eduos-danger)" }}>{loadError}</p> : null}

      {(data?.links.length ?? 0) > 0 ? (
        <ListSearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search student, guardian, class…"
          total={data?.links.length}
          filtered={filtered.length}
        />
      ) : null}

      <section className="eduos-panel">
        <div className="eduos-admin-toolbar">
          {!readOnly ? (
            <Button
              type="button"
              onClick={() => setModal(defaultModal(data))}
              style={smallBtn}
              disabled={!canLink}
            >
              Link guardian
            </Button>
          ) : (
            <span />
          )}
          {readOnly && branches && branches.length > 0 ? (
            <label style={{ fontSize: "0.8125rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              Branch
              <select
                className="eduos-input"
                value={branchFilter}
                onChange={(e) => {
                  setBranchFilter(e.target.value);
                  setRequestedClass(null);
                }}
                style={{ fontSize: "0.8125rem" }}
              >
                <option value="all">All branches</option>
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </label>
          ) : null}
          {readOnly && classOptions.length > 0 ? (
            <label style={{ fontSize: "0.8125rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              Class
              <select
                className="eduos-input"
                value={requestedClass ?? data?.classScope ?? classOptions[0] ?? "all"}
                onChange={(e) => setRequestedClass(e.target.value)}
                style={{ fontSize: "0.8125rem" }}
              >
                {classOptions.map((label) => (
                  <option key={label} value={label}>
                    {label}
                  </option>
                ))}
                <option value="all">All classes</option>
              </select>
            </label>
          ) : null}
          {!readOnly ? (
          <label style={{ fontSize: "0.8125rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            Student
            <select
              className="eduos-input"
              value={studentFilter}
              onChange={(e) => setStudentFilter(e.target.value)}
              style={{ fontSize: "0.8125rem" }}
            >
              <option value="all">All students</option>
              {(data?.students ?? []).map((s) => (
                <option key={s.studentId} value={s.studentId}>
                  {s.studentName}
                  {s.classLabel ? ` (${s.classLabel})` : ""}
                </option>
              ))}
            </select>
          </label>
          ) : null}
        </div>
        {!readOnly && !canLink && data ? (
          <p style={{ margin: "0.75rem 0 0", fontSize: "0.8125rem", color: "var(--eduos-text-muted)" }}>
            {data.students.length === 0 && data.guardians.length === 0
              ? "Create student and parent users under User accounts first, then link them here."
              : data.students.length === 0
                ? "No student users in this campus yet — add students under User accounts."
                : "No parent users in this campus yet — add parents under User accounts."}
          </p>
        ) : null}
      </section>

      {!data ? (
        <InlineLoading />
      ) : groupedByStudent.size === 0 ? (
        <section className="eduos-panel">
          <EmptyState
            title="No guardian links yet"
            description={
              readOnly
                ? "No guardian links have been set up across your branches yet."
                : canLink
                  ? "Link a parent account to a student to enable the parent portal and notifications."
                  : "Add student and parent users first, then return here to link them."
            }
            action={
              !readOnly && canLink ? (
                <Button type="button" onClick={() => setModal(defaultModal(data))} style={smallBtn}>
                  Link guardian
                </Button>
              ) : undefined
            }
          />
        </section>
      ) : (
        Array.from(groupedByStudent.entries()).map(([studentId, links]) => (
          <section key={studentId} className="eduos-panel" style={{ marginBottom: "1rem" }}>
            <h3 style={{ margin: "0 0 0.75rem", fontSize: "0.9375rem", fontWeight: 700 }}>
              {links[0]?.studentName}
              {readOnly && links[0]?.branchName ? (
                <span style={{ fontWeight: 500, color: "var(--eduos-text-muted)", marginLeft: "0.5rem" }}>
                  {links[0].branchName}
                  {links[0]?.classLabel ? ` · ${links[0].classLabel}` : ""}
                </span>
              ) : null}
              <span style={{ fontWeight: 400, color: "var(--eduos-text-muted)", marginLeft: "0.5rem" }}>
                Primary: {links.find((l) => l.isPrimaryContact)?.guardianName ?? "—"}
              </span>
            </h3>
            <table className="eduos-admin-table">
              <thead>
                <tr>
                  <th>Guardian</th>
                  <th>Relationship</th>
                  <th>Portal</th>
                  <th>Pickup</th>
                  <th>Notifications</th>
                  {!readOnly ? <th /> : null}
                </tr>
              </thead>
              <tbody>
                {links.map((l) => (
                  <tr key={l.id}>
                    <td>
                      {l.guardianName}
                      {l.isPrimaryContact ? (
                        <span style={{ marginLeft: "0.35rem", color: "var(--eduos-primary)", fontWeight: 600 }}>
                          ★
                        </span>
                      ) : null}
                    </td>
                    <td>{l.relationship}</td>
                    <td>{l.hasPortalAccess ? "Yes" : "No"}</td>
                    <td>{l.canPickup !== false ? "Yes" : "No"}</td>
                    <td>
                      {(["in_app", "sms", "email"] as const)
                        .filter((ch) => l.receivesNotifications[ch])
                        .join(", ") || "—"}
                    </td>
                    {!readOnly ? (
                    <td>
                      <div style={{ display: "flex", gap: "0.35rem", justifyContent: "flex-end", flexWrap: "wrap" }}>
                        {!l.isPrimaryContact ? (
                          <Button
                            type="button"
                            variant="secondary"
                            style={smallBtn}
                            onClick={() => patchAction({ action: "set_primary", linkId: l.id })}
                          >
                            Set primary
                          </Button>
                        ) : null}
                        <Button
                          type="button"
                          variant="secondary"
                          style={smallBtn}
                          onClick={() =>
                            setModal({
                              id: l.id,
                              studentId: l.studentId,
                              guardianUserId: l.guardianUserId,
                              relationship: l.relationship,
                              hasPortalAccess: l.hasPortalAccess,
                              isPrimaryContact: l.isPrimaryContact,
                              canPickup: l.canPickup !== false,
                              receivesNotifications: { ...l.receivesNotifications },
                            })
                          }
                        >
                          Edit
                        </Button>
                        <Button
                          type="button"
                          variant="secondary"
                          style={smallBtn}
                          onClick={async () => {
                            if (!window.confirm(`Remove ${l.guardianName} as guardian for ${l.studentName}?`)) {
                              return;
                            }
                            await patchAction({ action: "remove_link", linkId: l.id });
                            setMessage("Guardian link removed.");
                          }}
                        >
                          Remove
                        </Button>
                      </div>
                    </td>
                    ) : null}
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        ))
      )}

      {!readOnly && modal ? (
        <AdminModal title={modal.id ? "Edit guardian link" : "Link guardian"} onClose={() => setModal(null)} wide>
          <label style={{ fontSize: "0.8125rem", display: "block", marginBottom: "0.75rem" }}>
            Student
            <select
              className="eduos-input"
              value={modal.studentId}
              onChange={(e) => setModal((m) => (m ? { ...m, studentId: e.target.value } : m))}
              style={{ display: "block", marginTop: "0.25rem" }}
              disabled={Boolean(modal.id)}
            >
              {(data?.students ?? []).map((s) => (
                <option key={s.studentId} value={s.studentId}>
                  {s.studentName}
                  {s.classLabel ? ` — ${s.classLabel}` : ""}
                </option>
              ))}
            </select>
          </label>
          <label style={{ fontSize: "0.8125rem", display: "block", marginBottom: "0.75rem" }}>
            Guardian user
            <select
              className="eduos-input"
              value={modal.guardianUserId}
              onChange={(e) => setModal((m) => (m ? { ...m, guardianUserId: e.target.value } : m))}
              style={{ display: "block", marginTop: "0.25rem" }}
              disabled={Boolean(modal.id)}
            >
              {(data?.guardians ?? []).map((g) => (
                <option key={g.userId} value={g.userId}>
                  {g.name}
                </option>
              ))}
            </select>
          </label>
          <label style={{ fontSize: "0.8125rem", display: "block", marginBottom: "0.75rem" }}>
            Relationship
            <select
              className="eduos-input"
              value={modal.relationship}
              onChange={(e) =>
                setModal((m) => (m ? { ...m, relationship: e.target.value as GuardianRelationship } : m))
              }
              style={{ display: "block", marginTop: "0.25rem" }}
            >
              {RELATIONSHIPS.map((r) => (
                <option key={r} value={r}>
                  {r.replace(/_/g, " ")}
                </option>
              ))}
            </select>
          </label>
          <label style={{ fontSize: "0.8125rem", display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
            <input
              type="checkbox"
              checked={modal.hasPortalAccess}
              onChange={(e) => setModal((m) => (m ? { ...m, hasPortalAccess: e.target.checked } : m))}
            />
            Portal access for this child
          </label>
          <label style={{ fontSize: "0.8125rem", display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
            <input
              type="checkbox"
              checked={modal.isPrimaryContact}
              onChange={(e) => setModal((m) => (m ? { ...m, isPrimaryContact: e.target.checked } : m))}
            />
            Primary contact (one per student)
          </label>
          <label style={{ fontSize: "0.8125rem", display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
            <input
              type="checkbox"
              checked={modal.canPickup !== false}
              onChange={(e) => setModal((m) => (m ? { ...m, canPickup: e.target.checked } : m))}
            />
            Authorized for school pickup
          </label>
          <div style={{ fontSize: "0.8125rem", fontWeight: 600, marginBottom: "0.35rem" }}>Receives notifications</div>
          {(["in_app", "sms", "email"] as const).map((ch) => (
            <label key={ch} style={{ fontSize: "0.8125rem", display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
              <input
                type="checkbox"
                checked={modal.receivesNotifications[ch]}
                onChange={(e) =>
                  setModal((m) =>
                    m ? { ...m, receivesNotifications: { ...m.receivesNotifications, [ch]: e.target.checked } } : m,
                  )
                }
              />
              {ch}
            </label>
          ))}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem", marginTop: "1rem" }}>
            <Button type="button" variant="secondary" onClick={() => setModal(null)} style={smallBtn}>
              Cancel
            </Button>
            <Button
              type="button"
              style={smallBtn}
              disabled={!modal.studentId || !modal.guardianUserId}
              onClick={async () => {
                const ok = await patchAction({ action: "save_link", payload: modal });
                if (ok) {
                  setModal(null);
                  setMessage("Guardian link saved.");
                }
              }}
            >
              Save
            </Button>
          </div>
        </AdminModal>
      ) : null}
    </div>
  );
}
