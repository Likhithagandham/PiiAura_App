"use client";

import { usePlatformMaintenance } from "@/lib/platform-owner/maintenance-context";

export function MaintenanceModeBanner() {
  const { maintenance } = usePlatformMaintenance();

  if (!maintenance?.enabled) return null;

  const endLabel = maintenance.scheduledEndAt
    ? ` Expected end: ${new Date(maintenance.scheduledEndAt).toLocaleString()}.`
    : "";

  return (
    <div
      className="eduos-platform-maintenance-banner"
      role="alert"
      aria-live="assertive"
    >
      <div className="eduos-platform-maintenance-banner__content">
        <span className="eduos-platform-maintenance-banner__badge">Maintenance</span>
        <span>{maintenance.message}</span>
        {maintenance.blockWrites ? (
          <span className="eduos-platform-maintenance-banner__hint">
            Write APIs are blocked until maintenance ends.
          </span>
        ) : null}
        {endLabel ? (
          <span className="eduos-platform-maintenance-banner__hint">{endLabel}</span>
        ) : null}
      </div>
    </div>
  );
}
