"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { CollegeOnlyData, NaacExportPreview, NaacFieldGap, SaveElectiveRuleInput } from "@eduos/types";
import { ADMIN_SCOPED_NAV } from "@eduos/constants";
import { Button, Input, InlineLoading } from "@eduos/ui";
import { AdminShell } from "../AdminShell";
import { AdminModal } from "../AdminModal";
import { AdminTabs, AdminMessage } from "../ui";
import { useApiData } from "@/lib/queries";



const smallBtnStyle: React.CSSProperties = { width: "auto", padding: "0.5rem 0.75rem", fontSize: "0.875rem" };

const tabs = ["Electives", "NAAC/NIRF exports"] as const;
type Tab = (typeof tabs)[number];

function idemHeaders(): HeadersInit {
  return { "Content-Type": "application/json", "Idempotency-Key": `college-${Date.now()}` };
}

export function CollegeView() {
  const { data, error: queryError, refetch } = useApiData<CollegeOnlyData>("/api/admin/college");
  const load = refetch;
  const loadError = queryError
    ? queryError instanceof Error
      ? queryError.message
      : "Could not load college module."
    : null;
  const [message, setMessage] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("Electives");
  const [ruleModal, setRuleModal] = useState<null | SaveElectiveRuleInput>(null);
  const [naacPreview, setNaacPreview] = useState<NaacExportPreview | null>(null);
  const [naacLoading, setNaacLoading] = useState(false);

  const loadNaacGaps = useCallback(async () => {
    setNaacLoading(true);
    try {
      const res = await fetch("/api/admin/college/actions", {
        method: "PATCH",
        credentials: "include",
        headers: idemHeaders(),
        body: JSON.stringify({ action: "naac_gaps" }),
      });
      const json = await res.json().catch(() => ({}));
      if (res.ok) setNaacPreview(json as NaacExportPreview);
      else setMessage((json as { error?: string }).error ?? "Could not load NAAC gaps");
    } finally {
      setNaacLoading(false);
    }
  }, []);

  useEffect(() => {
    if (tab === "NAAC/NIRF exports") void loadNaacGaps();
  }, [tab, loadNaacGaps]);

  async function patchAction(body: Record<string, unknown>) {
    setMessage(null);
    const res = await fetch("/api/admin/college/actions", {
      method: "PATCH",
      credentials: "include",
      headers: idemHeaders(),
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setMessage((j as { error?: string }).error ?? "Request failed");
      return null;
    }
    await load();
    return true;
  }

  const rules = useMemo(() => data?.electiveRules ?? [], [data?.electiveRules]);
  const selections = useMemo(() => data?.electiveSelections ?? [], [data?.electiveSelections]);

  return (
    <AdminShell title={ADMIN_SCOPED_NAV.college.label}>
      {loadError ? <p style={{ color: "var(--eduos-danger)" }}>{loadError}</p> : null}
      <AdminMessage>{message}</AdminMessage>

      {!data ? (
        <section className="eduos-panel">
          {loadError ? (
            <p style={{ color: "var(--eduos-danger)" }}>{loadError}</p>
          ) : (
            <InlineLoading />
          )}
        </section>
      ) : (
        <>
          <AdminTabs tabs={tabs.map((t) => ({ id: t, label: t }))} active={tab} onChange={setTab} />
          <section className="eduos-panel">
            <div className="eduos-admin-toolbar">
                <Button type="button" variant="secondary" onClick={() => load()} style={smallBtnStyle}>
                  Refresh
                </Button>
                {tab === "Electives" ? (
                  <Button
                    type="button"
                    onClick={() =>
                      setRuleModal({
                        semester: "Sem 3",
                        groupName: "Elective 1",
                        allowedSubjectIds: [],
                        minSelect: 1,
                        maxSelect: 1,
                      })
                    }
                    style={smallBtnStyle}
                  >
                    New rule
                  </Button>
                ) : null}
                {tab === "NAAC/NIRF exports" ? (
                  <>
                    <Button type="button" variant="secondary" onClick={loadNaacGaps} disabled={naacLoading} style={smallBtnStyle}>
                      {naacLoading ? "Checking…" : "Review gaps"}
                    </Button>
                    <Button
                      type="button"
                      onClick={async () => {
                        const res = await fetch("/api/admin/college/actions", {
                          method: "PATCH",
                          credentials: "include",
                          headers: idemHeaders(),
                          body: JSON.stringify({ action: "export_naac" }),
                        });
                        const blob = await res.blob();
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement("a");
                        a.href = url;
                        a.download = "naac-export.csv";
                        a.click();
                        URL.revokeObjectURL(url);
                      }}
                      style={smallBtnStyle}
                    >
                      Export NAAC
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={async () => {
                        const res = await fetch("/api/admin/college/actions", {
                          method: "PATCH",
                          credentials: "include",
                          headers: idemHeaders(),
                          body: JSON.stringify({ action: "export_nirf" }),
                        });
                        const blob = await res.blob();
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement("a");
                        a.href = url;
                        a.download = "nirf-export.csv";
                        a.click();
                        URL.revokeObjectURL(url);
                      }}
                      style={smallBtnStyle}
                    >
                      Export NIRF
                    </Button>
                  </>
                ) : null}
            </div>
          </section>

          {tab === "Electives" ? (
            <>
              <section className="eduos-panel">
                <h2 className="eduos-section-title">Elective rules</h2>
                <table className="eduos-admin-table" style={{ marginTop: "0.75rem" }}>
                  <thead>
                    <tr>
                      <th>Semester</th>
                      <th>Group</th>
                      <th>Allowed</th>
                      <th>Min</th>
                      <th>Max</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rules.length === 0 ? (
                      <tr>
                        <td colSpan={5} style={{ color: "var(--eduos-text-muted)" }}>
                          No rules yet.
                        </td>
                      </tr>
                    ) : (
                      rules.map((r) => (
                        <tr key={r.id}>
                          <td>{r.semester}</td>
                          <td>{r.groupName}</td>
                          <td>{r.allowedSubjectNames.length}</td>
                          <td>{r.minSelect}</td>
                          <td>{r.maxSelect}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </section>

              <section className="eduos-panel">
                <h2 className="eduos-section-title">Student selections</h2>
                <table className="eduos-admin-table" style={{ marginTop: "0.75rem" }}>
                  <thead>
                    <tr>
                      <th>Student</th>
                      <th>Semester</th>
                      <th>Group</th>
                      <th>Subjects</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selections.length === 0 ? (
                      <tr>
                        <td colSpan={4} style={{ color: "var(--eduos-text-muted)" }}>
                          No selections yet.
                        </td>
                      </tr>
                    ) : (
                      selections.map((s) => (
                        <tr key={s.id}>
                          <td>{s.studentName}</td>
                          <td>{s.semester}</td>
                          <td>{s.groupName}</td>
                          <td>{s.selectedSubjectNames.join(", ")}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </section>
            </>
          ) : null}

          {tab === "NAAC/NIRF exports" ? (
            <section className="eduos-panel">
              <h2 className="eduos-section-title">NAAC / NIRF reports</h2>
              <p style={{ margin: "0.35rem 0 0.75rem", color: "var(--eduos-text-muted)", fontSize: "0.8125rem" }}>
                Review missing accreditation fields, then export CSV with blanks where data is absent.
              </p>
              {naacPreview ? (
                <>
                  <p style={{ fontSize: "0.8125rem", marginBottom: "0.75rem" }}>
                    <strong>{naacPreview.recordsWithGaps}</strong> of {naacPreview.totalRecords} records have
                    gaps. Required: {naacPreview.requiredFields.join(", ")}.
                  </p>
                  {naacPreview.gaps.length === 0 ? (
                    <p style={{ color: "var(--eduos-text-muted)", fontSize: "0.8125rem" }}>No gaps — ready to export.</p>
                  ) : (
                    <table className="eduos-admin-table" style={{ marginBottom: "0.75rem" }}>
                      <thead>
                        <tr>
                          <th>Student</th>
                          <th>Missing fields</th>
                        </tr>
                      </thead>
                      <tbody>
                        {naacPreview.gaps.map((g: NaacFieldGap) => (
                          <tr key={g.entityId}>
                            <td>{g.entityLabel}</td>
                            <td>{g.missingFields.join(", ")}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </>
              ) : (
                <p style={{ color: "var(--eduos-text-muted)", fontSize: "0.8125rem" }}>
                  {naacLoading ? "Loading gap review…" : "Click Review gaps to scan records."}
                </p>
              )}
            </section>
          ) : null}

          {ruleModal ? (
            <AdminModal title="Elective rule" onClose={() => setRuleModal(null)} wide>
              <Input label="Semester" value={ruleModal.semester} onChange={(e) => setRuleModal((p) => (p ? { ...p, semester: e.target.value } : p))} />
              <div style={{ height: "0.75rem" }} />
              <Input label="Group name" value={ruleModal.groupName} onChange={(e) => setRuleModal((p) => (p ? { ...p, groupName: e.target.value } : p))} />
              <div style={{ height: "0.75rem" }} />
              <Input label="Allowed subject IDs (comma separated)" value={ruleModal.allowedSubjectIds.join(",")} onChange={(e) => setRuleModal((p) => (p ? { ...p, allowedSubjectIds: e.target.value.split(",").map((x) => x.trim()).filter(Boolean) } : p))} />
              <div style={{ height: "0.75rem" }} />
              <div style={{ display: "flex", gap: "0.75rem" }}>
                <div style={{ flex: 1 }}>
                  <Input label="Min select" type="number" value={ruleModal.minSelect} onChange={(e) => setRuleModal((p) => (p ? { ...p, minSelect: Number(e.target.value) } : p))} />
                </div>
                <div style={{ flex: 1 }}>
                  <Input label="Max select" type="number" value={ruleModal.maxSelect} onChange={(e) => setRuleModal((p) => (p ? { ...p, maxSelect: Number(e.target.value) } : p))} />
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem", marginTop: "1rem" }}>
                <Button type="button" variant="secondary" onClick={() => setRuleModal(null)} style={smallBtnStyle}>
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={async () => {
                    const p = ruleModal;
                    if (!p) return;
                    await patchAction({ action: "save_elective_rule", payload: p });
                    setRuleModal(null);
                    setMessage("Saved.");
                  }}
                  style={smallBtnStyle}
                >
                  Save
                </Button>
              </div>
            </AdminModal>
          ) : null}
        </>
      )}
    </AdminShell>
  );
}

