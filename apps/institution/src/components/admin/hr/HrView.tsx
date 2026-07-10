"use client";

import { useMemo, useState } from "react";
import type {
  ApplyLeaveInput,
  CreatePayrollAdjustmentInput,
  HrData,
  HrSalaryComponentTemplate,
  RunPayrollInput,
  SaveSalaryTemplateInput,
  SaveEmployeeInput,
} from "@eduos/types";
import {
  Button,
  ChartLegend,
  DonutChart,
  EmptyState,
  IconClock,
  IconUserCheck,
  IconUsers,
  Input,
  ListSearchBar,
  StatCard,
  chartColor,
  filterBySearch,
} from "@eduos/ui";
import { isHrPayrollEnabled } from "@/lib/config";
import { useApiData } from "@/lib/queries";
import { AdminShell } from "../AdminShell";
import { AdminModal } from "../AdminModal";
import { AdminTabs, AdminMessage } from "../ui";

const EMPLOYMENT_TYPE_LABELS: Record<string, string> = {
  full_time: "Full-time",
  part_time: "Part-time",
  contract: "Contract",
  intern: "Intern",
};


const smallBtnStyle: React.CSSProperties = {
  width: "auto",
  padding: "0.5rem 0.75rem",
  fontSize: "0.875rem",
};

const payrollEnabled = isHrPayrollEnabled();

function PayrollComingSoonPanel() {
  return (
    <section className="eduos-panel" style={{ maxWidth: "640px" }}>
      <EmptyState
        title="Payroll — coming soon"
        description="Monthly payroll processing, payslips, and salary templates are not available yet. You can still manage employees and review leave requests in the other tabs."
      />
    </section>
  );
}


const tabs = ["Employees", "Leave", "Payroll", "Templates", "Reports", "Documents"] as const;
type Tab = (typeof tabs)[number];

function idemHeaders(): HeadersInit {
  return { "Content-Type": "application/json", "Idempotency-Key": `hr-${Date.now()}` };
}

export function HrView() {
  const { data, error: queryError, refetch } = useApiData<HrData>("/api/admin/hr");
  const load = refetch;
  const loadError = queryError
    ? queryError instanceof Error
      ? queryError.message
      : "Could not load HR."
    : null;
  const [tab, setTab] = useState<Tab>("Employees");
  const [message, setMessage] = useState<string | null>(null);

  const [empModal, setEmpModal] = useState<null | { form: SaveEmployeeInput }>(null);
  const [leaveModal, setLeaveModal] = useState<null | { form: ApplyLeaveInput }>(null);
  const [payrollModal, setPayrollModal] = useState<null | { form: RunPayrollInput }>(null);
  const [templateModal, setTemplateModal] = useState<null | { form: SaveSalaryTemplateInput }>(null);
  const [docModal, setDocModal] = useState<
    null | { employeeId: string; title: string; fileName: string; mimeType: string; sizeBytes: number }
  >(null);
  const [adjustModal, setAdjustModal] = useState<null | { form: CreatePayrollAdjustmentInput }>(null);
  const [employeeSearch, setEmployeeSearch] = useState("");

  async function patchAction(body: Record<string, unknown>) {
    setMessage(null);
    const res = await fetch("/api/admin/hr/actions", {
      method: "PATCH",
      credentials: "include",
      headers: idemHeaders(),
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      setMessage((json as { error?: string }).error ?? "Request failed");
      return null;
    }
    await load();
    return true;
  }

  const pendingLeaves = useMemo(
    () => (data?.leaveRequests ?? []).filter((r) => r.status === "pending"),
    [data?.leaveRequests],
  );

  const employmentTypeData = useMemo(() => {
    const counts = new Map<string, number>();
    for (const e of data?.employees ?? []) {
      counts.set(e.employmentType, (counts.get(e.employmentType) ?? 0) + 1);
    }
    return Array.from(counts.entries()).map(([type, value], i) => ({
      label: EMPLOYMENT_TYPE_LABELS[type] ?? type,
      value,
      color: chartColor(i),
    }));
  }, [data?.employees]);

  const filteredEmployees = useMemo(
    () =>
      filterBySearch(data?.employees ?? [], employeeSearch, (e) => [
        e.name,
        e.roleLabel,
        e.employmentType,
      ]),
    [data?.employees, employeeSearch],
  );

  const branchLabel = data?.branches[0]?.name ?? null;
  const defaultBranchId = data?.branches[0]?.id ?? "";
  const defaultEmployeeId = data?.employees[0]?.id ?? "";

  const activeEmployees = useMemo(
    () => (data?.employees ?? []).filter((e) => e.active).length,
    [data?.employees],
  );

  return (
    <AdminShell title="HR">
      {loadError ? <p style={{ color: "var(--eduos-danger)" }}>{loadError}</p> : null}
      <AdminMessage>{message}</AdminMessage>
      {branchLabel ? (
        <p className="eduos-section-desc" style={{ margin: "0 0 0.75rem" }}>
          Your campus: <strong>{branchLabel}</strong> — staff and leave data are limited to this branch.
        </p>
      ) : null}

      {!data ? (
        <section className="eduos-panel">
          <div style={{ color: loadError ? "var(--eduos-danger)" : "var(--eduos-text-muted)" }}>
            {loadError ?? "Loading HR…"}
          </div>
        </section>
      ) : (
        <>
          <AdminTabs
            tabs={tabs.map((t) => ({ id: t, label: t }))}
            active={tab}
            onChange={setTab}
          />
          <section className="eduos-panel">
            <div className="eduos-admin-toolbar">
                <Button type="button" variant="secondary" onClick={() => load()} style={smallBtnStyle}>
                  Refresh
                </Button>
                {tab === "Employees" ? (
                  <Button
                    type="button"
                    style={smallBtnStyle}
                    onClick={() =>
                      setEmpModal({
                        form: {
                          name: "",
                          roleLabel: "Faculty",
                          employmentType: "full_time",
                          primaryBranchId: defaultBranchId,
                          active: true,
                        },
                      })
                    }
                  >
                    New employee
                  </Button>
                ) : null}
                {tab === "Leave" ? (
                  <Button
                    type="button"
                    style={smallBtnStyle}
                    onClick={() =>
                      setLeaveModal({
                        form: {
                          employeeId: defaultEmployeeId,
                          leaveType: "casual",
                          fromDate: new Date().toISOString().slice(0, 10),
                          toDate: new Date().toISOString().slice(0, 10),
                          reason: "",
                        },
                      })
                    }
                  >
                    Apply leave
                  </Button>
                ) : null}
                {tab === "Payroll" && payrollEnabled ? (
                  <Button
                    type="button"
                    style={smallBtnStyle}
                    onClick={() =>
                      setPayrollModal({
                        form: {
                          month: new Date().toISOString().slice(0, 7),
                          branchId: data.branches[0]?.id ?? "br-1",
                          components: (data.componentTemplates ?? [])
                            .filter((t) => t.active)
                            .slice(0, 6)
                            .map((t) => ({ name: t.name, kind: t.kind, amount: t.amount })),
                        },
                      })
                    }
                  >
                    Run payroll
                  </Button>
                ) : null}
                {tab === "Templates" && payrollEnabled ? (
                  <Button
                    type="button"
                    style={smallBtnStyle}
                    onClick={() =>
                      setTemplateModal({
                        form: { name: "Allowance", kind: "earning", amount: 1000, active: true },
                      })
                    }
                  >
                    New template
                  </Button>
                ) : null}
                {tab === "Documents" ? (
                  <Button
                    type="button"
                    style={smallBtnStyle}
                    onClick={() =>
                      setDocModal({
                        employeeId: defaultEmployeeId,
                        title: "Employment contract",
                        fileName: "contract.pdf",
                        mimeType: "application/pdf",
                        sizeBytes: 24576,
                      })
                    }
                  >
                    Upload document
                  </Button>
                ) : null}
            </div>
          </section>

          {tab === "Employees" ? (
            <>
              <div className="eduos-admin-stat-grid">
                <StatCard
                  label="Total employees"
                  value={data.employees.length}
                  icon={<IconUsers />}
                  accent="#2563eb"
                />
                <StatCard label="Active" value={activeEmployees} icon={<IconUserCheck />} accent="#1a5f4a" />
                <StatCard
                  label="Pending leaves"
                  value={pendingLeaves.length}
                  icon={<IconClock />}
                  accent="#d69e2e"
                />
              </div>

              {data.employees.length > 0 ? (
                <section className="eduos-panel">
                  <h2 className="eduos-section-title">Workforce composition</h2>
                  <div className="eduos-chart-split">
                    {employmentTypeData.length > 0 ? (
                      <>
                        <DonutChart
                          data={employmentTypeData}
                          centerValue={data.employees.length}
                          centerLabel="Staff"
                        />
                        <div className="eduos-chart-split__legend">
                          <ChartLegend
                            items={employmentTypeData.map((d) => ({
                              label: d.label,
                              color: d.color ?? chartColor(0),
                              value: d.value,
                            }))}
                          />
                        </div>
                      </>
                    ) : null}
                  </div>
                </section>
              ) : null}

              <section className="eduos-panel">
                <h2 className="eduos-section-title">Employee master</h2>
                <p style={{ margin: "0.35rem 0 0.75rem", fontSize: "0.8125rem", color: "var(--eduos-text-muted)" }}>
                  Present, absent, and leave counts are for the current calendar month.
                </p>
                <ListSearchBar
                  value={employeeSearch}
                  onChange={setEmployeeSearch}
                  placeholder="Search employee name or role…"
                  total={data.employees.length}
                  filtered={filteredEmployees.length}
                />
                <table className="eduos-admin-table" style={{ marginTop: "0.75rem" }}>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Role</th>
                    <th>Type</th>
                    <th>Present</th>
                    <th>Absent</th>
                    <th>Leaves</th>
                    <th>Active</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEmployees.map((e) => (
                    <tr key={e.id}>
                      <td>{e.name}</td>
                      <td>{e.roleLabel}</td>
                      <td>{e.employmentType}</td>
                      <td>{e.presentDays ?? 0}</td>
                      <td>{e.absentDays ?? 0}</td>
                      <td>{e.leaveDays ?? 0}</td>
                      <td>{e.active ? "Yes" : "No"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </section>
            </>
          ) : null}

          {tab === "Leave" ? (
            <section className="eduos-panel">
              <h2 className="eduos-section-title">Leave management</h2>
              <p style={{ margin: "0.35rem 0 0.75rem", fontSize: "0.8125rem", color: "var(--eduos-text-muted)" }}>
                Pending: {pendingLeaves.length}
              </p>
              <table className="eduos-admin-table">
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Type</th>
                    <th>Dates</th>
                    <th>Days</th>
                    <th>Status</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {data.leaveRequests.map((r) => (
                    <tr key={r.id}>
                      <td>{r.employeeName}</td>
                      <td>{r.leaveType}</td>
                      <td>
                        {r.fromDate} → {r.toDate}
                      </td>
                      <td>{r.days}</td>
                      <td>{r.status}</td>
                      <td>
                        {r.status === "pending" ? (
                          <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
                            <Button
                              type="button"
                              variant="secondary"
                              style={smallBtnStyle}
                              onClick={() => patchAction({ action: "review_leave", payload: { requestId: r.id, approve: false } })}
                            >
                              Reject
                            </Button>
                            <Button
                              type="button"
                              style={smallBtnStyle}
                              onClick={() => patchAction({ action: "review_leave", payload: { requestId: r.id, approve: true } })}
                            >
                              Approve
                            </Button>
                          </div>
                        ) : (
                          <span style={{ color: "var(--eduos-text-muted)" }}>{r.reviewNote ?? "—"}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          ) : null}

          {tab === "Payroll" ? (
            payrollEnabled ? (
            <section className="eduos-panel">
              <h2 className="eduos-section-title">Payroll runs</h2>
              <table className="eduos-admin-table" style={{ marginTop: "0.75rem" }}>
                <thead>
                  <tr>
                    <th>Month</th>
                    <th>Branch</th>
                    <th>Employees</th>
                    <th>Gross</th>
                    <th>Net</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {data.payrollRuns.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ color: "var(--eduos-text-muted)" }}>
                        No payroll runs yet.
                      </td>
                    </tr>
                  ) : (
                    data.payrollRuns.map((r) => (
                      <tr key={r.id}>
                        <td>{r.month}</td>
                        <td>{r.branchName}</td>
                        <td>{r.employeeCount}</td>
                        <td>₹{r.totalGross.toLocaleString("en-IN")}</td>
                        <td>₹{r.totalNet.toLocaleString("en-IN")}</td>
                        <td>
                          <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem", flexWrap: "wrap" }}>
                            <Button
                              type="button"
                              variant="secondary"
                              style={smallBtnStyle}
                              onClick={() => {
                                const emp = data.employees[0];
                                if (!emp) return;
                                setAdjustModal({
                                  form: {
                                    payrollRunId: r.id,
                                    employeeId: emp.id,
                                    kind: "earning",
                                    label: "Adjustment",
                                    amount: 500,
                                    note: "Correction",
                                  },
                                });
                              }}
                            >
                              Add adjustment
                            </Button>
                            <Button
                              type="button"
                              style={smallBtnStyle}
                              onClick={async () => {
                                const emp = data.employees[0];
                                if (!emp) return;
                                const res = await fetch("/api/admin/hr/actions", {
                                  method: "PATCH",
                                  credentials: "include",
                                  headers: idemHeaders(),
                                  body: JSON.stringify({ action: "payslip_pdf", employeeId: emp.id, month: r.month }),
                                });
                                if (!res.ok) {
                                  const j = await res.json().catch(() => ({}));
                                  setMessage((j as { blockedReason?: string; error?: string }).blockedReason ?? (j as { error?: string }).error ?? "Blocked");
                                  return;
                                }
                                const blob = await res.blob();
                                const url = URL.createObjectURL(blob);
                                const a = document.createElement("a");
                                a.href = url;
                                a.download = `payslip-${emp.id}-${r.month}.pdf`;
                                a.click();
                                URL.revokeObjectURL(url);
                              }}
                            >
                              Payslip PDF
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </section>
            ) : (
              <PayrollComingSoonPanel />
            )
          ) : null}

          {tab === "Reports" ? (
            <section className="eduos-panel">
              <h2 className="eduos-section-title">HR reports</h2>
              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginTop: "0.75rem" }}>
                <Button
                  type="button"
                  style={smallBtnStyle}
                  onClick={async () => {
                    const res = await fetch("/api/admin/hr/actions", {
                      method: "PATCH",
                      credentials: "include",
                      headers: idemHeaders(),
                      body: JSON.stringify({ action: "export_headcount" }),
                    });
                    const blob = await res.blob();
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = `hr-headcount.csv`;
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                >
                  Export headcount
                </Button>
                <Button
                  type="button"
                  style={smallBtnStyle}
                  onClick={async () => {
                    const month = new Date().toISOString().slice(0, 7);
                    const res = await fetch("/api/admin/hr/actions", {
                      method: "PATCH",
                      credentials: "include",
                      headers: idemHeaders(),
                      body: JSON.stringify({ action: "export_leave_summary", month }),
                    });
                    const blob = await res.blob();
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = `hr-leave-summary-${month}.csv`;
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                >
                  Export leave summary
                </Button>
                {payrollEnabled ? (
                  <>
                <Button
                  type="button"
                  style={smallBtnStyle}
                  onClick={async () => {
                    const year = `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`;
                    const res = await fetch("/api/admin/hr/actions", {
                      method: "PATCH",
                      credentials: "include",
                      headers: idemHeaders(),
                      body: JSON.stringify({ action: "export_form16", year }),
                    });
                    const blob = await res.blob();
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = `form16-${year}.csv`;
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                >
                  Export Form 16
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  style={smallBtnStyle}
                  onClick={async () => {
                    const month = new Date().toISOString().slice(0, 7);
                    const res = await fetch("/api/admin/hr/actions", {
                      method: "PATCH",
                      credentials: "include",
                      headers: idemHeaders(),
                      body: JSON.stringify({ action: "export_pf", month }),
                    });
                    const blob = await res.blob();
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = `pf-${month}.csv`;
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                >
                  Export PF
                </Button>
                  </>
                ) : null}
              </div>
            </section>
          ) : null}

          {tab === "Templates" ? (
            payrollEnabled ? (
            <section className="eduos-panel">
              <h2 className="eduos-section-title">Salary component templates</h2>
              <table className="eduos-admin-table" style={{ marginTop: "0.75rem" }}>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Kind</th>
                    <th>Amount</th>
                    <th>Active</th>
                  </tr>
                </thead>
                <tbody>
                  {(data.componentTemplates ?? []).length === 0 ? (
                    <tr>
                      <td colSpan={4} style={{ color: "var(--eduos-text-muted)" }}>
                        No templates yet.
                      </td>
                    </tr>
                  ) : (
                    (data.componentTemplates ?? []).map((t: HrSalaryComponentTemplate) => (
                      <tr key={t.id}>
                        <td>{t.name}</td>
                        <td>{t.kind}</td>
                        <td>₹{t.amount.toLocaleString("en-IN")}</td>
                        <td>{t.active ? "Yes" : "No"}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </section>
            ) : (
              <PayrollComingSoonPanel />
            )
          ) : null}

          {tab === "Documents" ? (
            <section className="eduos-panel">
              <h2 className="eduos-section-title">HR document storage</h2>
              <p style={{ margin: "0.35rem 0 0.75rem", fontSize: "0.8125rem", color: "var(--eduos-text-muted)" }}>
                Store contracts and HR documents on mock S3.
              </p>
              <table className="eduos-admin-table">
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Title</th>
                    <th>File</th>
                    <th>Size</th>
                    <th>Uploaded</th>
                  </tr>
                </thead>
                <tbody>
                  {(data.documents ?? []).length === 0 ? (
                    <tr>
                      <td colSpan={5} style={{ color: "var(--eduos-text-muted)" }}>
                        No documents uploaded.
                      </td>
                    </tr>
                  ) : (
                    (data.documents ?? []).map((d) => (
                      <tr key={d.id}>
                        <td>{d.employeeName}</td>
                        <td>{d.title}</td>
                        <td>{d.fileName}</td>
                        <td>{Math.round(d.sizeBytes / 1024)} KB</td>
                        <td>{d.uploadedAt.slice(0, 10)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </section>
          ) : null}

          {empModal ? (
            <AdminModal title="New employee" onClose={() => setEmpModal(null)} wide>
              <label style={{ display: "block", fontSize: "0.875rem", marginBottom: "0.75rem" }}>
                Name
                <Input
                  value={empModal.form.name}
                  onChange={(e) => setEmpModal((p) => (p ? { form: { ...p.form, name: e.target.value } } : p))}
                  style={{ marginTop: "0.35rem" }}
                />
              </label>
              <label style={{ display: "block", fontSize: "0.875rem", marginBottom: "0.75rem" }}>
                Role
                <Input
                  value={empModal.form.roleLabel}
                  onChange={(e) => setEmpModal((p) => (p ? { form: { ...p.form, roleLabel: e.target.value } } : p))}
                  style={{ marginTop: "0.35rem" }}
                />
              </label>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem" }}>
                <Button type="button" variant="secondary" onClick={() => setEmpModal(null)} style={smallBtnStyle}>
                  Cancel
                </Button>
                <Button
                  type="button"
                  style={smallBtnStyle}
                  onClick={async () => {
                    const p = empModal;
                    if (!p) return;
                    await patchAction({ action: "save_employee", payload: p.form });
                    setEmpModal(null);
                    setMessage("Employee saved.");
                  }}
                >
                  Save
                </Button>
              </div>
            </AdminModal>
          ) : null}

          {leaveModal ? (
            <AdminModal title="Apply leave" onClose={() => setLeaveModal(null)} wide>
              <label style={{ display: "block", fontSize: "0.875rem", marginBottom: "0.75rem" }}>
                Employee
                <select
                  className="eduos-input eduos-input--field"
                  value={leaveModal.form.employeeId}
                  onChange={(e) =>
                    setLeaveModal((p) => (p ? { form: { ...p.form, employeeId: e.target.value } } : p))
                  }
                  style={{ display: "block", marginTop: "0.35rem", maxWidth: "100%" }}
                >
                  {(data?.employees ?? []).map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.name}
                    </option>
                  ))}
                </select>
              </label>
              <label style={{ display: "block", fontSize: "0.875rem", marginBottom: "0.75rem" }}>
                Reason
                <Input
                  value={leaveModal.form.reason}
                  onChange={(e) => setLeaveModal((p) => (p ? { form: { ...p.form, reason: e.target.value } } : p))}
                  style={{ marginTop: "0.35rem" }}
                />
              </label>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem" }}>
                <Button type="button" variant="secondary" onClick={() => setLeaveModal(null)} style={smallBtnStyle}>
                  Cancel
                </Button>
                <Button
                  type="button"
                  style={smallBtnStyle}
                  onClick={async () => {
                    const p = leaveModal;
                    if (!p) return;
                    await patchAction({ action: "apply_leave", payload: p.form });
                    setLeaveModal(null);
                    setMessage("Leave applied.");
                  }}
                >
                  Submit
                </Button>
              </div>
            </AdminModal>
          ) : null}

          {payrollModal ? (
            <AdminModal title="Run payroll" onClose={() => setPayrollModal(null)} wide>
              <p style={{ margin: 0, color: "var(--eduos-text-muted)", fontSize: "0.8125rem" }}>
                Executes payroll with configurable salary components.
              </p>
              <label style={{ display: "block", fontSize: "0.875rem", marginTop: "0.75rem", marginBottom: "0.75rem" }}>
                Month (YYYY-MM)
                <Input
                  value={payrollModal.form.month}
                  onChange={(e) =>
                    setPayrollModal((p) => (p ? { form: { ...p.form, month: e.target.value } } : p))
                  }
                  style={{ marginTop: "0.35rem" }}
                />
              </label>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem" }}>
                <Button type="button" variant="secondary" onClick={() => setPayrollModal(null)} style={smallBtnStyle}>
                  Cancel
                </Button>
                <Button
                  type="button"
                  style={smallBtnStyle}
                  onClick={async () => {
                    const p = payrollModal;
                    if (!p) return;
                    await patchAction({ action: "run_payroll", payload: p.form });
                    setPayrollModal(null);
                    setMessage("Payroll processed.");
                  }}
                >
                  Process
                </Button>
              </div>
            </AdminModal>
          ) : null}

          {templateModal ? (
            <AdminModal title="New salary template" onClose={() => setTemplateModal(null)} wide>
              <label style={{ display: "block", fontSize: "0.875rem", marginBottom: "0.75rem" }}>
                Name
                <Input
                  value={templateModal.form.name}
                  onChange={(e) => setTemplateModal((p) => (p ? { form: { ...p.form, name: e.target.value } } : p))}
                  style={{ marginTop: "0.35rem" }}
                />
              </label>
              <label style={{ display: "block", fontSize: "0.875rem", marginBottom: "0.75rem" }}>
                Amount (₹)
                <Input
                  type="number"
                  value={templateModal.form.amount}
                  onChange={(e) => setTemplateModal((p) => (p ? { form: { ...p.form, amount: Number(e.target.value) } } : p))}
                  style={{ marginTop: "0.35rem" }}
                />
              </label>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem" }}>
                <Button type="button" variant="secondary" onClick={() => setTemplateModal(null)} style={smallBtnStyle}>
                  Cancel
                </Button>
                <Button
                  type="button"
                  style={smallBtnStyle}
                  onClick={async () => {
                    const p = templateModal;
                    if (!p) return;
                    await patchAction({ action: "save_salary_template", payload: p.form });
                    setTemplateModal(null);
                    setMessage("Template saved.");
                  }}
                >
                  Save
                </Button>
              </div>
            </AdminModal>
          ) : null}

          {docModal ? (
            <AdminModal title="Upload HR document" onClose={() => setDocModal(null)} wide>
              <label style={{ display: "block", fontSize: "0.875rem", marginBottom: "0.75rem" }}>
                Employee
                <select
                  className="eduos-input eduos-input--field"
                  value={docModal.employeeId}
                  onChange={(e) => setDocModal((p) => (p ? { ...p, employeeId: e.target.value } : p))}
                  style={{ display: "block", marginTop: "0.35rem", maxWidth: "100%" }}
                >
                  {(data?.employees ?? []).map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.name}
                    </option>
                  ))}
                </select>
              </label>
              <label style={{ display: "block", fontSize: "0.875rem", marginBottom: "0.75rem" }}>
                Title
                <Input
                  value={docModal.title}
                  onChange={(e) => setDocModal((p) => (p ? { ...p, title: e.target.value } : p))}
                  style={{ marginTop: "0.35rem" }}
                  placeholder="e.g. Employment contract"
                />
              </label>
              <label style={{ display: "block", fontSize: "0.875rem", marginBottom: "0.75rem" }}>
                File name
                <Input
                  value={docModal.fileName}
                  onChange={(e) => setDocModal((p) => (p ? { ...p, fileName: e.target.value } : p))}
                  style={{ marginTop: "0.35rem" }}
                />
              </label>
              <label style={{ display: "block", fontSize: "0.875rem", marginBottom: "0.75rem" }}>
                Size (bytes)
                <Input
                  type="number"
                  value={docModal.sizeBytes}
                  onChange={(e) => setDocModal((p) => (p ? { ...p, sizeBytes: Number(e.target.value) } : p))}
                  style={{ marginTop: "0.35rem" }}
                />
              </label>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem" }}>
                <Button type="button" variant="secondary" onClick={() => setDocModal(null)} style={smallBtnStyle}>
                  Cancel
                </Button>
                <Button
                  type="button"
                  style={smallBtnStyle}
                  onClick={async () => {
                    const p = docModal;
                    if (!p) return;
                    await patchAction({
                      action: "upload_document",
                      employeeId: p.employeeId,
                      title: p.title,
                      fileName: p.fileName,
                      mimeType: p.mimeType,
                      sizeBytes: p.sizeBytes,
                    });
                    setDocModal(null);
                    setMessage("Document uploaded.");
                  }}
                >
                  Upload
                </Button>
              </div>
            </AdminModal>
          ) : null}

          {adjustModal ? (
            <AdminModal title="Add payroll adjustment" onClose={() => setAdjustModal(null)} wide>
              <label style={{ display: "block", fontSize: "0.875rem", marginBottom: "0.75rem" }}>
                Label
                <Input
                  value={adjustModal.form.label}
                  onChange={(e) => setAdjustModal((p) => (p ? { form: { ...p.form, label: e.target.value } } : p))}
                  style={{ marginTop: "0.35rem" }}
                />
              </label>
              <label style={{ display: "block", fontSize: "0.875rem", marginBottom: "0.75rem" }}>
                Amount (₹)
                <Input
                  type="number"
                  value={adjustModal.form.amount}
                  onChange={(e) => setAdjustModal((p) => (p ? { form: { ...p.form, amount: Number(e.target.value) } } : p))}
                  style={{ marginTop: "0.35rem" }}
                />
              </label>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem" }}>
                <Button type="button" variant="secondary" onClick={() => setAdjustModal(null)} style={smallBtnStyle}>
                  Cancel
                </Button>
                <Button
                  type="button"
                  style={smallBtnStyle}
                  onClick={async () => {
                    const p = adjustModal;
                    if (!p) return;
                    await patchAction({ action: "create_payroll_adjustment", payload: p.form });
                    setAdjustModal(null);
                    setMessage("Adjustment added.");
                  }}
                >
                  Add
                </Button>
              </div>
            </AdminModal>
          ) : null}
        </>
      )}
    </AdminShell>
  );
}

