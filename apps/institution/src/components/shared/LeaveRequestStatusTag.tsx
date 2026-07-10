import type { LeaveRequestStatus } from "@eduos/types";

const LABEL: Record<LeaveRequestStatus, string> = {
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
};

const CLASS: Record<LeaveRequestStatus, string> = {
  pending: "eduos-leave-status eduos-leave-status--pending",
  approved: "eduos-leave-status eduos-leave-status--approved",
  rejected: "eduos-leave-status eduos-leave-status--rejected",
};

export function LeaveRequestStatusTag({ status }: { status: LeaveRequestStatus | string }) {
  const key = status in LABEL ? (status as LeaveRequestStatus) : "pending";
  return <span className={CLASS[key]}>{LABEL[key]}</span>;
}
