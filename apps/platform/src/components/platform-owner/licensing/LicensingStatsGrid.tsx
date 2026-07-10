import type { LicenseSummary } from "@eduos/types";
import { IconAlertTriangle, IconCheckCircle, IconRupee, IconUsers, StatCard } from "@eduos/ui";
import { formatInr } from "./licensing-format";

export function LicensingStatsGrid({ summary }: { summary: LicenseSummary }) {
  return (
    <div className="eduos-admin-stat-grid">
      <StatCard
        label="Licenses purchased"
        value={summary.licensesPurchased}
        icon={<IconCheckCircle />}
        accent="#1a5f4a"
      />
      <StatCard
        label="Licenses consumed"
        value={summary.licensesConsumed}
        icon={<IconUsers />}
        accent="#2563eb"
      />
      <StatCard
        label="Unpaid students"
        value={summary.unlicensedStudents}
        icon={<IconAlertTriangle />}
        accent="#dc2626"
      />
      <StatCard
        label="Amount to collect"
        value={formatInr(summary.pendingAmountInr)}
        icon={<IconRupee />}
        accent="#d69e2e"
      />
    </div>
  );
}
