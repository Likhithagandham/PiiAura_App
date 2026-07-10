export type PortalAlertSeverity = "info" | "warning" | "critical";

export interface PortalAlert {
  id: string;
  title: string;
  message: string;
  severity: PortalAlertSeverity;
  href?: string;
  /** Link label in banner strip (defaults to "View details") */
  actionLabel?: string;
  count?: number;
  createdAt: string;
}

export interface PortalAlertsData {
  alerts: PortalAlert[];
}
