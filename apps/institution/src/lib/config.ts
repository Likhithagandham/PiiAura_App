/**
 * Server-side environment configuration (Route Handlers, middleware helpers).
 */

export function getApiBaseUrl(): string {
  // Use 127.0.0.1 instead of localhost on Windows where localhost may resolve
  // to IPv6 (::1) but the Django dev server is bound only on IPv4.
  return process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";
}

export function getDefaultTenantSubdomain(): string {
  return process.env.NEXT_PUBLIC_DEFAULT_TENANT?.trim() ?? "";
}

/** Monthly payroll run, templates, and payslip exports — disabled until attendance-driven payroll ships. */
export function isHrPayrollEnabled(): boolean {
  return process.env.NEXT_PUBLIC_HR_PAYROLL_ENABLED === "true";
}
