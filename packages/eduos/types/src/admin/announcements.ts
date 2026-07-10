export type AnnouncementTargetType = "all" | "batch" | "department" | "role";
export type AnnouncementChannel = "in_app" | "sms" | "email";
/** F-195: institution-wide vs branch-specific */
export type AnnouncementScope = "institution" | "branch";

export interface Announcement {
  id: string;
  title: string;
  body: string;
  targetType: AnnouncementTargetType;
  targetLabel: string;
  /** F-195 */
  scope?: AnnouncementScope;
  branchId?: string | null;
  branchName?: string | null;
  channels: AnnouncementChannel[];
  sentAt: string;
  recipientCount: number;
  deliveryStatus: {
    in_app: "sent" | "pending" | "failed" | "skipped";
    sms: "sent" | "pending" | "failed" | "skipped";
    email: "sent" | "pending" | "failed" | "skipped";
  };
}

export interface CreateAnnouncementInput {
  title: string;
  body: string;
  targetType: AnnouncementTargetType;
  targetValue?: string;
  channels: AnnouncementChannel[];
}
