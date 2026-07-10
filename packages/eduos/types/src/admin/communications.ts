import type { Role } from "../auth";

export type CommsChannel = "in_app" | "sms" | "email";
export type CommsAudienceTargetType = "all" | "role" | "batch" | "department";

export interface CommsAudienceTarget {
  type: CommsAudienceTargetType;
  value?: string; // role/batch/department value
}

export type CommsSendMode = "transactional" | "bulk";

export type CommsRecipientStatus = "queued" | "sent" | "failed" | "skipped";

export interface CommsPerRecipientStatus {
  userId: string;
  name: string;
  role: Role;
  channel: CommsChannel;
  status: CommsRecipientStatus;
  error?: string;
  /** F-293 — e.g. Dear Mother, Dear Guardian */
  greeting?: string;
  updatedAt: string;
}

export interface CommsMessage {
  id: string;
  createdAt: string;
  createdBy: string;
  title: string;
  body: string;
  channels: CommsChannel[];
  target: CommsAudienceTarget;
  sendMode: CommsSendMode;
  intendedRole?: Role; // F-177
  recipientCount: number;
  perRecipient: CommsPerRecipientStatus[];
}

// F-172 MSG91 DLT template (mock)
export interface SmsTemplate {
  id: string;
  name: string;
  dltTemplateId: string;
  active: boolean;
}

// F-173 email template (mock)
export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  active: boolean;
}

// F-179 notification preferences
export interface NotificationPreferences {
  userId: string;
  channels: Record<CommsChannel, boolean>;
}

/** Partial channel opt-in/out for PATCH */
export type UpdateNotificationChannelsInput = Partial<Record<CommsChannel, boolean>>;

// F-175 rate limiting (tenant-wide)
export interface TenantRateLimitState {
  maxPerMinute: number;
  windowStartAt: string;
  sentInWindow: number;
  queued: number;
  dropped: number;
}

// F-180 per-user flood protection
export interface UserFloodState {
  userId: string;
  windowStartAt: string;
  sentInWindow: number;
  maxPerWindow: number;
}

// F-178 automated alerts
export type AutomatedAlertType = "absence" | "fee_due" | "result_published";

export interface AutomatedAlertRule {
  id: string;
  type: AutomatedAlertType;
  enabled: boolean;
  channels: CommsChannel[];
  targetRole: Role;
}

export interface CommunicationsData {
  messages: CommsMessage[];
  smsTemplates: SmsTemplate[];
  emailTemplates: EmailTemplate[];
  alertRules: AutomatedAlertRule[];
  tenantRateLimit: TenantRateLimitState;
}

export interface SendCommsMessageInput {
  title: string;
  body: string;
  channels: CommsChannel[];
  target: CommsAudienceTarget;
  sendMode: CommsSendMode;
  intendedRole?: Role;
  templateId?: string;
}

