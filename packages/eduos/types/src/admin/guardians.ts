export type GuardianRelationship =
  | "father"
  | "mother"
  | "step_father"
  | "step_mother"
  | "guardian"
  | "custodian"
  | "sibling"
  | "other";

export interface GuardianNotificationPrefs {
  in_app: boolean;
  sms: boolean;
  email: boolean;
}

/** F-286 — N guardians per student; guardian may link to multiple students (siblings). */
export interface StudentGuardianLink {
  id: string;
  studentId: string;
  studentName: string;
  guardianUserId: string;
  guardianName: string;
  relationship: GuardianRelationship;
  /** F-287 — only true allows parent portal for this child */
  hasPortalAccess: boolean;
  /** F-288 — exactly one true per student */
  isPrimaryContact: boolean;
  /** Authorized to pick up the student from school */
  canPickup?: boolean;
  /** F-289 — per-link channel routing (intersected with user prefs) */
  receivesNotifications: GuardianNotificationPrefs;
  createdAt: string;
  classLabel?: string;
  branchId?: string | null;
  branchName?: string;
}

export interface GuardianStudentSummary {
  studentId: string;
  studentName: string;
  classLabel: string;
  branchId?: string | null;
  branchName?: string;
}

export interface GuardianManagementData {
  links: StudentGuardianLink[];
  students: GuardianStudentSummary[];
  guardians: { userId: string; name: string }[];
  branchScope?: string;
  classScope?: string;
  classOptions?: string[];
}

export interface SaveGuardianLinkInput {
  id?: string;
  studentId: string;
  guardianUserId: string;
  relationship: GuardianRelationship;
  hasPortalAccess: boolean;
  isPrimaryContact: boolean;
  canPickup?: boolean;
  receivesNotifications: GuardianNotificationPrefs;
}
