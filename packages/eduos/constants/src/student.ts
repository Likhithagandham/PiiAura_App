export const STUDENT_ROUTES = {
  dashboard: "/student/dashboard",
  learn: "/student/learn",
  leave: "/student/leave",
  materials: "/student/learn?tab=materials",
  assignments: "/student/learn?tab=assignments",
  videos: "/student/learn?tab=videos",
  quizzes: "/student/learn?tab=quizzes",
  exams: "/student/exams",
  examFees: "/student/fees?tab=exam",
  results: "/student/exams?tab=results",
  performance: "/student/exams?tab=performance",
  aiInsights: "/student/exams?tab=ai-insights",
  fees: "/student/fees",
  account: "/student/account",
  alerts: "/student/alerts",
  notices: "/student/notices",
  timetable: "/student/timetable",
  homework: "/student/homework",
  profile: "/student/account?tab=profile",
  sessions: "/student/account?tab=devices",
  /** @deprecated Use `notices` */
  announcements: "/student/notices",
  /** @deprecated Notifications preferences not yet on Account */
  notifications: "/student/account?tab=profile",
  grievances: "/student/help",
  help: "/student/help",
  view360: "/student/360-view",
  gallery: "/student/gallery",
  transport: "/student/transport",
  library: "/student/library",
  assistant: "/student/assistant",
  classroomQuiz: "/student/classroom-quiz",
  referral: "/student/referral",
} as const;

export type StudentNavId =
  | "dashboard"
  | "learn"
  | "timetable"
  | "homework"
  | "classroomQuiz"
  | "exams"
  | "fees"
  | "leave"
  | "alerts"
  | "notices"
  | "view360"
  | "gallery"
  | "transport"
  | "library"
  | "assistant"
  | "referral"
  | "help"
  | "account";

export interface StudentNavItem {
  id: StudentNavId;
  label: string;
  href: string;
}

export const STUDENT_NAV: StudentNavItem[] = [
  { id: "dashboard", label: "Dashboard", href: STUDENT_ROUTES.dashboard },
  { id: "learn", label: "Learn", href: STUDENT_ROUTES.learn },
  { id: "timetable", label: "Timetable", href: STUDENT_ROUTES.timetable },
  { id: "homework", label: "Homework", href: STUDENT_ROUTES.homework },
  { id: "classroomQuiz", label: "Classroom quiz", href: STUDENT_ROUTES.classroomQuiz },
  { id: "exams", label: "Exams", href: STUDENT_ROUTES.exams },
  { id: "fees", label: "Fees", href: STUDENT_ROUTES.fees },
  { id: "leave", label: "Leave", href: STUDENT_ROUTES.leave },
  { id: "alerts", label: "Alerts", href: STUDENT_ROUTES.alerts },
  { id: "notices", label: "Notices", href: STUDENT_ROUTES.notices },
  { id: "gallery", label: "Gallery", href: STUDENT_ROUTES.gallery },
  { id: "view360", label: "360° view", href: STUDENT_ROUTES.view360 },
  { id: "transport", label: "Transport", href: STUDENT_ROUTES.transport },
  { id: "library", label: "Library", href: STUDENT_ROUTES.library },
  { id: "assistant", label: "Assistant", href: STUDENT_ROUTES.assistant },
  { id: "referral", label: "Referral", href: STUDENT_ROUTES.referral },
  { id: "help", label: "Help", href: STUDENT_ROUTES.help },
  { id: "account", label: "Account", href: STUDENT_ROUTES.account },
];

const LEARN_PREFIXES = ["/student/learn", "/student/materials", "/student/assignments", "/student/quizzes"];
const EXAM_PREFIXES = ["/student/exams", "/student/results", "/student/performance", "/student/exam-fees"];
const FEE_PREFIXES = ["/student/fees"];
const ACCOUNT_PREFIXES = [
  "/student/account",
  "/student/profile",
  "/student/notifications",
  "/student/sessions",
  "/student/announcements",
];
const HELP_PREFIXES = ["/student/help", "/student/grievances"];

export function resolveStudentNavId(pathname: string): StudentNavId {
  if (pathname.startsWith("/student/leave")) return "leave";
  if (pathname.startsWith("/student/gallery")) return "gallery";
  if (pathname.startsWith("/student/transport")) return "transport";
  if (pathname.startsWith("/student/library")) return "library";
  if (pathname.startsWith("/student/assistant")) return "assistant";
  if (pathname.startsWith("/student/referral")) return "referral";
  if (FEE_PREFIXES.some((p) => pathname.startsWith(p))) return "fees";
  if (EXAM_PREFIXES.some((p) => pathname.startsWith(p))) return "exams";
  if (LEARN_PREFIXES.some((p) => pathname.startsWith(p))) return "learn";
  if (pathname.startsWith("/student/timetable")) return "timetable";
  if (pathname.startsWith("/student/homework")) return "homework";
  if (pathname.startsWith("/student/classroom-quiz")) return "classroomQuiz";
  if (pathname.startsWith("/student/alerts")) return "alerts";
  if (pathname.startsWith("/student/notices")) return "notices";
  if (pathname.startsWith("/student/360-view")) return "view360";
  if (HELP_PREFIXES.some((p) => pathname.startsWith(p))) return "help";
  if (ACCOUNT_PREFIXES.some((p) => pathname.startsWith(p))) return "account";
  return "dashboard";
}

export function isStudentNavItemActive(pathname: string, item: StudentNavItem): boolean {
  return resolveStudentNavId(pathname) === item.id;
}
