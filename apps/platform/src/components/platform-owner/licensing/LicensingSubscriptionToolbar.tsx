import type { LicenseSummary } from "@eduos/types";
import { Button } from "@eduos/ui";
import { formatDate, formatInr } from "./licensing-format";

export function LicensingSubscriptionToolbar({
  summary,
  branchFilter,
  filteredUnlicensedCount,
  busy,
  onRecordPayment,
  onGenerateTopUpInvoice,
  onGenerateRenewalInvoice,
  onExtendSubscription,
}: {
  summary: LicenseSummary;
  branchFilter: string;
  filteredUnlicensedCount: number;
  busy: boolean;
  onRecordPayment: () => void;
  onGenerateTopUpInvoice: () => void;
  onGenerateRenewalInvoice: () => void;
  onExtendSubscription: () => void;
}) {
  return (
    <section className="eduos-panel">
      <div className="eduos-panel__header">
        <div>
          <h2 className="eduos-section-title">Subscription period</h2>
          <p className="eduos-section-desc">
            {formatDate(summary.period?.startDate)} → {formatDate(summary.period?.endDate)}
            {" · "}
            <span style={{ textTransform: "capitalize" }}>{summary.period?.status ?? "—"}</span>
            {" · "}
            {formatInr(summary.unitPriceInr)}/student/year
          </p>
        </div>
        <div className="eduos-portal-toolbar">
          <Button type="button" onClick={onRecordPayment}>
            Record payment
          </Button>
          <Button
            type="button"
            variant="secondary"
            disabled={busy || filteredUnlicensedCount === 0}
            onClick={onGenerateTopUpInvoice}
          >
            Generate invoice ({filteredUnlicensedCount} unpaid
            {branchFilter ? " in branch" : ""})
          </Button>
          <Button
            type="button"
            variant="secondary"
            disabled={busy || summary.licensesConsumed === 0}
            onClick={onGenerateRenewalInvoice}
          >
            Generate renewal invoice
          </Button>
          <Button
            type="button"
            variant="secondary"
            disabled={!summary.period}
            onClick={onExtendSubscription}
          >
            Extend subscription
          </Button>
        </div>
      </div>
    </section>
  );
}
