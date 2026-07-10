import type { PlatformTenantPlan } from "@eduos/types";

export const PLATFORM_OWNER_ROUTES = {
  dashboard: "/dashboard",
  analytics: "/analytics",
  tenants: "/tenants",
  tenantNew: "/tenants/new",
  tenantDetail: (id: string) => `/tenants/${id}` as const,
  plans: "/plans",
  planFeatures: "/plan-features",
  support: "/support",
  tickets: "/tickets",
  billing: "/billing",
  revenue: "/revenue",
  studentSubscriptions: "/billing/students",
  trials: "/trials",
  integrations: "/integrations",
  settings: "/settings",
  audit: "/audit",
  alerts: "/alerts",
} as const;

export type PlatformOwnerNavId =
  | "dashboard"
  | "analytics"
  | "tenants"
  | "plans"
  | "billing"
  | "support"
  | "settings";

export interface PlatformOwnerNavTab {
  label: string;
  href: string;
}

export interface PlatformOwnerNavItem {
  id: PlatformOwnerNavId;
  label: string;
  href: string;
  /** Sub-routes grouped under this module, shown as a tab bar within the module. */
  tabs?: PlatformOwnerNavTab[];
}

export const PLATFORM_OWNER_NAV: PlatformOwnerNavItem[] = [
  { id: "dashboard", label: "Dashboard", href: PLATFORM_OWNER_ROUTES.dashboard },
  { id: "analytics", label: "Analytics", href: PLATFORM_OWNER_ROUTES.analytics },
  {
    id: "tenants",
    label: "Tenants",
    href: PLATFORM_OWNER_ROUTES.tenants,
    tabs: [
      { label: "Institutions", href: PLATFORM_OWNER_ROUTES.tenants },
      { label: "Trials", href: PLATFORM_OWNER_ROUTES.trials },
    ],
  },
  {
    id: "plans",
    label: "Plans",
    href: PLATFORM_OWNER_ROUTES.plans,
    tabs: [
      { label: "Tenant plans", href: PLATFORM_OWNER_ROUTES.plans },
      { label: "AI features", href: PLATFORM_OWNER_ROUTES.planFeatures },
    ],
  },
  {
    id: "billing",
    label: "Billing",
    href: PLATFORM_OWNER_ROUTES.billing,
    tabs: [
      { label: "Billing", href: PLATFORM_OWNER_ROUTES.billing },
      { label: "Student subscriptions", href: PLATFORM_OWNER_ROUTES.studentSubscriptions },
      { label: "Revenue", href: PLATFORM_OWNER_ROUTES.revenue },
    ],
  },
  {
    id: "support",
    label: "Support",
    href: PLATFORM_OWNER_ROUTES.support,
    tabs: [
      { label: "Support mode", href: PLATFORM_OWNER_ROUTES.support },
      { label: "Tickets", href: PLATFORM_OWNER_ROUTES.tickets },
      { label: "Alerts", href: PLATFORM_OWNER_ROUTES.alerts },
    ],
  },
  {
    id: "settings",
    label: "Settings",
    href: PLATFORM_OWNER_ROUTES.settings,
    tabs: [
      { label: "General", href: PLATFORM_OWNER_ROUTES.settings },
      { label: "Integrations", href: PLATFORM_OWNER_ROUTES.integrations },
      { label: "Audit log", href: PLATFORM_OWNER_ROUTES.audit },
    ],
  },
];

export function resolvePlatformOwnerNavId(pathname: string): PlatformOwnerNavId {
  if (pathname.startsWith(PLATFORM_OWNER_ROUTES.planFeatures)) return "plans";
  if (pathname.startsWith(PLATFORM_OWNER_ROUTES.plans)) return "plans";
  if (pathname.startsWith(PLATFORM_OWNER_ROUTES.tenants)) return "tenants";
  if (pathname.startsWith(PLATFORM_OWNER_ROUTES.trials)) return "tenants";
  if (pathname.startsWith(PLATFORM_OWNER_ROUTES.analytics)) return "analytics";
  if (pathname.startsWith(PLATFORM_OWNER_ROUTES.support)) return "support";
  if (pathname.startsWith(PLATFORM_OWNER_ROUTES.tickets)) return "support";
  if (pathname.startsWith(PLATFORM_OWNER_ROUTES.alerts)) return "support";
  if (pathname.startsWith(PLATFORM_OWNER_ROUTES.billing)) return "billing";
  if (pathname.startsWith(PLATFORM_OWNER_ROUTES.studentSubscriptions)) return "billing";
  if (pathname.startsWith(PLATFORM_OWNER_ROUTES.revenue)) return "billing";
  if (pathname.startsWith(PLATFORM_OWNER_ROUTES.integrations)) return "settings";
  if (pathname.startsWith(PLATFORM_OWNER_ROUTES.audit)) return "settings";
  if (pathname.startsWith(PLATFORM_OWNER_ROUTES.settings)) return "settings";
  return "dashboard";
}

export function isPlatformOwnerNavItemActive(
  pathname: string,
  item: PlatformOwnerNavItem,
): boolean {
  return resolvePlatformOwnerNavId(pathname) === item.id;
}

/** Tabs for the module that owns the current route (empty when the module has none). */
export function getPlatformOwnerNavTabs(pathname: string): PlatformOwnerNavTab[] {
  const id = resolvePlatformOwnerNavId(pathname);
  return PLATFORM_OWNER_NAV.find((item) => item.id === id)?.tabs ?? [];
}

export function isPlatformOwnerNavTabActive(
  pathname: string,
  tab: PlatformOwnerNavTab,
): boolean {
  return pathname === tab.href || pathname.startsWith(`${tab.href}/`);
}

export const PLATFORM_TENANT_WIZARD_STEPS = [
  { id: "overview", label: "Overview" },
  { id: "branches", label: "Branches" },
  { id: "features", label: "Features" },
  { id: "integrations", label: "Integrations" },
] as const;

export type PlatformTenantWizardStepId = (typeof PLATFORM_TENANT_WIZARD_STEPS)[number]["id"];

/** F-011 — mirrors DB CHECK / application validation for tenant subdomains */
export const PLATFORM_SUBDOMAIN_MIN_LENGTH = 3;
export const PLATFORM_SUBDOMAIN_MAX_LENGTH = 32;
export const PLATFORM_SUBDOMAIN_PATTERN = /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/;

/** Legacy flat MRR estimates (INR/month) for dashboard trend charts */
export const PLATFORM_PLAN_MRR_INR: Record<PlatformTenantPlan, number> = {
  standard: 15_000,
  ai: 25_000,
};

/** Default AI credits included per student on the AI ERP plan (display fallback only) */
export const PLATFORM_DEFAULT_AI_CREDITS_PER_STUDENT = 50;

/** F-013 — trial expiry → grace → deactivate */
export const PLATFORM_TRIAL_PERIOD_DAYS = 30;
export const PLATFORM_TRIAL_GRACE_DAYS = 14;

export const PLATFORM_RESERVED_SUBDOMAINS = new Set([
  "platform",
  "www",
  "admin",
  "api",
  "app",
  "mail",
  "support",
  "login",
  "static",
]);
