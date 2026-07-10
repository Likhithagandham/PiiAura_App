/** F-291 — student identity registry for duplicate / twin handling */
export interface StudentRegistryEntry {
  studentId: string;
  name: string;
  dateOfBirth: string;
  phone: string;
  siblingGroupId: string | null;
  isArchived: boolean;
  twinConfirmReason?: string | null;
}

export interface DuplicateEnrollmentWarning {
  existingStudentId: string;
  existingName: string;
  /** @deprecated use matchFields */
  matchField?: string;
  matchFields: string[];
  dateOfBirth?: string;
  phone?: string;
  siblingGroupId?: string | null;
  allowTwinConfirm: boolean;
}

export interface ConfirmTwinEnrollmentInput {
  applicationId: string;
  reason: string;
}
