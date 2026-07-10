"use client";

import { useEffect, useMemo, useState } from "react";
import { useApiData } from "@/lib/queries";
import { useServerPaginatedList } from "@/lib/hooks/useServerPaginatedList";
import type {
  ConcessionRequest,
  ConcessionRule,
  CreditNoteRequest,
  ExamFeeInvoice,
  FeePaymentsSummary,
  FeeStructure,
  FeesData,
  FeePayment,
  PaginatedResult,
  RefundRequest,
  RequestCreditNoteInput,
  SaveConcessionRuleInput,
  SaveFeeStructureInput,
  StudentFeeLedgerRow,
} from "@eduos/types";
import {
  Button,
  ChartLegend,
  DataTable,
  type DataTableColumn,
  DonutChart,
  IconAlertTriangle,
  IconRupee,
  IconUsers,
  IconWallet,
  Input,
  ListSearchBar,
  ProgressMeter,
  ProgressRing,
  StatCard,
  filterBySearch,
} from "@eduos/ui";
import { AdminShell } from "../AdminShell";
import { AdminModal } from "../AdminModal";
import { AdminMessage, AdminTabs } from "../ui";

import {
  CollectionPeriod,
  currentIsoWeek,
  currentMonth,
  formatCollectionPeriodLabel,
  isoWeekRange,
  monthRange,
  todayDate,
} from "./feesCollectionUtils";
import {
  paymentChannelLabel,
  paymentMethodShort,
  RECORD_PAYMENT_METHODS,
  type RecordPaymentMethod,
} from "./feesPaymentLabels";
import { daysOverdue, ESCALATION_LEGEND, feesSetupStatus } from "./feesSetupUtils";

function formatInr(n: number): string {
  return `₹${n.toLocaleString("en-IN")}`;
}

function paymentDate(iso: string): string {
  return iso.slice(0, 10);
}





const ALL_TABS = [
  "Structure",
  "Concessions",
  "Collections",
  "Defaulters",
  "Installments",
  "Reconciliation",
  "Refunds",
  "Scholarships",
  "Invoices",
] as const;
type Tab = (typeof ALL_TABS)[number];

const SCHOOL_HIDDEN_TABS = new Set<Tab>(["Scholarships", "Invoices"]);

function visibleTabs(data: FeesData): Tab[] {
  if (data.institutionType === "school") {
    return ALL_TABS.filter((t) => !SCHOOL_HIDDEN_TABS.has(t));
  }
  return [...ALL_TABS];
}

function idemHeaders(): HeadersInit {
  return {
    "Content-Type": "application/json",
    "Idempotency-Key": `fees-${Date.now()}`,
  };
}

export function FeesView() {
  const { data, error: loadQueryError, refetch } = useApiData<FeesData>("/api/admin/fees");
  const load = refetch;
  const loadError = loadQueryError
    ? loadQueryError instanceof Error
      ? loadQueryError.message
      : "Could not load fees."
    : null;
  const [tab, setTab] = useState<Tab>("Collections");
  const [message, setMessage] = useState<string | null>(null);

  const [structureModal, setStructureModal] = useState(false);
  const [structureForm, setStructureForm] = useState<SaveFeeStructureInput>({
    name: "Annual fee",
    appliesToLabel: "Class 10-A",
    components: [{ name: "Tuition", kind: "tuition", amount: 22000 }],
    installments: [{ label: "Installment 1", dueDate: new Date().toISOString().slice(0, 10), amount: 12000 }],
  });

  const [ruleModal, setRuleModal] = useState(false);
  const [ruleForm, setRuleForm] = useState<SaveConcessionRuleInput>({
    name: "Scholarship",
    description: "Needs approval",
    percentOff: 10,
    requiresApproval: true,
    active: true,
  });

  const [paymentModal, setPaymentModal] = useState<null | { row: StudentFeeLedgerRow; amount: number; method: RecordPaymentMethod; referenceNo: string }>(null);
  const [expandedStudentId, setExpandedStudentId] = useState<string | null>(null);
  const [generateStructureId, setGenerateStructureId] = useState("");
  const [refundModal, setRefundModal] = useState<null | { payment: FeePayment; reason: string }>(null);
  const [creditModal, setCreditModal] = useState<null | { payload: RequestCreditNoteInput }>(null);
  const [studentSearch, setStudentSearch] = useState("");
  const [collectionPeriod, setCollectionPeriod] = useState<CollectionPeriod>("day");
  const [collectionDay, setCollectionDay] = useState(todayDate);
  const [collectionWeek, setCollectionWeek] = useState(currentIsoWeek);
  const [collectionMonth, setCollectionMonth] = useState(currentMonth);

  async function patchAction(body: Record<string, unknown>) {
    const res = await fetch("/api/admin/fees/actions", {
      method: "PATCH",
      credentials: "include",
      headers: idemHeaders(),
      body: JSON.stringify(body),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      setMessage((json as { error?: string }).error ?? "Request failed");
      return null;
    }
    await load();
    return json;
  }

  const overdue = useMemo(() => (data?.ledger ?? []).filter((r) => r.isOverdue), [data?.ledger]);

  const ledgerStudentFields = (r: StudentFeeLedgerRow) => [r.studentName, r.classLabel, r.studentId];

  const filteredLedger = useMemo(
    () => filterBySearch(data?.ledger ?? [], studentSearch, ledgerStudentFields),
    [data?.ledger, studentSearch],
  );

  const filteredOverdue = useMemo(
    () => filterBySearch(overdue, studentSearch, ledgerStudentFields),
    [overdue, studentSearch],
  );

  const filteredConcessionRequests = useMemo(
    () =>
      filterBySearch(data?.concessionRequests ?? [], studentSearch, (q) => [
        q.studentName,
        q.classLabel,
        q.ruleName,
      ]),
    [data?.concessionRequests, studentSearch],
  );

  const ledgerTotals = useMemo(() => {
    return (data?.ledger ?? []).reduce(
      (acc, r) => ({
        totalDue: acc.totalDue + r.totalDue,
        paid: acc.paid + r.paid,
        balance: acc.balance + r.balance,
      }),
      { totalDue: 0, paid: 0, balance: 0 },
    );
  }, [data?.ledger]);

  const collectionPct =
    ledgerTotals.totalDue > 0 ? Math.round((ledgerTotals.paid / ledgerTotals.totalDue) * 100) : 0;

  const collectionPeriodValue =
    collectionPeriod === "day"
      ? collectionDay
      : collectionPeriod === "week"
        ? collectionWeek
        : collectionMonth;

  // The period table/stats are server-paginated + server-aggregated (not a client
  // filter over a fully-loaded array) — a branch's payment history is unbounded.
  const periodDateRange = useMemo(() => {
    if (collectionPeriod === "day") return { from: collectionDay, to: collectionDay };
    if (collectionPeriod === "week") return isoWeekRange(collectionWeek);
    return monthRange(collectionMonth);
  }, [collectionPeriod, collectionDay, collectionWeek, collectionMonth]);

  const paymentsList = useServerPaginatedList<FeePayment>("/api/admin/fees/payments", {
    pageSize: 20,
    params: {
      status: "captured",
      date_from: periodDateRange.from,
      date_to: periodDateRange.to,
    },
  });

  const paymentsSummaryUrl = useMemo(() => {
    const qs = new URLSearchParams({
      status: "captured",
      date_from: periodDateRange.from,
      date_to: periodDateRange.to,
    });
    return `/api/admin/fees/payments/summary?${qs.toString()}`;
  }, [periodDateRange]);
  const { data: paymentsSummary } = useApiData<FeePaymentsSummary>(paymentsSummaryUrl);

  const periodMethodBreakdown = paymentsSummary?.methodBreakdown ?? { cash: 0, upi: 0, online: 0, other: 0 };
  const periodCollected = (paymentsSummary?.totalPaise ?? 0) / 100;
  const periodPaymentsCount = paymentsSummary?.count ?? 0;

  const periodPaymentsColumns = useMemo<DataTableColumn<FeePayment>[]>(
    () => [
      { key: "date", label: "Date", render: (p) => paymentDate(p.paidAt) },
      { key: "studentName", label: "Student" },
      { key: "classLabel", label: "Class" },
      { key: "amount", label: "Amount", render: (p) => formatInr(p.amount) },
      { key: "channel", label: "Channel", render: (p) => paymentChannelLabel(p) },
      { key: "method", label: "Method", render: (p) => paymentMethodShort(p) },
      { key: "receiptNo", label: "Receipt", render: (p) => p.receiptNo || "—" },
    ],
    [],
  );

  // Recent payments to pick one to refund — small, fixed preview (page 1 of the
  // same paginated endpoint), not the full unbounded history.
  const { data: recentPaymentsPage } = useApiData<PaginatedResult<FeePayment>>(
    tab === "Refunds" ? "/api/admin/fees/payments?page_size=8" : null,
  );
  const recentPayments = recentPaymentsPage?.results ?? [];

  const setup = useMemo(() => (data ? feesSetupStatus(data) : null), [data]);

  const periodLabel = formatCollectionPeriodLabel(collectionPeriod, collectionPeriodValue);

  const tabsForInstitution = useMemo(() => (data ? visibleTabs(data) : ALL_TABS), [data]);

  useEffect(() => {
    if (!data) return;
    if (!tabsForInstitution.includes(tab)) {
      setTab("Collections");
    }
  }, [data, tab, tabsForInstitution]);

  if (!data) {
    return (
      <AdminShell title="Fees">
        <section className="eduos-panel">
          <div style={{ fontWeight: 700, marginBottom: "0.35rem" }}>Fees</div>
          <div style={{ color: loadError ? "var(--eduos-danger)" : "var(--eduos-text-muted)" }}>
            {loadError ?? "Loading fees…"}
          </div>
          <div style={{ marginTop: "0.75rem", display: "flex", gap: "0.5rem" }}>
            <Button type="button" onClick={() => load()}>
              Retry
            </Button>
          </div>
        </section>
      </AdminShell>
    );
  }

  return (
    <AdminShell title="Fees">
      <AdminMessage>{message}</AdminMessage>

      <AdminTabs
        tabs={tabsForInstitution.map((t) => ({ id: t, label: t }))}
        active={tab}
        onChange={(t) => {
          setTab(t as Tab);
          setMessage(null);
        }}
      />

      {setup && !setup.isReady ? (
        <section
          className="eduos-panel"
          style={{ marginBottom: "1rem", borderLeft: "4px solid #d69e2e", padding: "0.75rem 1rem" }}
        >
          <div style={{ fontWeight: 700, marginBottom: "0.35rem" }}>Fee setup checklist</div>
          <ol style={{ margin: 0, paddingLeft: "1.25rem", fontSize: "0.8125rem", color: "var(--eduos-text-muted)" }}>
            <li style={{ color: setup.hasStructure ? "#1a5f4a" : undefined }}>
              {setup.hasStructure ? "Fee structure created" : "Create a fee structure (Structure tab)"}
            </li>
            <li style={{ color: setup.hasInvoices ? "#1a5f4a" : undefined }}>
              {setup.hasInvoices
                ? "Student invoices generated"
                : "Generate invoices for a class (Structure tab → Generate invoices)"}
            </li>
          </ol>
        </section>
      ) : null}

      {tab === "Collections" ? (
        <section className="eduos-panel">
          <h2 className="eduos-section-title">Collection dashboard</h2>
          <p style={{ margin: "0.35rem 0 1rem", fontSize: "0.8125rem", color: "var(--eduos-text-muted)" }}>
            View collections by day, week, or month. Outstanding and overdue reflect current branch totals.
          </p>

          <div
            style={{
              display: "flex",
              gap: "0.75rem",
              flexWrap: "wrap",
              alignItems: "flex-end",
              marginBottom: "1rem",
            }}
          >
            <label style={{ fontSize: "0.75rem" }}>
              Period
              <select
                value={collectionPeriod}
                onChange={(e) => setCollectionPeriod(e.target.value as CollectionPeriod)}
                className="eduos-input"
                style={{ display: "block", marginTop: "0.25rem", minWidth: "7rem" }}
              >
                <option value="day">Day</option>
                <option value="week">Week</option>
                <option value="month">Month</option>
              </select>
            </label>
            {collectionPeriod === "day" ? (
              <label style={{ fontSize: "0.75rem" }}>
                Date
                <Input
                  type="date"
                  value={collectionDay}
                  onChange={(e) => setCollectionDay(e.target.value)}
                  style={{ display: "block", marginTop: "0.25rem" }}
                />
              </label>
            ) : null}
            {collectionPeriod === "week" ? (
              <label style={{ fontSize: "0.75rem" }}>
                Week
                <Input
                  type="week"
                  value={collectionWeek}
                  onChange={(e) => setCollectionWeek(e.target.value)}
                  style={{ display: "block", marginTop: "0.25rem" }}
                />
              </label>
            ) : null}
            {collectionPeriod === "month" ? (
              <label style={{ fontSize: "0.75rem" }}>
                Month
                <Input
                  type="month"
                  value={collectionMonth}
                  onChange={(e) => setCollectionMonth(e.target.value)}
                  style={{ display: "block", marginTop: "0.25rem" }}
                />
              </label>
            ) : null}
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
              <Button
                type="button"
                onClick={() => {
                  setCollectionPeriod("day");
                  setCollectionDay(todayDate());
                }}
              >
                Today
              </Button>
              <Button
                type="button"
                onClick={() => {
                  setCollectionPeriod("week");
                  setCollectionWeek(currentIsoWeek());
                }}
              >
                This week
              </Button>
              <Button
                type="button"
                onClick={() => {
                  setCollectionPeriod("month");
                  setCollectionMonth(currentMonth());
                }}
              >
                This month
              </Button>
            </div>
          </div>

          <p style={{ margin: "0 0 1rem", fontSize: "0.8125rem", color: "var(--eduos-text-muted)" }}>
            Showing <strong>{periodLabel}</strong>
            {" · "}
            Cash {periodMethodBreakdown.cash} · UPI at school {periodMethodBreakdown.upi} · Online{" "}
            {periodMethodBreakdown.online}
          </p>

          <div className="eduos-admin-stat-grid">
            <StatCard
              label={`Collected (${collectionPeriod})`}
              value={formatInr(periodCollected)}
              icon={<IconRupee />}
              accent="#1a5f4a"
            />
            <StatCard
              label="Payments in period"
              value={String(periodPaymentsCount)}
              icon={<IconWallet />}
              accent="#2563eb"
            />
            <StatCard
              label="Outstanding (current)"
              value={formatInr(data.collection.outstandingTotal)}
              icon={<IconAlertTriangle />}
              accent="#d69e2e"
            />
            <StatCard
              label="Overdue (current)"
              value={`${data.collection.overdueCount} students`}
              icon={<IconUsers />}
              accent="#dc2626"
            />
          </div>

          {ledgerTotals.totalDue > 0 ? (
            <div className="eduos-chart-split" style={{ marginTop: "1.25rem" }}>
              <ProgressRing percent={collectionPct} color="#1a5f4a" label={`${collectionPct}%`} caption="collected" />
              <DonutChart
                data={[
                  { label: "Collected", value: ledgerTotals.paid, color: "#1a5f4a" },
                  { label: "Outstanding", value: ledgerTotals.balance, color: "#d69e2e" },
                ]}
                centerValue={formatInr(ledgerTotals.totalDue)}
                centerLabel="billed"
              />
              <div className="eduos-chart-split__legend">
                <ChartLegend
                  items={[
                    { label: "Collected", color: "#1a5f4a", value: formatInr(ledgerTotals.paid) },
                    { label: "Outstanding", color: "#d69e2e", value: formatInr(ledgerTotals.balance) },
                  ]}
                />
              </div>
            </div>
          ) : null}

          <h3 style={{ margin: "1.5rem 0 0.75rem", fontSize: "0.9375rem" }}>Payments in period</h3>
          <DataTable<FeePayment>
            columns={periodPaymentsColumns}
            rows={paymentsList.results}
            rowKey={(p) => p.id}
            loading={paymentsList.isLoading}
            page={paymentsList.page}
            pageSize={paymentsList.pageSize}
            totalCount={paymentsList.totalCount}
            onPageChange={paymentsList.setPage}
            emptyTitle="No payments recorded for this period"
            emptyDescription="Record fees from the Installments tab."
          />
        </section>
      ) : null}

      {tab === "Structure" ? (
        <section className="eduos-panel">
          <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "0.75rem" }}>
            <div>
              <h2 className="eduos-section-title">Fee structure configuration</h2>
              <p style={{ margin: "0.35rem 0 0", fontSize: "0.8125rem", color: "var(--eduos-text-muted)" }}>
                Define fee components and installment due dates per class. Enrolled students keep their snapshot when you edit.
              </p>
            </div>
            <Button type="button" onClick={() => setStructureModal(true)}>
              New structure
            </Button>
          </div>

          {data.structures.length > 0 ? (
            <div
              style={{
                display: "flex",
                gap: "0.75rem",
                flexWrap: "wrap",
                alignItems: "flex-end",
                marginTop: "1rem",
                marginBottom: "0.5rem",
              }}
            >
              <label style={{ fontSize: "0.75rem" }}>
                Structure
                <select
                  value={generateStructureId || data.structures[0]?.id || ""}
                  onChange={(e) => setGenerateStructureId(e.target.value)}
                  className="eduos-input"
                  style={{ display: "block", marginTop: "0.25rem", minWidth: "12rem" }}
                >
                  {data.structures.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} (v{s.version})
                    </option>
                  ))}
                </select>
              </label>
              <Button
                type="button"
                onClick={() => {
                  const structure = data.structures.find(
                    (s) => s.id === (generateStructureId || data.structures[0]?.id),
                  );
                  if (!structure?.batchId || !data.currentAcademicYearId) {
                    setMessage("Structure needs a class/batch and academic year before generating invoices.");
                    return;
                  }
                  patchAction({
                    action: "generate_invoices",
                    batchId: structure.batchId,
                    feeStructureId: structure.id,
                    academicYearId: data.currentAcademicYearId,
                  });
                }}
              >
                Generate invoices
              </Button>
            </div>
          ) : null}

          <table className="eduos-admin-table" style={{ marginTop: "1rem" }}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Applies to</th>
                <th>Components</th>
                <th>Installments</th>
              </tr>
            </thead>
            <tbody>
              {data.structures.map((s) => (
                <StructureRow key={s.id} s={s} />
              ))}
            </tbody>
          </table>
        </section>
      ) : null}

      {tab === "Concessions" ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <section className="eduos-panel">
            <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "0.75rem" }}>
              <div>
                <h2 className="eduos-section-title">Concession & scholarship rules</h2>
                <p style={{ margin: "0.35rem 0 0", fontSize: "0.8125rem", color: "var(--eduos-text-muted)" }}>
                  Define discount rules and approval requirements.
                </p>
              </div>
              <Button type="button" onClick={() => setRuleModal(true)}>
                New rule
              </Button>
            </div>

            <table className="eduos-admin-table" style={{ marginTop: "1rem" }}>
              <thead>
                <tr>
                  <th>Rule</th>
                  <th>% off</th>
                  <th>Approval</th>
                  <th>Active</th>
                </tr>
              </thead>
              <tbody>
                {data.concessionRules.map((r) => (
                  <RuleRow key={r.id} r={r} />
                ))}
              </tbody>
            </table>
          </section>

          <section className="eduos-panel">
            <h2 className="eduos-section-title">Approval workflow</h2>
            <p style={{ margin: "0.35rem 0 1rem", fontSize: "0.8125rem", color: "var(--eduos-text-muted)" }}>
              Approve concessions before invoice generation so the discount applies to student dues. Approvals after
              invoicing apply on the next billing cycle only.
            </p>
            <ListSearchBar
              value={studentSearch}
              onChange={setStudentSearch}
              placeholder="Search student, class, or rule…"
              total={data.concessionRequests.length}
              filtered={filteredConcessionRequests.length}
            />
            <table className="eduos-admin-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Class</th>
                  <th>Rule</th>
                  <th>Status</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {filteredConcessionRequests.map((q) => (
                  <RequestRow
                    key={q.id}
                    q={q}
                    onReview={(approve) =>
                      patchAction({ action: "review_concession", payload: { requestId: q.id, approve } })
                    }
                  />
                ))}
              </tbody>
            </table>
          </section>
        </div>
      ) : null}

      {tab === "Defaulters" ? (
        <section className="eduos-panel">
          <h2 className="eduos-section-title">Defaulter list & escalation</h2>
          <p style={{ margin: "0.35rem 0 0.75rem", fontSize: "0.8125rem", color: "var(--eduos-text-muted)" }}>
            {ESCALATION_LEGEND.map((e) => `${e.label}: ${e.detail}`).join(" · ")}
          </p>
          <ListSearchBar
            value={studentSearch}
            onChange={setStudentSearch}
            placeholder="Search student or class…"
            total={overdue.length}
            filtered={filteredOverdue.length}
          />
          <table className="eduos-admin-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Class</th>
                <th>Balance</th>
                <th>Days overdue</th>
                <th>Escalation</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {filteredOverdue.map((r) => (
                <DefaulterRow
                  key={r.studentId}
                  r={r}
                  onEscalate={(level) => patchAction({ action: "escalate_defaulter", studentId: r.studentId, level })}
                  onCollect={() => {
                    setTab("Installments");
                    setPaymentModal({
                      row: r,
                      amount: r.balance,
                      method: "cash",
                      referenceNo: "",
                    });
                  }}
                />
              ))}
            </tbody>
          </table>
        </section>
      ) : null}

      {tab === "Installments" ? (
        <section className="eduos-panel">
          <h2 className="eduos-section-title">Installment plans</h2>
          <p style={{ margin: "0.35rem 0 1rem", fontSize: "0.8125rem", color: "var(--eduos-text-muted)" }}>
            Track partial payments and show remaining balance.
          </p>
          <ListSearchBar
            value={studentSearch}
            onChange={setStudentSearch}
            placeholder="Search student or class…"
            total={data.ledger.length}
            filtered={filteredLedger.length}
          />
          <table className="eduos-admin-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Total due</th>
                <th>Paid</th>
                <th>Balance</th>
                <th>Collected</th>
                <th>Next due</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {filteredLedger.map((r) => (
                <InstallmentRow
                  key={r.studentId}
                  r={r}
                  expanded={expandedStudentId === r.studentId}
                  schedule={data.installmentSchedulesByStudent?.[r.studentId] ?? []}
                  onToggle={() =>
                    setExpandedStudentId((id) => (id === r.studentId ? null : r.studentId))
                  }
                  onPay={() =>
                    setPaymentModal({
                      row: r,
                      amount: r.balance,
                      method: "cash",
                      referenceNo: "",
                    })
                  }
                />
              ))}
            </tbody>
          </table>
        </section>
      ) : null}

      {tab === "Reconciliation" ? (
        <section className="eduos-panel">
          <div style={{ display: "flex", justifyContent: "space-between", gap: "0.75rem", flexWrap: "wrap" }}>
            <div>
              <h2 className="eduos-section-title">Payment reconciliation</h2>
              <p style={{ margin: "0.35rem 0 0", fontSize: "0.8125rem", color: "var(--eduos-text-muted)" }}>
                Stuck Razorpay payments — poll the gateway when a parent paid online but the status is still pending.
              </p>
            </div>
            <Button type="button" onClick={() => patchAction({ action: "reconcile" })}>
              Reconcile now
            </Button>
          </div>

          <table className="eduos-admin-table" style={{ marginTop: "1rem" }}>
            <thead>
              <tr>
                <th>Order</th>
                <th>Payment</th>
                <th>Status</th>
                <th>Last checked</th>
                <th>Note</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {data.reconciliation.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ color: "var(--eduos-text-muted)" }}>
                    No pending online payments need reconciliation.
                  </td>
                </tr>
              ) : (
                data.reconciliation.map((r) => (
                  <tr key={r.orderId}>
                    <td>{r.orderId}</td>
                    <td>{r.paymentId ?? "—"}</td>
                    <td>{r.status}</td>
                    <td>{new Date(r.lastCheckedAt).toLocaleTimeString()}</td>
                    <td>{r.note}</td>
                    <td>
                      <div style={{ display: "flex", justifyContent: "flex-end" }}>
                          <Button type="button" onClick={() => patchAction({ action: "reconcile" })}>
                            Retry
                          </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          <div style={{ marginTop: "1rem", fontWeight: 700 }}>Webhook log</div>
          <table className="eduos-admin-table" style={{ marginTop: "0.5rem" }}>
            <thead>
              <tr>
                <th>Event</th>
                <th>Idempotency</th>
                <th>Verified</th>
                <th>Status</th>
                <th>Note</th>
              </tr>
            </thead>
            <tbody>
              {data.webhooks.slice(0, 8).map((w) => (
                <tr key={w.id}>
                  <td>{w.eventType}</td>
                  <td>{w.idempotencyKey}</td>
                  <td>{w.signatureVerified ? "Yes" : "No"}</td>
                  <td>{w.status}</td>
                  <td>{w.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      ) : null}

      {tab === "Refunds" ? (
        <section className="eduos-panel">
          <h2 className="eduos-section-title">Refund management</h2>
          <p style={{ margin: "0.35rem 0 1rem", fontSize: "0.8125rem", color: "var(--eduos-text-muted)" }}>
            Request a refund from a captured payment. Approving processes immediately (Razorpay refunds go to the
            original payment method; cash refunds are disbursed at school).
          </p>

          <div style={{ fontWeight: 700, marginBottom: "0.5rem" }}>Payments</div>
          <table className="eduos-admin-table">
            <thead>
              <tr>
                <th>Receipt</th>
                <th>Student</th>
                <th>Amount</th>
                <th>Channel</th>
                <th>Status</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {recentPayments.map((p) => (
                <tr key={p.id}>
                  <td>{p.receiptNo}</td>
                  <td>{p.studentName}</td>
                  <td>₹{p.amount.toLocaleString("en-IN")}</td>
                  <td>{paymentChannelLabel(p)}</td>
                  <td>{p.status}</td>
                  <td>
                    <div style={{ display: "flex", justifyContent: "flex-end" }}>
                      <Button type="button" disabled={p.status === "refunded"} onClick={() => setRefundModal({ payment: p, reason: "" })}>
                        Request refund
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ fontWeight: 700, margin: "1rem 0 0.5rem" }}>Refund requests</div>
          <table className="eduos-admin-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Amount</th>
                <th>Reason</th>
                <th>Status</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {data.refunds.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ color: "var(--eduos-text-muted)" }}>
                    No refund requests yet.
                  </td>
                </tr>
              ) : (
                data.refunds.map((r) => (
                  <RefundRow
                    key={r.id}
                    r={r}
                    onApprove={() => patchAction({ action: "review_refund", payload: { refundId: r.id, approve: true } })}
                    onReject={() => patchAction({ action: "review_refund", payload: { refundId: r.id, approve: false } })}
                  />
                ))
              )}
            </tbody>
          </table>
        </section>
      ) : null}

      {tab === "Scholarships" ? (
        <section className="eduos-panel">
          <div style={{ display: "flex", justifyContent: "space-between", gap: "0.75rem", flexWrap: "wrap" }}>
            <div>
              <h2 className="eduos-section-title">Retroactive scholarship</h2>
              <p style={{ margin: "0.35rem 0 0", fontSize: "0.8125rem", color: "var(--eduos-text-muted)" }}>
                Create a credit note (requires admin approval).
              </p>
            </div>
            <Button
              type="button"
              onClick={() =>
                setCreditModal({
                  payload: {
                    studentId: data.ledger[0]?.studentId ?? "stu-1",
                    studentName: data.ledger[0]?.studentName ?? "Student",
                    classLabel: data.ledger[0]?.classLabel ?? "—",
                    amount: 500,
                    reason: "Scholarship adjustment",
                  },
                })
              }
            >
              New credit note request
            </Button>
          </div>

          <div style={{ fontWeight: 700, marginTop: "1rem" }}>Pending requests</div>
          <table className="eduos-admin-table" style={{ marginTop: "0.5rem" }}>
            <thead>
              <tr>
                <th>Student</th>
                <th>Amount</th>
                <th>Reason</th>
                <th>Status</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {(data.creditNoteRequests ?? []).length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ color: "var(--eduos-text-muted)" }}>
                    No credit note requests.
                  </td>
                </tr>
              ) : (
                (data.creditNoteRequests as CreditNoteRequest[]).map((r) => (
                  <tr key={r.id}>
                    <td>{r.studentName}</td>
                    <td>₹{r.amount.toLocaleString("en-IN")}</td>
                    <td>{r.reason}</td>
                    <td>{r.status}</td>
                    <td>
                      {r.status === "pending" ? (
                        <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
                          <Button
                            type="button"
                            onClick={() =>
                              patchAction({
                                action: "review_credit_note",
                                payload: { creditNoteRequestId: r.id, approve: false },
                              })
                            }
                          >
                            Reject
                          </Button>
                          <Button
                            type="button"
                            onClick={() =>
                              patchAction({
                                action: "review_credit_note",
                                payload: { creditNoteRequestId: r.id, approve: true },
                              })
                            }
                          >
                            Approve
                          </Button>
                        </div>
                      ) : (
                        <span style={{ color: "var(--eduos-text-muted)" }}>{r.reviewNote ?? "—"}</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </section>
      ) : null}

      {tab === "Invoices" ? (
        <section className="eduos-panel">
          <h2 className="eduos-section-title">Exam fee invoices</h2>
          {data.institutionType === "college" ? (
            <p style={{ margin: "0.35rem 0 1rem", fontSize: "0.8125rem", color: "var(--eduos-text-muted)" }}>
              Hall ticket can be blocked until the linked invoice is paid.
            </p>
          ) : (
            <p style={{ margin: "0.35rem 0 1rem", fontSize: "0.8125rem", color: "var(--eduos-text-muted)" }}>
              Exam fee invoices for school examinations.
            </p>
          )}
          <table className="eduos-admin-table">
            <thead>
              <tr>
                <th>Invoice</th>
                <th>Student</th>
                <th>Exam</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {(data.examFeeInvoices ?? []).length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ color: "var(--eduos-text-muted)" }}>
                    No exam invoices.
                  </td>
                </tr>
              ) : (
                (data.examFeeInvoices as ExamFeeInvoice[]).map((inv) => (
                  <tr key={inv.id}>
                    <td>{inv.id}</td>
                    <td>{inv.studentName}</td>
                    <td>{inv.examSlotId}</td>
                    <td>₹{inv.amount.toLocaleString("en-IN")}</td>
                    <td>{inv.status}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </section>
      ) : null}

      {structureModal ? (
        <AdminModal title="New fee structure" onClose={() => setStructureModal(false)} wide>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
            <label style={{ fontSize: "0.875rem" }}>
              Name
              <Input value={structureForm.name} onChange={(e) => setStructureForm((p) => ({ ...p, name: e.target.value }))} style={{ marginTop: "0.25rem" }} />
            </label>
            <label style={{ fontSize: "0.875rem" }}>
              Class / batch
              <select
                value={structureForm.batchId ?? ""}
                onChange={(e) => {
                  const batch = data.batches?.find((b) => b.id === e.target.value);
                  setStructureForm((p) => ({
                    ...p,
                    batchId: e.target.value,
                    appliesToLabel: batch?.label ?? p.appliesToLabel,
                    academicYearId: data.currentAcademicYearId ?? p.academicYearId,
                  }));
                }}
                className="eduos-input"
                style={{ display: "block", marginTop: "0.25rem", width: "100%" }}
              >
                <option value="">Select class</option>
                {(data.batches ?? []).map((b) => (
                  <option key={b.id} value={b.id}>{b.label}</option>
                ))}
              </select>
            </label>
          </div>
          <div style={{ marginTop: "1rem" }}>
            <div style={{ fontWeight: 700, marginBottom: "0.35rem" }}>Fee component</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.75rem" }}>
              <Input
                value={structureForm.components[0]?.name ?? ""}
                onChange={(e) =>
                  setStructureForm((p) => ({ ...p, components: [{ ...(p.components[0] ?? { kind: "tuition", amount: 0 }), name: e.target.value }] }))
                }
              />
              <select
                value={structureForm.components[0]?.kind ?? "tuition"}
                onChange={(e) =>
                  setStructureForm((p) => ({ ...p, components: [{ ...(p.components[0] ?? { name: "", amount: 0 }), kind: e.target.value as SaveFeeStructureInput["components"][0]["kind"] }] }))
                }
                style={{ padding: "0.5rem", borderRadius: "var(--eduos-radius)", border: "1px solid var(--eduos-border)" }}
              >
                <option value="tuition">Tuition</option>
                <option value="exam">Exam</option>
                <option value="transport">Transport</option>
                <option value="hostel">Hostel</option>
                <option value="other">Other</option>
              </select>
              <Input
                type="number"
                value={structureForm.installments.reduce((s, i) => s + Number(i.amount || 0), 0) || structureForm.components[0]?.amount || 0}
                readOnly
                title="Total from installments below"
              />
            </div>
          </div>
          <div style={{ marginTop: "1rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.35rem" }}>
              <div style={{ fontWeight: 700 }}>Installments</div>
              <Button
                type="button"
                onClick={() =>
                  setStructureForm((p) => ({
                    ...p,
                    installments: [
                      ...p.installments,
                      {
                        label: `Installment ${p.installments.length + 1}`,
                        dueDate: todayStr(),
                        amount: 0,
                      },
                    ],
                  }))
                }
              >
                Add installment
              </Button>
            </div>
            {structureForm.installments.map((inst, idx) => (
              <div key={idx} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr auto", gap: "0.5rem", marginBottom: "0.5rem" }}>
                <Input
                  value={inst.label}
                  onChange={(e) =>
                    setStructureForm((p) => ({
                      ...p,
                      installments: p.installments.map((row, i) => (i === idx ? { ...row, label: e.target.value } : row)),
                    }))
                  }
                />
                <Input
                  type="date"
                  value={inst.dueDate}
                  onChange={(e) =>
                    setStructureForm((p) => ({
                      ...p,
                      installments: p.installments.map((row, i) => (i === idx ? { ...row, dueDate: e.target.value } : row)),
                    }))
                  }
                />
                <Input
                  type="number"
                  value={inst.amount}
                  onChange={(e) =>
                    setStructureForm((p) => ({
                      ...p,
                      installments: p.installments.map((row, i) => (i === idx ? { ...row, amount: Number(e.target.value) } : row)),
                      components: [{ ...(p.components[0] ?? { name: "Tuition", kind: "tuition" }), amount: p.installments.reduce((s, row, i) => s + (i === idx ? Number(e.target.value) : Number(row.amount || 0)), 0) }],
                    }))
                  }
                />
                <Button
                  type="button"
                  disabled={structureForm.installments.length <= 1}
                  onClick={() =>
                    setStructureForm((p) => ({
                      ...p,
                      installments: p.installments.filter((_, i) => i !== idx),
                    }))
                  }
                >
                  Remove
                </Button>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem", marginTop: "1.25rem" }}>
            <Button type="button" onClick={() => setStructureModal(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              onClick={async () => {
                await patchAction({ action: "save_structure", payload: structureForm });
                setStructureModal(false);
              }}
            >
              Save
            </Button>
          </div>
        </AdminModal>
      ) : null}

      {ruleModal ? (
        <AdminModal title="New concession rule" onClose={() => setRuleModal(false)} wide>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
            <label style={{ fontSize: "0.875rem" }}>
              Name
              <Input value={ruleForm.name} onChange={(e) => setRuleForm((p) => ({ ...p, name: e.target.value }))} style={{ marginTop: "0.25rem" }} />
            </label>
            <label style={{ fontSize: "0.875rem" }}>
              % off
              <Input type="number" value={ruleForm.percentOff} onChange={(e) => setRuleForm((p) => ({ ...p, percentOff: Number(e.target.value) }))} style={{ marginTop: "0.25rem" }} />
            </label>
            <label style={{ fontSize: "0.875rem", gridColumn: "1 / -1" }}>
              Description
              <Input value={ruleForm.description} onChange={(e) => setRuleForm((p) => ({ ...p, description: e.target.value }))} style={{ marginTop: "0.25rem" }} />
            </label>
            <label style={{ display: "flex", gap: "0.5rem", alignItems: "center", fontSize: "0.875rem" }}>
              <input type="checkbox" checked={ruleForm.requiresApproval} onChange={() => setRuleForm((p) => ({ ...p, requiresApproval: !p.requiresApproval }))} />
              Requires approval
            </label>
            <label style={{ display: "flex", gap: "0.5rem", alignItems: "center", fontSize: "0.875rem" }}>
              <input type="checkbox" checked={ruleForm.active} onChange={() => setRuleForm((p) => ({ ...p, active: !p.active }))} />
              Active
            </label>
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem", marginTop: "1.25rem" }}>
            <Button type="button" onClick={() => setRuleModal(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              onClick={async () => {
                await patchAction({ action: "save_concession_rule", payload: ruleForm });
                setRuleModal(false);
              }}
            >
              Save
            </Button>
          </div>
        </AdminModal>
      ) : null}

      {paymentModal ? (
        <AdminModal
          title="Record payment"
          onClose={() => setPaymentModal(null)}
          wide
        >
          <p style={{ fontSize: "0.875rem", marginBottom: "0.75rem" }}>
            <strong>{paymentModal.row.studentName}</strong> · {paymentModal.row.classLabel}
          </p>
          <label style={{ display: "block", fontSize: "0.875rem", marginBottom: "0.75rem" }}>
            Payment method
            <select
              value={paymentModal.method}
              onChange={(e) =>
                setPaymentModal((p) => (p ? { ...p, method: e.target.value as RecordPaymentMethod } : p))
              }
              className="eduos-input"
              style={{ display: "block", marginTop: "0.35rem", width: "100%" }}
            >
              {RECORD_PAYMENT_METHODS.map((m) => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          </label>
          <label style={{ display: "block", fontSize: "0.875rem", marginBottom: "0.75rem" }}>
            Reference / receipt note (optional)
            <Input
              value={paymentModal.referenceNo}
              onChange={(e) => setPaymentModal((p) => (p ? { ...p, referenceNo: e.target.value } : p))}
              style={{ marginTop: "0.35rem" }}
              placeholder="UPI ref, cheque no., etc."
            />
          </label>
          <label style={{ display: "block", fontSize: "0.875rem", marginBottom: "1rem" }}>
            Amount (₹)
            <Input
              type="number"
              min={1}
              max={paymentModal.row.balance}
              value={paymentModal.amount}
              onChange={(e) => setPaymentModal((p) => (p ? { ...p, amount: Number(e.target.value) } : p))}
              style={{ marginTop: "0.35rem" }}
            />
          </label>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem" }}>
            <Button type="button" onClick={() => setPaymentModal(null)}>
              Cancel
            </Button>
            <Button
              type="button"
              onClick={async () => {
                const p = paymentModal;
                if (!p) return;
                await patchAction({
                  action: "record_payment",
                  studentId: p.row.studentId,
                  studentName: p.row.studentName,
                  classLabel: p.row.classLabel,
                  amount: p.amount,
                  method: p.method,
                  referenceNo: p.referenceNo || undefined,
                });
                setMessage(`Payment recorded for ${p.row.studentName}.`);
                setPaymentModal(null);
              }}
            >
              Record payment
            </Button>
          </div>
        </AdminModal>
      ) : null}

      {refundModal ? (
        <AdminModal title="Request refund" onClose={() => setRefundModal(null)} wide>
          <p style={{ fontSize: "0.875rem", marginBottom: "0.5rem" }}>
            <strong>{refundModal.payment.studentName}</strong> · Receipt {refundModal.payment.receiptNo}
          </p>
          <p style={{ fontSize: "0.8125rem", color: "var(--eduos-text-muted)", marginBottom: "1rem" }}>
            Amount: ₹{refundModal.payment.amount.toLocaleString("en-IN")}
          </p>
          <label style={{ display: "block", fontSize: "0.875rem", marginBottom: "1rem" }}>
            Reason
            <Input value={refundModal.reason} onChange={(e) => setRefundModal((p) => (p ? { ...p, reason: e.target.value } : p))} style={{ marginTop: "0.35rem" }} />
          </label>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem" }}>
            <Button type="button" onClick={() => setRefundModal(null)}>
              Cancel
            </Button>
            <Button
              type="button"
              onClick={async () => {
                const p = refundModal;
                if (!p) return;
                await patchAction({ action: "request_refund", paymentId: p.payment.id, amount: p.payment.amount, reason: p.reason });
                setMessage("Refund request created.");
                setRefundModal(null);
              }}
            >
              Submit
            </Button>
          </div>
        </AdminModal>
      ) : null}

      {creditModal ? (
        <AdminModal title="New credit note request" onClose={() => setCreditModal(null)} wide>
          <label style={{ display: "block", fontSize: "0.875rem", marginBottom: "0.75rem" }}>
            Student
            <Input
              value={creditModal.payload.studentName}
              onChange={(e) =>
                setCreditModal((p) => (p ? { payload: { ...p.payload, studentName: e.target.value } } : p))
              }
              style={{ marginTop: "0.35rem" }}
            />
          </label>
          <label style={{ display: "block", fontSize: "0.875rem", marginBottom: "0.75rem" }}>
            Amount (₹)
            <Input
              type="number"
              value={creditModal.payload.amount}
              onChange={(e) =>
                setCreditModal((p) => (p ? { payload: { ...p.payload, amount: Number(e.target.value) } } : p))
              }
              style={{ marginTop: "0.35rem" }}
            />
          </label>
          <label style={{ display: "block", fontSize: "0.875rem", marginBottom: "1rem" }}>
            Reason
            <Input
              value={creditModal.payload.reason}
              onChange={(e) =>
                setCreditModal((p) => (p ? { payload: { ...p.payload, reason: e.target.value } } : p))
              }
              style={{ marginTop: "0.35rem" }}
            />
          </label>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem" }}>
            <Button type="button" onClick={() => setCreditModal(null)}>
              Cancel
            </Button>
            <Button
              type="button"
              onClick={async () => {
                const p = creditModal;
                if (!p) return;
                await patchAction({ action: "request_credit_note", payload: p.payload });
                setMessage("Credit note request created.");
                setCreditModal(null);
              }}
            >
              Submit
            </Button>
          </div>
        </AdminModal>
      ) : null}
    </AdminShell>
  );
}

function StructureRow({ s }: { s: FeeStructure }) {
  const comp = s.components.reduce((sum, c) => sum + c.amount, 0);
  const inst = s.installments.reduce((sum, i) => sum + i.amount, 0);
  return (
    <tr>
      <td>
        {s.name}
        <span style={{ marginLeft: "0.35rem", fontSize: "0.75rem", color: "var(--eduos-text-muted)" }}>v{s.version}</span>
      </td>
      <td>{s.appliesToLabel}</td>
      <td>₹{comp.toLocaleString("en-IN")} ({s.components.length})</td>
      <td>₹{inst.toLocaleString("en-IN")} ({s.installments.length})</td>
    </tr>
  );
}

function RuleRow({ r }: { r: ConcessionRule }) {
  return (
    <tr>
      <td>
        <div style={{ fontWeight: 700 }}>{r.name}</div>
        <div style={{ color: "var(--eduos-text-muted)" }}>{r.description}</div>
      </td>
      <td>{r.percentOff}%</td>
      <td>{r.requiresApproval ? "Yes" : "No"}</td>
      <td>{r.active ? "Active" : "Inactive"}</td>
    </tr>
  );
}

function RequestRow({ q, onReview }: { q: ConcessionRequest; onReview: (approve: boolean) => void }) {
  return (
    <tr>
      <td>{q.studentName}</td>
      <td>{q.classLabel}</td>
      <td>{q.ruleName}</td>
      <td>{q.status}</td>
      <td>
        {q.status === "pending" ? (
          <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
            <Button type="button" onClick={() => onReview(false)}>
              Reject
            </Button>
            <Button type="button" onClick={() => onReview(true)}>
              Approve
            </Button>
          </div>
        ) : (
          <span style={{ color: "var(--eduos-text-muted)" }}>{q.reviewNote ?? "—"}</span>
        )}
      </td>
    </tr>
  );
}

function DefaulterRow({
  r,
  onEscalate,
  onCollect,
}: {
  r: StudentFeeLedgerRow;
  onEscalate: (level: 1 | 2 | 3) => void;
  onCollect: () => void;
}) {
  const overdueDays = daysOverdue(r.nextDueDate);
  return (
    <tr>
      <td>{r.studentName}</td>
      <td>{r.classLabel}</td>
      <td style={{ fontWeight: 700, color: "var(--eduos-danger)" }}>₹{r.balance.toLocaleString("en-IN")}</td>
      <td>{overdueDays != null ? `${overdueDays} days` : "—"}</td>
      <td>L{r.escalationLevel}</td>
      <td>
        <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end", flexWrap: "wrap" }}>
          <Button type="button" onClick={onCollect}>
            Collect
          </Button>
          <Button type="button" onClick={() => onEscalate(1)}>
            L1
          </Button>
          <Button type="button" onClick={() => onEscalate(2)}>
            L2
          </Button>
          <Button type="button" onClick={() => onEscalate(3)}>
            L3
          </Button>
        </div>
      </td>
    </tr>
  );
}

function InstallmentRow({
  r,
  expanded,
  schedule,
  onToggle,
  onPay,
}: {
  r: StudentFeeLedgerRow;
  expanded: boolean;
  schedule: import("@eduos/types").StudentInstallmentScheduleRow[];
  onToggle: () => void;
  onPay: () => void;
}) {
  const pct = r.totalDue > 0 ? Math.round((r.paid / r.totalDue) * 100) : 0;
  // Lazy-loaded only once the row is expanded — a student's payment history is
  // small, but there's no reason to fetch it for every row on every render.
  const paymentsUrl = `/api/admin/fees/payments?status=captured&studentId=${encodeURIComponent(r.studentId)}&page_size=50`;
  const { data: paymentsPage, isLoading: paymentsLoading } = useApiData<PaginatedResult<FeePayment>>(
    paymentsUrl,
    { enabled: expanded },
  );
  const payments = paymentsPage?.results ?? [];
  return (
    <>
      <tr onClick={onToggle} style={{ cursor: "pointer" }}>
        <td>
          {expanded ? "▾ " : "▸ "}
          {r.studentName}
        </td>
        <td>₹{r.totalDue.toLocaleString("en-IN")}</td>
        <td>₹{r.paid.toLocaleString("en-IN")}</td>
        <td style={{ fontWeight: 700 }}>₹{r.balance.toLocaleString("en-IN")}</td>
        <td style={{ minWidth: "10rem" }}>
          <ProgressMeter
            label={`${pct}%`}
            value={r.paid}
            max={r.totalDue || 1}
            valueLabel=""
            color={pct >= 100 ? "#1a5f4a" : pct > 0 ? "#2563eb" : "#d69e2e"}
          />
        </td>
        <td>{r.nextDueDate ?? "—"}</td>
        <td onClick={(e) => e.stopPropagation()}>
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <Button type="button" disabled={r.balance <= 0} onClick={onPay}>
              Record payment
            </Button>
          </div>
        </td>
      </tr>
      {expanded ? (
        <tr>
          <td colSpan={7} style={{ background: "var(--eduos-bg)", padding: "0.75rem 1rem" }}>
            <div style={{ fontWeight: 700, marginBottom: "0.5rem" }}>Installment schedule</div>
            {schedule.length === 0 ? (
              <div style={{ color: "var(--eduos-text-muted)", fontSize: "0.8125rem" }}>No installment schedule yet.</div>
            ) : (
              <table className="eduos-admin-table" style={{ marginBottom: "0.75rem" }}>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Due date</th>
                    <th>Amount</th>
                    <th>Paid</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {schedule.map((row) => (
                    <tr key={row.sequence}>
                      <td>{row.label}</td>
                      <td>{row.dueDate}</td>
                      <td>₹{row.amount.toLocaleString("en-IN")}</td>
                      <td>₹{row.paid.toLocaleString("en-IN")}</td>
                      <td>{row.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            <div style={{ fontWeight: 700, marginBottom: "0.35rem" }}>Payment history</div>
            {paymentsLoading ? (
              <div style={{ color: "var(--eduos-text-muted)", fontSize: "0.8125rem" }}>Loading…</div>
            ) : payments.length === 0 ? (
              <div style={{ color: "var(--eduos-text-muted)", fontSize: "0.8125rem" }}>No payments yet.</div>
            ) : (
              <table className="eduos-admin-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Amount</th>
                    <th>Channel</th>
                    <th>Receipt</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((p) => (
                    <tr key={p.id}>
                      <td>{paymentDate(p.paidAt)}</td>
                      <td>₹{p.amount.toLocaleString("en-IN")}</td>
                      <td>{paymentChannelLabel(p)}</td>
                      <td>{p.receiptNo}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </td>
        </tr>
      ) : null}
    </>
  );
}

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function RefundRow({
  r,
  onApprove,
  onReject,
}: {
  r: RefundRequest;
  onApprove: () => void;
  onReject: () => void;
}) {
  return (
    <tr>
      <td>{r.studentName}</td>
      <td>₹{r.amount.toLocaleString("en-IN")}</td>
      <td>{r.reason}</td>
      <td>{r.status}</td>
      <td>
        {r.status === "pending" ? (
          <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
            <Button type="button" onClick={onReject}>
              Reject
            </Button>
            <Button type="button" onClick={onApprove}>
              Approve
            </Button>
          </div>
        ) : (
          <span style={{ color: "var(--eduos-text-muted)" }}>{r.reviewNote ?? "—"}</span>
        )}
      </td>
    </tr>
  );
}

