export const PARENT_ROUTES = {
  dashboard: "/parent/dashboard",
  fees: "/parent/fees",
  leave: "/parent/leave",
  academics: "/parent/academics",
  results: "/parent/academics?tab=results",
  assignments: "/parent/academics?tab=assignments",
  account: "/parent/account",
  grievances: "/parent/account?tab=grievances",
  alerts: "/parent/alerts",
  notices: "/parent/account?tab=announcements",
  absenceAlerts: "/parent/account?tab=absence-alerts",
  /** @deprecated Use `notices` */
  announcements: "/parent/account?tab=announcements",
  transport: "/parent/transport",
  library: "/parent/library",
} as const;

export type ParentNavId =
  | "dashboard"
  | "fees"
  | "leave"
  | "academics"
  | "alerts"
  | "transport"
  | "library"
  | "account";

export interface ParentNavItem {
  id: ParentNavId;
  label: string;
  href: string;
}

export const PARENT_NAV: ParentNavItem[] = [
  { id: "dashboard", label: "Dashboard", href: PARENT_ROUTES.dashboard },
  { id: "fees", label: "Fees", href: PARENT_ROUTES.fees },
  { id: "leave", label: "Leave", href: PARENT_ROUTES.leave },
  { id: "academics", label: "Academics", href: PARENT_ROUTES.academics },
  { id: "transport", label: "Transport", href: PARENT_ROUTES.transport },
  { id: "library", label: "Library", href: PARENT_ROUTES.library },
  { id: "alerts", label: "Alerts", href: PARENT_ROUTES.alerts },
  { id: "account", label: "Account", href: PARENT_ROUTES.account },
];

const ACADEMICS_PREFIXES = ["/parent/academics", "/parent/results", "/parent/assignments"];
const ACCOUNT_PREFIXES = ["/parent/account", "/parent/grievances"];

export function resolveParentNavId(pathname: string): ParentNavId {
  if (pathname.startsWith("/parent/fees")) return "fees";
  if (pathname.startsWith("/parent/leave")) return "leave";
  if (pathname.startsWith("/parent/transport")) return "transport";
  if (pathname.startsWith("/parent/library")) return "library";
  if (ACADEMICS_PREFIXES.some((p) => pathname.startsWith(p))) return "academics";
  if (pathname.startsWith("/parent/alerts")) return "alerts";
  if (ACCOUNT_PREFIXES.some((p) => pathname.startsWith(p))) return "account";
  return "dashboard";
}

export function isParentNavItemActive(pathname: string, item: ParentNavItem): boolean {
  return resolveParentNavId(pathname) === item.id;
}
