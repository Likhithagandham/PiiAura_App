import type { PlatformTenantPricing } from "@eduos/types";
import { Button } from "@eduos/ui";
import { useEffect, useState } from "react";

function formatInr(n: number): string {
  return `₹${n.toLocaleString("en-IN")}`;
}

export function TenantPricingPanel({
  pricing,
  busy,
  onSave,
}: {
  pricing: PlatformTenantPricing;
  busy: boolean;
  onSave: (discountPercent: number) => Promise<void>;
}) {
  const [draft, setDraft] = useState(pricing.discountPercent);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setDraft(pricing.discountPercent);
  }, [pricing.discountPercent]);

  const previewNet = Math.round(pricing.listPricePerStudentInr * (1 - draft / 100));
  const changed = draft !== pricing.discountPercent;

  async function handleSave() {
    setSaving(true);
    try {
      await onSave(draft);
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="eduos-panel">
      <h2 className="eduos-section-title">Per-student pricing</h2>
      <p className="eduos-section-desc">
        List price comes from the plan catalog. Set a discount for this school only — it applies to
        licensing, student subscriptions, and revenue totals.
      </p>
      <div className="eduos-filter-grid" style={{ maxWidth: "36rem" }}>
        <label className="eduos-filter-grid__label">
          Plan
          <input
            className="eduos-input eduos-input--field"
            value={pricing.plan === "ai" ? "AI ERP" : "Standard ERP"}
            readOnly
            disabled
          />
        </label>
        <label className="eduos-filter-grid__label">
          List price / student / year
          <input
            className="eduos-input eduos-input--field"
            value={formatInr(pricing.listPricePerStudentInr)}
            readOnly
            disabled
          />
        </label>
        <label className="eduos-filter-grid__label">
          Discount (%)
          <input
            type="number"
            min={0}
            max={100}
            className="eduos-input eduos-input--field"
            value={draft}
            onChange={(e) => setDraft(Math.min(100, Math.max(0, Number(e.target.value) || 0)))}
          />
        </label>
        <label className="eduos-filter-grid__label">
          Net price / student / year
          <input
            className="eduos-input eduos-input--field"
            value={formatInr(changed ? previewNet : pricing.unitPricePerStudentInr)}
            readOnly
            disabled
          />
        </label>
      </div>
      {changed ? (
        <p className="eduos-body-sm" style={{ marginTop: "0.75rem", color: "var(--eduos-text-muted)" }}>
          Preview: {formatInr(pricing.listPricePerStudentInr)} list → {draft}% off →{" "}
          {formatInr(previewNet)}/student
        </p>
      ) : pricing.discountPercent > 0 ? (
        <p className="eduos-body-sm" style={{ marginTop: "0.75rem", color: "var(--eduos-text-muted)" }}>
          Active discount: {pricing.discountPercent}% off list price.
        </p>
      ) : null}
      <div style={{ marginTop: "1rem" }}>
        <Button
          type="button"
          className="eduos-admin-btn-sm"
          disabled={!changed || busy || saving}
          onClick={() => void handleSave()}
        >
          {saving ? "Saving…" : "Save discount"}
        </Button>
      </div>
    </section>
  );
}
