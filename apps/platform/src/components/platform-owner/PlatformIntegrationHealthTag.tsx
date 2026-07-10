import type {
  PlatformIntegrationHealthCheck,
  PlatformIntegrationHealthStatus,
} from "@eduos/types";

const LABEL: Record<PlatformIntegrationHealthStatus, string> = {
  healthy: "Healthy",
  degraded: "Degraded",
  down: "Down",
  not_configured: "Not configured",
};

const CLASS: Record<PlatformIntegrationHealthStatus, string> = {
  healthy: "eduos-integration-health eduos-integration-health--healthy",
  degraded: "eduos-integration-health eduos-integration-health--degraded",
  down: "eduos-integration-health eduos-integration-health--down",
  not_configured: "eduos-integration-health eduos-integration-health--na",
};

export function PlatformIntegrationHealthTag({
  check,
}: {
  check: PlatformIntegrationHealthCheck;
}) {
  return (
    <span className={CLASS[check.status]} title={check.message}>
      {LABEL[check.status]}
    </span>
  );
}
