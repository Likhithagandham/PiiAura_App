"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
import type { PlatformLicensingTenantDetail } from "@eduos/types";
import { SkeletonText } from "@eduos/ui";
import { ExtendPeriodModal } from "@/components/platform-owner/licensing/ExtendPeriodModal";
import { InvoicesSection } from "@/components/platform-owner/licensing/InvoicesSection";
import { LicensingStatsGrid } from "@/components/platform-owner/licensing/LicensingStatsGrid";
import { LicensingSubscriptionToolbar } from "@/components/platform-owner/licensing/LicensingSubscriptionToolbar";
import { unlicensedForBranch } from "@/components/platform-owner/licensing/licensing-format";
import { PaymentHistorySection } from "@/components/platform-owner/licensing/PaymentHistorySection";
import { RecordPaymentModal } from "@/components/platform-owner/licensing/RecordPaymentModal";
import { TenantPricingPanel } from "@/components/platform-owner/licensing/TenantPricingPanel";
import { UnpaidStudentsSection } from "@/components/platform-owner/licensing/UnpaidStudentsSection";
import { PlatformOwnerShell } from "@/components/platform-owner/PlatformOwnerShell";
import { ApiError, apiSend } from "@/lib/api-client";
import { useApiData } from "@/lib/queries";

export default function LicensingTenantDetailPage() {
  const params = useParams();
  const tenantId = typeof params.tenantId === "string" ? params.tenantId : "";

  const [branchFilter, setBranchFilter] = useState("");
  const [actionError, setActionError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [showPayment, setShowPayment] = useState(false);
  const [paymentBranchId, setPaymentBranchId] = useState("");
  const [showExtend, setShowExtend] = useState(false);
  const [busy, setBusy] = useState(false);

  const qs = branchFilter ? `?branchId=${encodeURIComponent(branchFilter)}` : "";
  const {
    data,
    error: queryError,
    refetch,
  } = useApiData<PlatformLicensingTenantDetail>(
    tenantId ? `/api/platform-owner/licensing/tenants/${tenantId}${qs}` : null,
  );
  const loadError = queryError
    ? queryError instanceof ApiError
      ? queryError.message
      : "Failed to load school licensing"
    : null;
  const error = actionError ?? loadError;

  const filteredUnlicensedCount = useMemo(
    () => (data ? unlicensedForBranch(data, branchFilter) : 0),
    [data, branchFilter],
  );

  async function generateInvoice(invoiceType: "top_up" | "renewal") {
    if (!data) return;
    setBusy(true);
    setActionError(null);
    setMessage(null);
    try {
      const body =
        invoiceType === "renewal"
          ? { tenantId, invoiceType }
          : {
              tenantId,
              invoiceType,
              licensesCount: filteredUnlicensedCount,
              ...(branchFilter ? { branchId: branchFilter } : {}),
            };
      await apiSend("/api/platform-owner/licensing/invoices", "POST", body);
      setMessage("Invoice generated.");
      await refetch();
    } catch (e) {
      setActionError(e instanceof ApiError ? e.message : "Failed to generate invoice");
    } finally {
      setBusy(false);
    }
  }

  async function saveDiscount(discountPercent: number) {
    setActionError(null);
    setMessage(null);
    try {
      await apiSend(`/api/platform-owner/licensing/tenants/${tenantId}/pricing`, "PATCH", {
        discountPercent,
      });
      setMessage("School discount updated.");
      await refetch();
    } catch (e) {
      setActionError(e instanceof ApiError ? e.message : "Failed to save discount");
      throw e;
    }
  }

  const summary = data?.summary;

  return (
    <PlatformOwnerShell title={data ? `${data.tenant.name} — licensing` : "School licensing"}>
      <p style={{ marginBottom: "1rem" }}>
        <Link href="/billing">← All schools</Link>
      </p>
      {error ? <p className="eduos-admin-message eduos-admin-message--error">{error}</p> : null}
      {message ? <p className="eduos-admin-message eduos-admin-message--success">{message}</p> : null}

      {!data || !summary ? (
        <SkeletonText lines={4} />
      ) : (
        <>
          <LicensingStatsGrid summary={summary} />

          {data.pricing ? (
            <TenantPricingPanel
              pricing={data.pricing}
              busy={busy}
              onSave={saveDiscount}
            />
          ) : null}

          <LicensingSubscriptionToolbar
            summary={summary}
            branchFilter={branchFilter}
            filteredUnlicensedCount={filteredUnlicensedCount}
            busy={busy}
            onRecordPayment={() => {
              setPaymentBranchId(branchFilter);
              setShowPayment(true);
            }}
            onGenerateTopUpInvoice={() => void generateInvoice("top_up")}
            onGenerateRenewalInvoice={() => void generateInvoice("renewal")}
            onExtendSubscription={() => setShowExtend(true)}
          />

          <UnpaidStudentsSection
            queue={data.unlicensedQueue}
            branches={data.branches}
            branchFilter={branchFilter}
            schoolUnlicensedCount={summary.unlicensedStudents}
            onBranchFilterChange={setBranchFilter}
          />

          <PaymentHistorySection payments={data.payments} />

          <InvoicesSection invoices={data.invoices} />

          {showPayment ? (
            <RecordPaymentModal
              tenantId={tenantId}
              unitPriceInr={summary.unitPriceInr}
              branches={data.branches}
              initialBranchId={paymentBranchId}
              schoolUnlicensedCount={summary.unlicensedStudents}
              onClose={() => setShowPayment(false)}
              onSaved={async () => {
                setShowPayment(false);
                setMessage(
                  paymentBranchId
                    ? "Payment recorded — oldest unpaid students in that branch were licensed."
                    : "Payment recorded — oldest unpaid students converted automatically.",
                );
                await refetch();
              }}
            />
          ) : null}

          {showExtend && summary.period ? (
            <ExtendPeriodModal
              periodId={summary.period.id}
              currentEnd={summary.period.endDate}
              onClose={() => setShowExtend(false)}
              onSaved={async () => {
                setShowExtend(false);
                setMessage("Subscription period extended.");
                await refetch();
              }}
            />
          ) : null}
        </>
      )}
    </PlatformOwnerShell>
  );
}
