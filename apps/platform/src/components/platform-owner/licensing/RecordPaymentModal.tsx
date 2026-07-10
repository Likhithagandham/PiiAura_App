"use client";

import { useState } from "react";
import type { LicenseBranchBillingRow, LicensePaymentMode } from "@eduos/types";
import { Button, Input, Modal } from "@eduos/ui";
import { ApiError, apiSend } from "@/lib/api-client";

const PAYMENT_MODES: { value: LicensePaymentMode; label: string }[] = [
  { value: "cash", label: "Cash" },
  { value: "cheque", label: "Cheque" },
  { value: "upi", label: "UPI" },
  { value: "bank_transfer", label: "Bank transfer" },
  { value: "online", label: "Online" },
];

export function RecordPaymentModal({
  tenantId,
  unitPriceInr,
  branches,
  initialBranchId,
  schoolUnlicensedCount,
  onClose,
  onSaved,
}: {
  tenantId: string;
  unitPriceInr: number;
  branches: LicenseBranchBillingRow[];
  initialBranchId: string;
  schoolUnlicensedCount: number;
  onClose: () => void;
  onSaved: () => Promise<void>;
}) {
  const [branchId, setBranchId] = useState(initialBranchId);
  const branchUnlicensed = branchId
    ? (branches.find((b) => b.id === branchId)?.unlicensedCount ?? 0)
    : schoolUnlicensedCount;
  const branchName = branchId ? branches.find((b) => b.id === branchId)?.name : null;

  const [licenses, setLicenses] = useState(
    branchUnlicensed > 0 ? String(branchUnlicensed) : "1",
  );
  const [amount, setAmount] = useState(
    String((branchUnlicensed > 0 ? branchUnlicensed : 1) * unitPriceInr),
  );
  const [mode, setMode] = useState<LicensePaymentMode>("cash");
  const [reference, setReference] = useState("");
  const [paidAt, setPaidAt] = useState(new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function onBranchChange(value: string) {
    setBranchId(value);
    const count = value
      ? (branches.find((b) => b.id === value)?.unlicensedCount ?? 0)
      : schoolUnlicensedCount;
    const n = count > 0 ? count : 1;
    setLicenses(String(n));
    setAmount(String(n * unitPriceInr));
  }

  function onLicensesChange(value: string) {
    setLicenses(value);
    const n = Number(value);
    if (Number.isFinite(n) && n > 0) setAmount(String(n * unitPriceInr));
  }

  async function submit() {
    const n = Number(licenses);
    if (!Number.isInteger(n) || n <= 0) {
      setError("Enter a valid number of licenses.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await apiSend("/api/platform-owner/licensing/payments", "POST", {
        tenantId,
        licensesGranted: n,
        amountInr: Number(amount) || 0,
        paymentMode: mode,
        referenceNumber: reference,
        paidAt,
        notes,
        ...(branchId ? { branchId } : {}),
        idempotencyKey: `ui-${tenantId}-${branchId || "all"}-${paidAt}-${n}-${reference || Date.now()}`,
      });
      await onSaved();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to record payment");
      setSaving(false);
    }
  }

  return (
    <Modal
      title="Record payment"
      onClose={saving ? undefined : onClose}
      footer={
        <>
          <Button type="button" variant="secondary" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button type="button" onClick={() => void submit()} disabled={saving}>
            {saving ? "Saving…" : `Record ${licenses || 0} license(s)`}
          </Button>
        </>
      }
    >
      <div style={{ display: "grid", gap: "0.75rem" }}>
        {error ? <p className="eduos-admin-message eduos-admin-message--error">{error}</p> : null}
        {branches.length > 0 ? (
          <div>
            <label className="eduos-label" htmlFor="payment-branch">
              Branch scope
            </label>
            <select
              id="payment-branch"
              className="eduos-input"
              value={branchId}
              onChange={(e) => onBranchChange(e.target.value)}
            >
              <option value="">All branches (school-wide FIFO)</option>
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} ({b.unlicensedCount} unpaid)
                </option>
              ))}
            </select>
          </div>
        ) : null}
        <Input
          label={`Student licenses purchased * (₹${unitPriceInr.toLocaleString("en-IN")}/student)`}
          type="number"
          min={1}
          value={licenses}
          onChange={(e) => onLicensesChange(e.target.value)}
          required
        />
        <Input
          label="Amount received (₹) *"
          type="number"
          min={0}
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
        />
        <div>
          <label className="eduos-label" htmlFor="payment-mode">
            Payment mode *
          </label>
          <select
            id="payment-mode"
            className="eduos-input"
            value={mode}
            onChange={(e) => setMode(e.target.value as LicensePaymentMode)}
          >
            {PAYMENT_MODES.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
        </div>
        <Input
          label="Reference number"
          value={reference}
          onChange={(e) => setReference(e.target.value)}
          placeholder="Cheque no. / UPI ref / UTR"
        />
        <Input
          label="Payment date *"
          type="date"
          value={paidAt}
          onChange={(e) => setPaidAt(e.target.value)}
          required
        />
        <Input
          label="Notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Collected by / remarks"
        />
        <p className="eduos-body-sm" style={{ color: "var(--eduos-muted)" }}>
          {branchName
            ? `Only the oldest unpaid students in ${branchName} will be licensed (up to ${licenses} students).`
            : `The oldest ${schoolUnlicensedCount > 0 ? schoolUnlicensedCount : ""} unpaid students school-wide will be licensed (oldest enrolled first).`}
          {" "}Licenses are never released once consumed.
        </p>
      </div>
    </Modal>
  );
}
