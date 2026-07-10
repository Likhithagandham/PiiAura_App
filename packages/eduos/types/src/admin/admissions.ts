export type EnquirySource = "walk_in" | "social" | "referral" | "online";

export type PipelineStage =
  | "enquiry"
  | "application"
  | "documents"
  | "verification"
  | "enrollment";

export const PIPELINE_STAGES: PipelineStage[] = [
  "enquiry",
  "application",
  "documents",
  "verification",
  "enrollment",
];

export interface Enquiry {
  id: string;
  applicantName: string;
  phone: string;
  email: string;
  source: EnquirySource;
  courseInterest: string;
  notes: string;
  createdAt: string;
}

export interface ApplicationDocument {
  id: string;
  name: string;
  status: "pending" | "verified" | "rejected";
  uploadedAt: string;
  storageKey: string;
}

export interface WizardProgress {
  currentStep: number;
  completedSteps: number[];
  lastSavedAt: string;
}

export interface EligibilityResult {
  eligible: boolean;
  rules: { rule: string; passed: boolean; message: string }[];
}

export interface ApplicantProfile {
  dateOfBirth: string;
  gender: "" | "male" | "female" | "other";
  previousSchool: string;
  previousGrade: string;
  previousMarksPercent: number | null;
  parentGuardianName: string;
  address: string;
}

/** Per-class / per-program admission criteria shown during eligibility check */
export interface CourseEligibilityRule {
  course: string;
  minAge: number;
  maxAge: number | null;
  minMarksPercent: number;
  requiredPreviousGrade: string;
  description: string;
}

export type ApplicationStatus = "active" | "rejected";

export interface FeeStructureSnapshot {
  id: string;
  name: string;
  totalAmount: number;
  currency: "INR";
  breakdown: { label: string; amount: number }[];
  assignedAt: string;
}

export interface RejectionInfo {
  reason: string;
  rejectedAt: string;
}

export interface EnrollmentProvisioning {
  studentUserId: string | null;
  parentUserId: string | null;
  parentInviteSentAt: string | null;
  parentLinkConfirmedAt: string | null;
}

export interface ArchivedBranchLink {
  archivedStudentId: string;
  branchName: string;
  notes: string;
  linkedAt: string;
}

export interface Application {
  id: string;
  applicantName: string;
  phone: string;
  email: string;
  course: string;
  intake: string;
  stage: PipelineStage;
  source: EnquirySource;
  wizard: WizardProgress;
  applicant: ApplicantProfile;
  eligibility: EligibilityResult | null;
  documents: ApplicationDocument[];
  meritScore: number | null;
  waitlisted: boolean;
  waitlistRank: number | null;
  waitlistEntryId: string | null;
  parentPhone: string | null;
  parentLinkedWarning: boolean;
  status: ApplicationStatus;
  rejection: RejectionInfo | null;
  feeSnapshot: FeeStructureSnapshot | null;
  provisioning: EnrollmentProvisioning | null;
  archivedBranchLink: ArchivedBranchLink | null;
  enrolledStudentId: string | null;
  photoS3Key: string | null;
  photoUrl: string | null;
  idCardGeneratedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationRecipient {
  label: string;
  phone: string | null;
  email: string | null;
  smsStatus: "sent" | "failed" | "skipped";
  emailStatus: "sent" | "failed" | "skipped";
}

export interface PipelineNotificationBatch {
  id: string;
  applicationId: string;
  applicantName: string;
  fromStage: PipelineStage;
  toStage: PipelineStage;
  message: string;
  sentAt: string;
  recipients: NotificationRecipient[];
}

export interface MeritListEntry {
  rank: number;
  applicationId: string;
  applicantName: string;
  course: string;
  score: number;
}

export interface FunnelMetrics {
  byStage: Record<PipelineStage, number>;
  bySource: Record<EnquirySource, number>;
  conversionRate: number;
}

export type { DuplicateEnrollmentWarning, StudentRegistryEntry, ConfirmTwinEnrollmentInput } from "./students";

export interface CreateEnquiryInput {
  applicantName: string;
  phone: string;
  email: string;
  source: EnquirySource;
  courseInterest: string;
  notes?: string;
}

export interface AdmissionsData {
  enquiries: Enquiry[];
  applications: Application[];
  funnel: FunnelMetrics;
  courses: string[];
  /** Course id + name pairs for resolving enquiry/merit actions against Django. */
  courseCatalog?: Array<{ id: string; name: string }>;
  intakes: string[];
  notificationLog: PipelineNotificationBatch[];
  institutionName: string;
  eligibilityRules: CourseEligibilityRule[];
}
