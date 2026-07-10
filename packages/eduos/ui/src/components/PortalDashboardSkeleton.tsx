import { InlineLoading } from "./Spinner";

export function PortalDashboardSkeleton({ statCount: _statCount = 6 }: { statCount?: number }) {
  return <InlineLoading size="lg" minHeight="14rem" />;
}
