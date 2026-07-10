import type { InstitutionType } from "./admin";

export const FACULTY_ROUTES = {
  dashboard: "/faculty/dashboard",
  timetable: "/faculty/timetable",
  attendance: "/faculty/attendance",
  leave: "/faculty/leave",
  notes: "/faculty/notes",
  assignments: "/faculty/assignments",
  ai: "/faculty/ai",
  marks: "/faculty/marks",
  syllabus: "/faculty/syllabus",
  invigilation: "/faculty/invigilation",
  payslip: "/faculty/payslip",
  announcements: "/faculty/account",
  homework: "/faculty/homework",
  account: "/faculty/account",
  profile: "/faculty/account?tab=profile",
  alerts: "/faculty/alerts",
  transport: "/faculty/transport",
  library: "/faculty/library",
} as const;

export type FacultyNavId =
  | "dashboard"
  | "timetable"
  | "attendance"
  | "leave"
  | "homework"
  | "notes"
  | "assignments"
  | "ai"
  | "marks"
  | "syllabus"
  | "invigilation"
  | "payslip"
  | "transport"
  | "library"
  | "alerts"
  | "account";

export interface FacultyNavItem {
  id: FacultyNavId;
  label: string;
  href: string;
}

/** School-only scoped nav (F-042). */
export const FACULTY_SCOPED_NAV: Record<InstitutionType, FacultyNavItem | null> = {
  school: {
    id: "homework",
    label: "Homework / diary",
    href: FACULTY_ROUTES.homework,
  } satisfies FacultyNavItem,
  college: null,
};

const FACULTY_NAV_BASE: FacultyNavItem[] = [
  { id: "dashboard", label: "Dashboard", href: FACULTY_ROUTES.dashboard },
  { id: "timetable", label: "My Timetable", href: FACULTY_ROUTES.timetable },
  { id: "attendance", label: "Mark attendance", href: FACULTY_ROUTES.attendance },
  { id: "leave", label: "My leave", href: FACULTY_ROUTES.leave },
  { id: "notes", label: "Study material", href: FACULTY_ROUTES.notes },
  { id: "assignments", label: "Assignments", href: FACULTY_ROUTES.assignments },
  { id: "ai", label: "AI tools", href: FACULTY_ROUTES.ai },
  { id: "marks", label: "Marks entry", href: FACULTY_ROUTES.marks },
  { id: "syllabus", label: "Syllabus completion", href: FACULTY_ROUTES.syllabus },
  { id: "invigilation", label: "Invigilation", href: FACULTY_ROUTES.invigilation },
  { id: "transport", label: "Transport", href: FACULTY_ROUTES.transport },
  { id: "library", label: "Library", href: FACULTY_ROUTES.library },
  { id: "payslip", label: "My salary", href: FACULTY_ROUTES.payslip },
  { id: "alerts", label: "Alerts", href: FACULTY_ROUTES.alerts },
  { id: "account", label: "Account", href: FACULTY_ROUTES.account },
];

const ACCOUNT_PREFIXES = ["/faculty/account", "/faculty/announcements"];

export function resolveFacultyNavId(pathname: string): FacultyNavId {
  if (ACCOUNT_PREFIXES.some((p) => pathname.startsWith(p))) return "account";
  if (pathname.startsWith(FACULTY_ROUTES.timetable)) return "timetable";
  if (pathname.startsWith(FACULTY_ROUTES.homework)) return "homework";
  if (pathname.startsWith(FACULTY_ROUTES.attendance)) return "attendance";
  if (pathname.startsWith(FACULTY_ROUTES.leave)) return "leave";
  if (pathname.startsWith(FACULTY_ROUTES.notes)) return "notes";
  if (pathname.startsWith(FACULTY_ROUTES.assignments)) return "assignments";
  if (pathname.startsWith(FACULTY_ROUTES.ai)) return "ai";
  if (pathname.startsWith(FACULTY_ROUTES.marks)) return "marks";
  if (pathname.startsWith(FACULTY_ROUTES.syllabus)) return "syllabus";
  if (pathname.startsWith(FACULTY_ROUTES.invigilation)) return "invigilation";
  if (pathname.startsWith(FACULTY_ROUTES.transport)) return "transport";
  if (pathname.startsWith(FACULTY_ROUTES.library)) return "library";
  if (pathname.startsWith(FACULTY_ROUTES.payslip)) return "payslip";
  if (pathname.startsWith(FACULTY_ROUTES.alerts)) return "alerts";
  return "dashboard";
}

export function isFacultyNavItemActive(pathname: string, item: FacultyNavItem): boolean {
  return resolveFacultyNavId(pathname) === item.id;
}

export function getFacultyNavForInstitutionType(
  institutionType: InstitutionType | null,
): FacultyNavItem[] {
  const scoped = institutionType ? FACULTY_SCOPED_NAV[institutionType] : null;
  if (!scoped) return FACULTY_NAV_BASE;
  const leaveIndex = FACULTY_NAV_BASE.findIndex((item) => item.id === "leave");
  const insertAt = leaveIndex >= 0 ? leaveIndex + 1 : 1;
  return [...FACULTY_NAV_BASE.slice(0, insertAt), scoped, ...FACULTY_NAV_BASE.slice(insertAt)];
}
