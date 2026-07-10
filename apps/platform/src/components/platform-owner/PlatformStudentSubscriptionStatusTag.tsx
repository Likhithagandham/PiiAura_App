import type { PlatformStudentSubscriptionStatus } from "@eduos/types";

const CLASS: Record<PlatformStudentSubscriptionStatus, string> = {
  paid: "eduos-platform-billing--paid",
  overdue: "eduos-platform-billing--overdue",
  unpaid: "eduos-platform-billing--trial",
  waived: "eduos-platform-billing--trial",
};

const LABEL: Record<PlatformStudentSubscriptionStatus, string> = {
  paid: "Paid",
  overdue: "Overdue",
  unpaid: "Unpaid",
  waived: "Waived",
};

export function PlatformStudentSubscriptionStatusTag({
  status,
}: {
  status: PlatformStudentSubscriptionStatus;
}) {
  const key = status in CLASS ? status : "unpaid";
  return (
    <span className={`eduos-platform-billing ${CLASS[key]}`}>{LABEL[key]}</span>
  );
}
