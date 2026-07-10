import type { PlatformBillingStatus } from "@eduos/types";

const CLASS: Record<PlatformBillingStatus, string> = {
  paid: "eduos-platform-billing--paid",
  overdue: "eduos-platform-billing--overdue",
  trial: "eduos-platform-billing--trial",
};

const LABEL: Record<PlatformBillingStatus, string> = {
  paid: "Paid",
  overdue: "Overdue",
  trial: "Trial",
};

export function PlatformBillingStatusTag({ status }: { status: PlatformBillingStatus }) {
  const key = status in CLASS ? status : "trial";
  return (
    <span className={`eduos-platform-billing ${CLASS[key]}`}>{LABEL[key]}</span>
  );
}
