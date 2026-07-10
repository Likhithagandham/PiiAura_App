/** Sensitive mutation audit trail */
export interface AuditLogDiffLine {
  field: string;
  before: string | null;
  after: string | null;
}

export interface AuditLogEntry {
  id: string;
  at: string;
  actorId: string;
  actorName: string;
  actorRole: string;
  action: string;
  entityType: string;
  entityId: string;
  ipAddress: string;
  diff: AuditLogDiffLine[];
}

export interface AuditLogData {
  entries: AuditLogEntry[];
}

/** NAAC export gap review before download */
export interface NaacFieldGap {
  entityId: string;
  entityLabel: string;
  missingFields: string[];
}

export interface NaacExportPreview {
  gaps: NaacFieldGap[];
  totalRecords: number;
  recordsWithGaps: number;
  requiredFields: string[];
}

export interface NaacExportWithGapsResult {
  fileName: string;
  content: string;
  gaps: NaacFieldGap[];
}
