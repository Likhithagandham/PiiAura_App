export type StudentRiskLevel = "low" | "medium" | "high" | "unknown";

export interface StudentAnalysisSubject {
  subjectId: string;
  subjectName: string;
  averageMarks: number;
}

export interface StudentAnalysisMarkEntry {
  entryId: string;
  examId: string;
  examName: string;
  subjectId: string;
  subjectName: string;
  marks: number | null;
  isAbsent: boolean;
  isInternal: boolean;
  graceApplied: number;
  marksStatus: string;
}

export interface StudentAnalysisAttendanceRecord {
  recordId: string;
  sessionId: string;
  date: string;
  status: string;
  markedAt: string;
  lateMark: boolean;
}

export interface StudentAnalysisFeeInvoice {
  invoiceId: string;
  label: string;
  totalPaise: number;
  paidPaise: number;
  balancePaise: number;
  status: string;
  dueDate: string | null;
}

export interface StudentAnalysisReport {
  rollNumber: string;
  student: {
    userId: string;
    name: string;
    email: string | null;
    phone: string | null;
    customLoginId: string;
    branchId: string | null;
    tenantId: string | null;
  };
  profile: {
    profileId: string;
    gender: string | null;
    dateOfBirth: string | null;
    bloodGroup: string | null;
    address: string | null;
    nationality: string | null;
    religion: string | null;
    admissionDate: string | null;
    academicStatus: string | null;
    batchId: string | null;
  } | null;
  enrollment: {
    enrollmentId: string;
    status: string;
    batchId: string | null;
    batchName: string | null;
    academicYearId: string;
    academicYearName: string;
    branchId: string;
  } | null;
  attendance: {
    averagePercent: number;
    totalRecords: number;
    records: StudentAnalysisAttendanceRecord[];
  };
  marks: {
    averageMarks: number;
    totalEntries: number;
    entries: StudentAnalysisMarkEntry[];
  };
  fees: {
    totalDuePaise: number;
    openInvoiceCount: number;
    invoices: StudentAnalysisFeeInvoice[];
  };
  analysis: {
    averageMarks: number;
    averageAttendance: number;
    weakSubjects: StudentAnalysisSubject[];
    strongSubjects: StudentAnalysisSubject[];
    totalBacklogs: number;
    riskScore: StudentRiskLevel;
    totalDuePaise: number;
    openInvoiceCount: number;
  };
}

export interface StudentAnalysisChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  report?: StudentAnalysisReport;
}

export interface StudentAnalysisChatResponse {
  reply: string;
  rollNumber?: string;
  report?: StudentAnalysisReport;
}
