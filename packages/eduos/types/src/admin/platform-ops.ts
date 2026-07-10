export type ReportModuleId =
  | "admissions"
  | "fees"
  | "attendance"
  | "examinations"
  | "hr"
  | "academics";

export interface ReportDefinition {
  id: string;
  module: ReportModuleId;
  name: string;
  description: string;
  rowCount: number;
  /** Not yet available on backend */
  comingSoon?: boolean;
  /** Navigate to module instead of exporting here */
  linkHref?: string;
  /** Needs year/month (or other) params before export */
  requiresParams?: boolean;
}

export type ExportJobStatus = "queued" | "processing" | "running" | "ready" | "failed";

export interface ReportSnapshotMeta {
  capturedAt: string;
  rowCount: number;
  note: string;
}

export interface ExportJob {
  id: string;
  reportId: string;
  reportName: string;
  status: ExportJobStatus;
  rowCount: number;
  isBackground: boolean;
  snapshot: ReportSnapshotMeta;
  /** App proxy download (valid while signed URL is valid). */
  downloadUrl?: string;
  /** F-236 — mock S3 presigned URL (24h). */
  signedDownloadUrl?: string;
  /** F-236 — ISO timestamp when signed URL expires. */
  downloadExpiresAt?: string;
  createdAt: string;
  completedAt?: string;
  error?: string;
}

export interface IncompleteProfileFlag {
  userId: string;
  name: string;
  role: string;
  missingFields: string[];
}

export interface BulkImportFailedRow {
  row: number;
  reason: string;
  data: Record<string, string>;
}

export interface BulkImportResult {
  successCount: number;
  failedRows: BulkImportFailedRow[];
  importId: string;
  canRetryFailedOnly: boolean;
}

export interface RolloverStudentPreview {
  studentId: string;
  name: string;
  fromClass: string;
  toClass: string;
}

export interface RolloverPreview {
  fromYearLabel: string;
  toYearLabel: string;
  studentsToPromote: RolloverStudentPreview[];
  warnings: string[];
  version: number;
}

export interface RolloverState {
  lastRolloverAt: string | null;
  undoExpiresAt: string | null;
  canUndo: boolean;
  preview: RolloverPreview | null;
}

export interface SoftDeleteMeta {
  is_active: boolean;
  deleted_at: string | null;
  deleted_by: string | null;
}
