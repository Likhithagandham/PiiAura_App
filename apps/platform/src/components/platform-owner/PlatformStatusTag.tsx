import type { PlatformTenantStatus } from "@eduos/types";

const STATUS_CLASS: Record<PlatformTenantStatus, string> = {
  active: "eduos-platform-status--active",
  inactive: "eduos-platform-status--inactive",
  pending: "eduos-platform-status--pending",
};

export function PlatformStatusTag({ status }: { status: PlatformTenantStatus }) {
  return (
    <span className={`eduos-platform-status ${STATUS_CLASS[status]}`}>{status}</span>
  );
}
