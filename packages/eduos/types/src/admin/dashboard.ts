export type AdminAlertSeverity = "info" | "warning" | "critical";

export interface AdminDashboardSnapshot {
  studentsPresentPercent: number;
  studentsPresentCount: number;
  studentsTotal: number;
  feeCollectedToday: number;
  feeCollectedCurrency: "INR";
  feeTrendLabel?: string;
  classesRunning: number;
  classesScheduled: number;
  complianceScore?: number;
  asOf: string;
}

export type AdminQuickActionType = "mark-holiday" | "send-announcement";

export interface AdminQuickAction {
  id: string;
  label: string;
  description: string;
  href?: string;
  action?: AdminQuickActionType;
}

export interface AdminAlert {
  id: string;
  title: string;
  message: string;
  severity: AdminAlertSeverity;
  href?: string;
  count?: number;
}

export interface LiveClassAttendance {
  classId: string;
  classLabel: string;
  present: number;
  total: number;
}

export interface LiveAttendanceSnapshot {
  present: number;
  total: number;
  percent: number;
  classes: LiveClassAttendance[];
  updatedAt: string;
}

export interface AdminDashboardData {
  snapshot: AdminDashboardSnapshot;
  quickActions: AdminQuickAction[];
  alerts: AdminAlert[];
  /** Embedded on initial load so the client need not poll immediately. */
  live?: LiveAttendanceSnapshot;
}
