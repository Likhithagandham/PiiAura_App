/**
 * Alerts — backend. Faculty alerts are derived from the faculty dashboard API.
 */

import type { FacultyDashboardAlert, PortalAlert } from "@eduos/types";
import { getDashboard as getAdminDashboard } from "./admin-server";
import { getDashboard } from "./faculty-server";

type AlertItem = PortalAlert;

function mapFacultyDashboardAlerts(alerts: FacultyDashboardAlert[]): PortalAlert[] {
  return alerts.map((alert, index) => ({
    ...alert,
    createdAt: new Date(Date.now() - (index + 1) * 2 * 3600000).toISOString(),
  }));
}

export async function listForAdmin(request: Request, subdomain: string): Promise<{ alerts: AlertItem[] }> {
  const dashboard = await getAdminDashboard(request, subdomain);
  const now = new Date().toISOString();
  return { alerts: dashboard.alerts.map((alert) => ({ ...alert, createdAt: now })) };
}

export async function listForFaculty(
  request: Request,
  subdomain: string,
  facultyUserId: string,
): Promise<{ alerts: PortalAlert[] }> {
  const dashboard = await getDashboard(request, { subdomain, facultyUserId });
  return { alerts: mapFacultyDashboardAlerts(dashboard.alerts) };
}

export async function listForStudent(
  request: Request,
  subdomain: string,
  studentUserId: string,
  rollNumber: string | null,
): Promise<{ alerts: AlertItem[] }> {
  return Promise.resolve({ alerts: [] });
}

export async function listForParent(
  request: Request,
  subdomain: string,
  parentUserId: string,
  childId: string,
): Promise<{ alerts: AlertItem[] }> {
  return Promise.resolve({ alerts: [] });
}

export async function listForPlatform(request: Request): Promise<{ alerts: AlertItem[] }> {
  return Promise.resolve({ alerts: [] });
}
