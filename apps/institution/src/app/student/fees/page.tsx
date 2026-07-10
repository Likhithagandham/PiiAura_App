"use client";

import { Suspense, useState } from "react";
import type { StudentFeesData, StudentRazorpayOrder } from "@eduos/types";
import {
  BarChart,
  Button,
  ChartLegend,
  EmptyState,
  IconRupee,
  IconWallet,
  ProgressRing,
  SkeletonText,
  StatCard,
  TruncatedText,
} from "@eduos/ui";
import { PortalTabs } from "@/components/layout/PortalTabs";
import { ExportCsvButton } from "@/components/shared/ExportCsvButton";
import { StudentShell } from "@/components/student/StudentShell";
import { useStudentUrlTab } from "@/lib/student/use-student-url-tab";
import { useApiData } from "@/lib/queries";

const TABS = ["tuition", "exam"] as const;
type FeesTab = (typeof TABS)[number];

function InstallmentScheduleTable({
  rows,
}: {
  rows: NonNullable<StudentFeesData["installmentSchedule"]>;
}) {
  if (!rows.length) return null;
  return (
    <section className="eduos-panel">
      <h2 className="eduos-section-title">Installment schedule</h2>
      <div className="eduos-table-wrap">
        <table className="eduos-admin-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Due date</th>
              <th>Amount</th>
              <th>Paid</th>
              <th>Balance</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.installmentId}>
                <td>{row.sequence}</td>
                <td className="eduos-admin-table__nowrap">{row.dueDate}</td>
                <td>{formatInr(row.amount)}</td>
                <td>{formatInr(row.paid)}</td>
                <td>{formatInr(row.balance)}</td>
                <td>{row.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function formatInr(n: number): string {
  return `₹${n.toLocaleString("en-IN")}`;
}

function formatInrCompact(n: number): string {
  if (n >= 1e7) return `₹${(n / 1e7).toFixed(1)}Cr`;
  if (n >= 1e5) return `₹${(n / 1e5).toFixed(1)}L`;
  if (n >= 1e3) return `₹${Math.round(n / 1e3)}k`;
  return `₹${n}`;
}

function FeesContent() {
  const [tab, setTab] = useStudentUrlTab(TABS, "tuition");
  const { data, error: queryError, refetch } = useApiData<StudentFeesData>("/api/student/fees");
  const load = refetch;
  const error = queryError ? "Failed to load." : null;
  const [message, setMessage] = useState<string | null>(null);
  const [paying, setPaying] = useState(false);
  const [payingExamId, setPayingExamId] = useState<string | null>(null);
  // Amount field defaults to the outstanding balance; a non-null override means
  // the user typed a value (avoids setState-in-effect on load).
  const [customAmountOverride, setCustomAmountOverride] = useState<string | null>(null);
  const customAmount = customAmountOverride ?? (data ? String(data.ledger.balance || "") : "");

  async function payWithRazorpay() {
    if (!data) return;
    const amount = Number(customAmount) || data.ledger.balance;
    if (amount <= 0) {
      setMessage("Enter a valid amount to pay.");
      return;
    }
    setPaying(true);
    setMessage(null);
    try {
      const orderRes = await fetch("/api/student/fees", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount }),
      });
      const orderJson = await orderRes.json().catch(() => ({}));
      if (!orderRes.ok) throw new Error((orderJson as { error?: string }).error ?? "Order failed");
      const order = (orderJson as { order: StudentRazorpayOrder }).order;

      const paymentId = `pay_rzp_${Date.now()}`;
      const captureRes = await fetch("/api/student/fees", {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: order.orderId,
          paymentId,
          amount: order.amount,
          backendPaymentId: order.backendPaymentId,
        }),
      });
      const captureJson = await captureRes.json().catch(() => ({}));
      if (!captureRes.ok) throw new Error((captureJson as { error?: string }).error ?? "Payment failed");

      setMessage(`Paid ₹${order.amount} via Razorpay. Receipt ready to download.`);
      await load();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Payment failed");
    } finally {
      setPaying(false);
    }
  }

  return (
    <>
      {error ? <p className="eduos-admin-message eduos-admin-message--error">{error}</p> : null}
      {message ? <p className="eduos-admin-message">{message}</p> : null}

      {!data ? (
        <SkeletonText lines={4} />
      ) : (
        <>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "0.75rem", flexWrap: "wrap" }}>
            <PortalTabs
              className="eduos-portal-tabs"
              active={tab}
              onChange={setTab}
              tabs={[
                { id: "tuition", label: "Tuition" },
                { id: "exam", label: "Exam fees" },
              ]}
            />
            <ExportCsvButton endpoint="/api/student/exports/fee-statement" label="Download my fee statement CSV" />
          </div>

          {tab === "tuition" ? (
            <>
              <div className="eduos-admin-stat-grid" style={{ marginTop: "0.5rem" }}>
                <StatCard
                  label="Balance due"
                  value={formatInr(data.ledger.balance)}
                  icon={<IconWallet />}
                  accent={data.ledger.isOverdue ? "#dc2626" : "#d69e2e"}
                  sub={
                    data.ledger.isOverdue
                      ? "Overdue"
                      : data.ledger.nextDueDate
                        ? `Next due ${data.ledger.nextDueDate}`
                        : undefined
                  }
                />
                <StatCard
                  label="Paid"
                  value={formatInr(data.ledger.paid)}
                  icon={<IconRupee />}
                  accent="#1a5f4a"
                  sub={`of ${formatInr(data.ledger.totalDue)} total`}
                />
                <StatCard
                  label="Total due"
                  value={formatInr(data.ledger.totalDue)}
                  icon={<IconRupee />}
                  accent="#2563eb"
                />
              </div>

              {data.ledger.totalDue > 0 ? (
                <section className="eduos-panel">
                  <h2 className="eduos-section-title">Payment progress</h2>
                  <div className="eduos-chart-split">
                    <ProgressRing
                      percent={Math.round((data.ledger.paid / data.ledger.totalDue) * 100)}
                      color="#1a5f4a"
                      caption="paid"
                    />
                    <div className="eduos-chart-split__legend">
                      <ChartLegend
                        items={[
                          { label: "Paid", color: "#1a5f4a", value: formatInr(data.ledger.paid) },
                          { label: "Balance", color: "#d69e2e", value: formatInr(data.ledger.balance) },
                        ]}
                      />
                    </div>
                  </div>
                </section>
              ) : null}

              {data.installmentSchedule?.length ? (
                <InstallmentScheduleTable rows={data.installmentSchedule} />
              ) : null}

              <section className="eduos-panel">
                <h2 className="eduos-section-title">Pay tuition (Razorpay)</h2>
                <label style={{ fontSize: "0.8125rem", display: "block", maxWidth: "12rem" }}>
                  Amount (₹)
                  <input
                    type="number"
                    className="eduos-input eduos-input--field"
                    style={{ display: "block", marginTop: "0.25rem", width: "100%" }}
                    value={customAmount}
                    onChange={(e) => setCustomAmountOverride(e.target.value)}
                    min={1}
                  />
                </label>
                <p style={{ fontSize: "0.75rem", color: "var(--eduos-text-muted)", margin: "0.35rem 0 0.5rem" }}>
                  Gateway: Razorpay · {data.razorpayKeyId}
                </p>
                <Button type="button" className="eduos-admin-btn-sm" disabled={paying} onClick={payWithRazorpay}>
                  {paying ? "Processing…" : "Pay with Razorpay"}
                </Button>
              </section>

              <section className="eduos-panel">
                <h2 className="eduos-section-title">Payment history</h2>
                {data.payments.length > 0 ? (
                  <BarChart
                    data={[...data.payments]
                      .slice(-6)
                      .map((p) => ({
                        label: new Date(p.paidAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short" }),
                        value: p.amount,
                        valueLabel: formatInrCompact(p.amount),
                      }))}
                    height={180}
                  />
                ) : null}
                <div className="eduos-table-wrap" style={{ marginTop: "0.5rem" }}>
                  {data.payments.length === 0 ? (
                    <EmptyState compact title="No payments yet" description="Your payment history will appear here." />
                  ) : (
                    <table className="eduos-admin-table">
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Amount</th>
                          <th>Receipt</th>
                          <th />
                        </tr>
                      </thead>
                      <tbody>
                        {data.payments.map((p) => (
                          <tr key={p.id}>
                            <td className="eduos-admin-table__nowrap">{new Date(p.paidAt).toLocaleString()}</td>
                            <td>₹{p.amount}</td>
                            <td>{p.receiptNo}</td>
                            <td>
                              <a
                                href={`/api/student/fees/receipt?paymentId=${encodeURIComponent(p.id)}`}
                                className="eduos-link"
                                style={{ fontSize: "0.75rem" }}
                              >
                                Download
                              </a>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </section>
            </>
          ) : (
            <section className="eduos-panel" style={{ marginTop: "0.5rem" }}>
              <div className="eduos-table-wrap">
                <table className="eduos-admin-table">
                  <thead>
                    <tr>
                      <th>Exam</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th />
                    </tr>
                  </thead>
                  <tbody>
                    {data.examFees.rows.length === 0 ? (
                      <tr>
                        <td colSpan={4}>
                          <EmptyState compact title="No exam fees" description="Exam fee invoices will appear here." />
                        </td>
                      </tr>
                    ) : (
                      data.examFees.rows.map((row) => (
                        <tr key={row.invoiceId}>
                          <td>
                            <TruncatedText text={row.examLabel} maxWidth="16rem" />
                          </td>
                          <td>{formatInr(row.amount)}</td>
                          <td>{row.status}</td>
                          <td>
                            {row.status === "unpaid" ? (
                              <Button
                                type="button"
                                className="eduos-admin-btn-sm"
                                disabled={payingExamId === row.invoiceId}
                                onClick={async () => {
                                  setPayingExamId(row.invoiceId);
                                  setMessage(null);
                                  try {
                                    const res = await fetch("/api/student/fees", {
                                      method: "POST",
                                      credentials: "include",
                                      headers: { "Content-Type": "application/json" },
                                      body: JSON.stringify({ invoiceId: row.invoiceId }),
                                    });
                                    if (!res.ok) {
                                      const j = await res.json().catch(() => ({}));
                                      throw new Error((j as { error?: string }).error ?? "Payment failed");
                                    }
                                    setMessage("Exam fee paid.");
                                    await load();
                                  } catch (e) {
                                    setMessage(e instanceof Error ? e.message : "Payment failed");
                                  } finally {
                                    setPayingExamId(null);
                                  }
                                }}
                              >
                                Pay
                              </Button>
                            ) : null}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          )}
        </>
      )}
    </>
  );
}

export default function StudentFeesPage() {
  return (
    <StudentShell title="Fees">
      <Suspense fallback={<SkeletonText lines={4} />}>
        <FeesContent />
      </Suspense>
    </StudentShell>
  );
}
