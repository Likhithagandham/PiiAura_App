export interface CollegeElectiveRule {
  id: string;
  semester: string; // e.g. "Sem 3"
  groupName: string; // e.g. "Elective 1"
  allowedSubjectIds: string[];
  allowedSubjectNames: string[];
  minSelect: number;
  maxSelect: number;
  createdAt: string;
}

export interface StudentElectiveSelection {
  id: string;
  studentId: string;
  studentName: string;
  semester: string;
  groupName: string;
  selectedSubjectIds: string[];
  selectedSubjectNames: string[];
  submittedAt: string;
}

export interface NaacNirfExportResult {
  fileName: string;
  content: string; // CSV content
}

export type { NaacExportPreview, NaacExportWithGapsResult, NaacFieldGap } from "./analytics";

export interface CollegeOnlyData {
  institutionType: "school" | "college";
  electiveRules: CollegeElectiveRule[];
  electiveSelections: StudentElectiveSelection[];
}

export interface SaveElectiveRuleInput {
  id?: string;
  semester: string;
  groupName: string;
  allowedSubjectIds: string[];
  minSelect: number;
  maxSelect: number;
}

export interface SaveElectiveSelectionInput {
  semester: string;
  groupName: string;
  selectedSubjectIds: string[];
}

