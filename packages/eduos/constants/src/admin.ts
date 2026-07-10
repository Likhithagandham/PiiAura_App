/** Row count above which report exports run in the background */
export const LARGE_EXPORT_ROW_THRESHOLD = 500;

export const ADMIN_ROUTES = {
  dashboard: "/admin/dashboard",
  admissions: "/admin/admissions",
  academics: "/admin/academics",
  attendance: "/admin/attendance",
  examinations: "/admin/examinations",
  fees: "/admin/fees",
  hr: "/admin/hr",
  school: "/admin/school",
  college: "/admin/college",
  users: "/admin/users",
  engagement: "/admin/engagement",
  notices: "/admin/engagement?tab=notices",
  delivery: "/admin/engagement?tab=delivery",
  /** @deprecated Use `notices` */
  announcements: "/admin/engagement?tab=notices",
  /** @deprecated Use `delivery` */
  communications: "/admin/engagement?tab=delivery",
  account: "/admin/account",
  notifications: "/admin/account",
  alerts: "/admin/alerts",
  grievances: "/admin/grievances",
  reports: "/admin/reports",
  billing: "/admin/billing",
  settings: "/admin/settings",
  gallery: "/admin/gallery",
  transport: "/admin/transport",
  library: "/admin/library",
  infra: "/admin/infra",
  visitors: "/admin/visitors",
} as const;

export type AdminModuleId = keyof typeof ADMIN_ROUTES;

export type InstitutionType = "school" | "college";

export interface AdminNavItem {
  id: AdminModuleId;
  label: string;
  href: string;
  icon: string;
}

/** Shown in sidebar only for the active institution scope (school vs college toggle). */
export const ADMIN_SCOPED_NAV: Record<InstitutionType, AdminNavItem> = {
  school: {
    id: "school",
    label: "Class & diary",
    href: ADMIN_ROUTES.school,
    icon: "🏫",
  },
  college: {
    id: "college",
    label: "Electives & accreditation",
    href: ADMIN_ROUTES.college,
    icon: "🎓",
  },
};

const ADMIN_NAV_AFTER_FEES: AdminNavItem[] = [
  { id: "hr", label: "HR", href: ADMIN_ROUTES.hr, icon: "👥" },
  { id: "users", label: "Users", href: ADMIN_ROUTES.users, icon: "🧑‍💼" },
  { id: "engagement", label: "Engagement", href: ADMIN_ROUTES.engagement, icon: "📢" },
  { id: "gallery", label: "Gallery", href: ADMIN_ROUTES.gallery, icon: "🖼️" },
  { id: "transport", label: "Transport", href: ADMIN_ROUTES.transport, icon: "🚌" },
  { id: "library", label: "Library", href: ADMIN_ROUTES.library, icon: "📖" },
  { id: "infra", label: "Infra", href: ADMIN_ROUTES.infra, icon: "🏗️" },
  { id: "visitors", label: "Visitors", href: ADMIN_ROUTES.visitors, icon: "🪪" },
  { id: "grievances", label: "Grievances", href: ADMIN_ROUTES.grievances, icon: "🛟" },
  { id: "reports", label: "Reports", href: ADMIN_ROUTES.reports, icon: "📈" },
  { id: "billing", label: "Billing & licenses", href: ADMIN_ROUTES.billing, icon: "🧾" },
  { id: "alerts", label: "Needs attention", href: ADMIN_ROUTES.alerts, icon: "🔔" },
  { id: "account", label: "Account", href: ADMIN_ROUTES.account, icon: "👤" },
  { id: "settings", label: "Settings", href: ADMIN_ROUTES.settings, icon: "⚙️" },
];

/** Core admin nav (scope-specific item is injected separately). */
export const ADMIN_NAV: AdminNavItem[] = [
  { id: "dashboard", label: "Dashboard", href: ADMIN_ROUTES.dashboard, icon: "📊" },
  { id: "admissions", label: "Admissions", href: ADMIN_ROUTES.admissions, icon: "📝" },
  { id: "academics", label: "Academics", href: ADMIN_ROUTES.academics, icon: "📚" },
  { id: "attendance", label: "Attendance", href: ADMIN_ROUTES.attendance, icon: "✅" },
  { id: "examinations", label: "Examinations", href: ADMIN_ROUTES.examinations, icon: "📋" },
  { id: "fees", label: "Fees", href: ADMIN_ROUTES.fees, icon: "💰" },
  ...ADMIN_NAV_AFTER_FEES,
];

export function getAdminNavForInstitutionType(
  institutionType: InstitutionType | null,
): AdminNavItem[] {
  if (!institutionType) return ADMIN_NAV;
  const scoped = ADMIN_SCOPED_NAV[institutionType];
  const feesIndex = ADMIN_NAV.findIndex((item) => item.id === "fees");
  if (feesIndex === -1) return [...ADMIN_NAV, scoped];
  return [...ADMIN_NAV.slice(0, feesIndex + 1), scoped, ...ADMIN_NAV.slice(feesIndex + 1)];
}

const ENGAGEMENT_PREFIXES = ["/admin/engagement", "/admin/communications"];
const ACCOUNT_PREFIXES = ["/admin/account"];

export function resolveAdminNavId(pathname: string): AdminModuleId {
  if (ACCOUNT_PREFIXES.some((p) => pathname.startsWith(p))) return "account";
  if (ENGAGEMENT_PREFIXES.some((p) => pathname.startsWith(p))) return "engagement";
  if (pathname.startsWith(ADMIN_ROUTES.gallery)) return "gallery";
  if (pathname.startsWith(ADMIN_ROUTES.transport)) return "transport";
  if (pathname.startsWith(ADMIN_ROUTES.library)) return "library";
  if (pathname.startsWith(ADMIN_ROUTES.infra)) return "infra";
  if (pathname.startsWith(ADMIN_ROUTES.visitors)) return "visitors";
  if (pathname.startsWith(ADMIN_ROUTES.grievances)) return "grievances";
  if (pathname.startsWith(ADMIN_ROUTES.alerts)) return "alerts";
  if (pathname.startsWith(ADMIN_ROUTES.reports)) return "reports";
  if (pathname.startsWith(ADMIN_ROUTES.billing)) return "billing";
  if (pathname.startsWith(ADMIN_ROUTES.settings)) return "settings";
  if (pathname.startsWith(ADMIN_ROUTES.users)) return "users";
  if (pathname.startsWith(ADMIN_ROUTES.hr)) return "hr";
  if (pathname.startsWith(ADMIN_ROUTES.school)) return "school";
  if (pathname.startsWith(ADMIN_ROUTES.college)) return "college";
  if (pathname.startsWith(ADMIN_ROUTES.fees)) return "fees";
  if (pathname.startsWith(ADMIN_ROUTES.examinations)) return "examinations";
  if (pathname.startsWith(ADMIN_ROUTES.attendance)) return "attendance";
  if (pathname.startsWith(ADMIN_ROUTES.academics)) return "academics";
  if (pathname.startsWith(ADMIN_ROUTES.admissions)) return "admissions";
  return "dashboard";
}

export function isAdminNavItemActive(pathname: string, item: AdminNavItem): boolean {
  return resolveAdminNavId(pathname) === item.id;
}
