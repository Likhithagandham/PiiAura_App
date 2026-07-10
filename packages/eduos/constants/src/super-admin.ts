export const SUPER_ADMIN_ROUTES = {
  dashboard: "/super-admin/dashboard",
  branches: "/super-admin/branches",
  analytics: "/super-admin/analytics",
  plan: "/super-admin/plan",
  billing: "/super-admin/billing",
  tickets: "/super-admin/tickets",
  academicYears: "/super-admin/academic-years",
  transfers: "/super-admin/transfers",
  defaulters: "/super-admin/defaulters",
  results: "/super-admin/results",
  exports: "/super-admin/exports",
  finance: "/super-admin/finance",
  hrPayroll: "/super-admin/hr-payroll",
  operations: "/super-admin/operations",
  insights: "/super-admin/insights",
  engagement: "/super-admin/engagement",
  announcements: "/super-admin/announcements",
  fees: "/super-admin/fees",
  settings: "/super-admin/settings",
  account: "/super-admin/account",
  alerts: "/super-admin/alerts",
  admins: "/super-admin/admins",
} as const;

export type SuperAdminNavId =
  | "dashboard"
  | "branches"
  | "analytics"
  | "plan"
  | "billing"
  | "tickets"
  | "academicYears"
  | "transfers"
  | "defaulters"
  | "results"
  | "exports"
  | "announcements"
  | "fees"
  | "hrPayroll"
  | "settings"
  | "account"
  | "alerts";

export interface SuperAdminNavItem {
  id: SuperAdminNavId;
  label: string;
  href: string;
  comingSoon?: boolean;
}

export const SUPER_ADMIN_NAV: SuperAdminNavItem[] = [
  { id: "dashboard", label: "Dashboard", href: SUPER_ADMIN_ROUTES.dashboard },
  { id: "branches", label: "Operations", href: SUPER_ADMIN_ROUTES.operations },
  { id: "analytics", label: "Insights", href: SUPER_ADMIN_ROUTES.insights },
  { id: "tickets", label: "Engagement", href: SUPER_ADMIN_ROUTES.engagement },
  { id: "fees", label: "Finance", href: SUPER_ADMIN_ROUTES.finance },
  { id: "billing", label: "Billing & licenses", href: SUPER_ADMIN_ROUTES.billing },
  { id: "hrPayroll", label: "HR & Payroll", href: SUPER_ADMIN_ROUTES.hrPayroll, comingSoon: true },
  { id: "settings", label: "Institution settings", href: SUPER_ADMIN_ROUTES.settings },
  { id: "account", label: "Account", href: SUPER_ADMIN_ROUTES.account },
  { id: "alerts", label: "Alerts", href: SUPER_ADMIN_ROUTES.alerts },
];

export function resolveSuperAdminNavId(pathname: string): SuperAdminNavId {
  if (pathname.startsWith(SUPER_ADMIN_ROUTES.branches)) return "branches";
  if (pathname.startsWith(SUPER_ADMIN_ROUTES.analytics)) return "analytics";
  if (pathname.startsWith(SUPER_ADMIN_ROUTES.plan)) return "billing";
  if (pathname.startsWith(SUPER_ADMIN_ROUTES.billing)) return "billing";
  if (pathname.startsWith(SUPER_ADMIN_ROUTES.tickets)) return "tickets";
  if (pathname.startsWith(SUPER_ADMIN_ROUTES.academicYears)) return "academicYears";
  if (pathname.startsWith(SUPER_ADMIN_ROUTES.transfers)) return "transfers";
  if (pathname.startsWith(SUPER_ADMIN_ROUTES.results)) return "results";
  if (pathname.startsWith(SUPER_ADMIN_ROUTES.operations)) return "branches";
  if (pathname.startsWith(SUPER_ADMIN_ROUTES.insights)) return "analytics";
  if (pathname.startsWith(SUPER_ADMIN_ROUTES.engagement)) return "tickets";
  if (pathname.startsWith(SUPER_ADMIN_ROUTES.announcements)) return "tickets";
  if (pathname.startsWith(SUPER_ADMIN_ROUTES.finance)) return "fees";
  if (pathname.startsWith(SUPER_ADMIN_ROUTES.fees)) return "fees";
  if (pathname.startsWith(SUPER_ADMIN_ROUTES.hrPayroll)) return "hrPayroll";
  if (pathname.startsWith(SUPER_ADMIN_ROUTES.settings)) return "settings";
  if (pathname.startsWith(SUPER_ADMIN_ROUTES.account)) return "account";
  if (pathname.startsWith(SUPER_ADMIN_ROUTES.alerts)) return "alerts";
  if (pathname.startsWith(SUPER_ADMIN_ROUTES.admins)) return "branches";
  return "dashboard";
}

export function isSuperAdminNavItemActive(pathname: string, item: SuperAdminNavItem): boolean {
  return resolveSuperAdminNavId(pathname) === item.id;
}

