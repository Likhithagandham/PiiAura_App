"use client";

import type { ParentFeesData, StudentRazorpayOrder } from "@eduos/types";
import {
  Button,
  ChartLegend,
  IconRupee,
  IconWallet,
  ProgressRing,
  SkeletonText,
  StatCard,
  TruncatedText,
} from "@eduos/ui";
import { Suspense, useCallback, useEffect, useState } from "react";
import { PortalTabs } from "@/components/layout/PortalTabs";
import { parentApiUrl, useParentChild } from "@/lib/parent/parent-child-context";
import { useParentUrlTab } from "@/lib/parent/use-parent-url-tab";

function formatInr(n: number): string {
  return `₹${n.toLocaleString("en-IN")}`;
}

const TABS = ["tuition", "exam"] as const;

function InstallmentScheduleTable({
  rows,
}: {
  rows: NonNullable<ParentFeesData["installmentSchedule"]>;
}) {
  if (!rows.length) return null;
  return (
    <section className="eduos-panel" style={{ marginTop: "0.75rem" }}>
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
                <td>{row.dueDate}</td>
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

function ParentFeesContent() {
  const { childId, activeChild } = useParentChild();
  const [tab, setTab] = useParentUrlTab(TABS, "tuition");
  const [data, setData] = useState<ParentFeesData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [paying, setPaying] = useState(false);
  const [customAmount, setCustomAmount] = useState("");

  const load = useCallback(async () => {
    if (!childId) return;
    setError(null);
    const res = await fetch(parentApiUrl("/api/parent/fees", childId), { credentials: "include" });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError((json as { error?: string }).error ?? "Failed to load");
      return;
    }
    const fees = json as ParentFeesData;
    setData(fees);
    setCustomAmount(String(fees.ledger.balance || ""));
  }, [childId]);

  useEffect(() => {
    load();
  }, [load]);

  async function payTuition() {
    if (!data || !childId) return;
    const amount = Number(customAmount) || data.ledger.balance;
    if (amount <= 0) {
      setMessage("Enter a valid amount.");
      return;
    }
    setPaying(true);
    setMessage(null);
    try {
      const orderRes = await fetch(parentApiUrl("/api/parent/fees", childId), {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount }),
      });
      const orderJson = await orderRes.json().catch(() => ({}));
      if (!orderRes.ok) throw new Error((orderJson as { error?: string }).error ?? "Order failed");
      const order = (orderJson as { order: StudentRazorpayOrder }).order;
      const captureRes = await fetch(parentApiUrl("/api/parent/fees", childId), {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: order.orderId,
          paymentId: `pay_rzp_${Date.now()}`,
          amount: order.amount,
          backendPaymentId: order.backendPaymentId,
        }),
      });
      if (!captureRes.ok) {
        const cap = await captureRes.json().catch(() => ({}));
        throw new Error((cap as { error?: string }).error ?? "Payment failed");
      }
      setMessage(`Paid ₹${order.amount} for ${activeChild?.name}.`);
      await load();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Payment failed");
    } finally {
      setPaying(false);
    }
  }

  return (
    <>
      <p className="eduos-section-desc">Pay fees for {activeChild?.name ?? "your child"}.</p>
      {error ? <p className="eduos-admin-message eduos-admin-message--error">{error}</p> : null}
      {message ? <p className="eduos-admin-message">{message}</p> : null}

      {!data ? (
        <SkeletonText lines={4} />
      ) : (
        <>
          <PortalTabs
            className="eduos-portal-tabs"
            active={tab}
            onChange={setTab}
            tabs={[
              { id: "tuition", label: "Tuition" },
              { id: "exam", label: "Exam fees" },
            ]}
          />

          {tab === "tuition" ? (
            <section className="eduos-panel" style={{ marginTop: "0.5rem" }}>
              <div className="eduos-admin-stat-grid">
                <StatCard
                  label="Balance"
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
                <div className="eduos-chart-split" style={{ marginTop: "1rem" }}>
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
              ) : null}
              <label style={{ fontSize: "0.8125rem", display: "block", marginTop: "0.75rem", maxWidth: "12rem" }}>
                Amount (₹)
                <input
                  type="number"
                  className="eduos-input eduos-input--field"
                  style={{ display: "block", marginTop: "0.25rem", width: "100%" }}
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                />
              </label>
              <Button
                type="button"
                className="eduos-admin-btn-sm"
                style={{ marginTop: "0.5rem" }}
                disabled={paying}
                onClick={payTuition}
              >
                {paying ? "Processing…" : "Pay with Razorpay"}
              </Button>
              {data.installmentSchedule?.length ? (
                <InstallmentScheduleTable rows={data.installmentSchedule} />
              ) : null}
            </section>
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
                    {data.examFees.rows.map((row) => (
                      <tr key={row.invoiceId}>
                        <td>
                          <TruncatedText text={row.examLabel} maxWidth="16rem" />
                        </td>
                        <td>₹{row.amount}</td>
                        <td>{row.status}</td>
                        <td>
                          {row.status === "unpaid" ? (
                            <Button
                              type="button"
                              className="eduos-admin-btn-sm"
                              onClick={async () => {
                                if (!childId) return;
                                const res = await fetch(parentApiUrl("/api/parent/fees", childId), {
                                  method: "POST",
                                  credentials: "include",
                                  headers: { "Content-Type": "application/json" },
                                  body: JSON.stringify({ invoiceId: row.invoiceId }),
                                });
                                if (!res.ok) {
                                  setMessage("Payment failed");
                                  return;
                                }
                                setMessage("Exam fee paid.");
                                await load();
                              }}
                            >
                              Pay
                            </Button>
                          ) : null}
                        </td>
                      </tr>
                    ))}
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

export default function ParentFeesPage() {
  return (
    <Suspense fallback={<SkeletonText lines={4} />}>
      <ParentFeesContent />
    </Suspense>
  );
}
