export type FeeComponentKind = "tuition" | "transport" | "hostel" | "exam" | "other";

export interface FeeComponent {
  id: string;
  name: string;
  kind: FeeComponentKind;
  amount: number; // INR
  amountPaise?: number; // integer paise (preferred storage)
}

export interface Installment {
  id: string;
  label: string;
  dueDate: string; // YYYY-MM-DD
  amount: number; // INR
  amountPaise?: number; // integer paise (preferred storage)
}

export interface FeeStructure {
  id: string;
  name: string;
  appliesToLabel: string; // batch/course/class label
  batchId?: string | null;
  academicYearId?: string | null;
  components: FeeComponent[];
  installments: Installment[];
  createdAt: string;
  version: number;
}

export type ConcessionStatus = "pending" | "approved" | "rejected";

export interface ConcessionRule {
  id: string;
  name: string;
  description: string;
  percentOff: number; // 0..100
  requiresApproval: boolean;
  active: boolean;
}

export interface ConcessionRequest {
  id: string;
  studentId: string;
  studentName: string;
  classLabel: string;
  ruleId: string;
  ruleName: string;
  requestedAt: string;
  status: ConcessionStatus;
  reviewedAt: string | null;
  reviewNote: string | null;
}

export interface FeePayment {
  id: string;
  studentId: string;
  studentName: string;
  classLabel: string;
  paidAt: string;
  amount: number; // INR
  amountPaise?: number; // integer paise (preferred storage)
  method: "cash" | "upi" | "card" | "netbanking";
  reference: string;
  receiptNo: string;
  orderId: string;
  status: "captured" | "pending" | "failed" | "refunded";
  source?: "manual" | "gateway";
  invoiceId?: string;
}

export interface RefundRequest {
  id: string;
  paymentId: string;
  studentName: string;
  amount: number;
  amountPaise?: number;
  reason: string;
  status: "pending" | "approved" | "rejected" | "processed";
  requestedAt: string;
  reviewedAt: string | null;
  reviewNote: string | null;
}

export interface CreditNote {
  id: string;
  studentId: string;
  studentName: string;
  classLabel: string;
  amount: number; // INR (display)
  amountPaise?: number; // integer paise
  reason: string;
  createdAt: string;
  status: "active" | "void";
}

export interface CreditNoteRequest {
  id: string;
  studentId: string;
  studentName: string;
  classLabel: string;
  amount: number; // INR (display)
  amountPaise?: number; // integer paise
  reason: string;
  requestedAt: string;
  status: "pending" | "approved" | "rejected";
  reviewedAt: string | null;
  reviewNote: string | null;
}

export interface ExamFeeInvoice {
  id: string;
  examSlotId: string;
  studentId: string;
  studentName: string;
  amount: number; // INR (display)
  amountPaise?: number; // integer paise
  status: "unpaid" | "paid" | "cancelled";
  createdAt: string;
  paidAt: string | null;
}

export interface WebhookEventLog {
  id: string;
  provider: "razorpay";
  eventType: "payment.captured" | "payment.failed" | "refund.processed";
  receivedAt: string;
  signatureVerified: boolean;
  idempotencyKey: string;
  status: "processed" | "ignored_duplicate" | "failed";
  note: string;
}

export interface PaymentReconciliationItem {
  orderId: string;
  paymentId: string | null;
  status: "pending" | "captured" | "failed";
  lastCheckedAt: string;
  note: string;
}

export interface StudentInstallmentScheduleRow {
  sequence: number;
  label: string;
  dueDate: string;
  amount: number;
  paid: number;
  status: "due" | "partial" | "paid" | "overdue";
}

export interface FeeBatchOption {
  id: string;
  label: string;
}

export interface StudentFeeLedgerRow {
  studentId: string;
  studentName: string;
  classLabel: string;
  totalDue: number;
  paid: number;
  balance: number;
  nextDueDate: string | null;
  isOverdue: boolean;
  escalationLevel: 0 | 1 | 2 | 3;
}

export interface FeeCollectionSnapshot {
  collectedToday: number;
  collectedThisMonth: number;
  outstandingTotal: number;
  overdueCount: number;
  updatedAt: string;
}

/** Aggregate stats for a payments filter — GET /api/admin/fees/payments/summary. */
export interface FeePaymentsSummary {
  count: number;
  totalPaise: number;
  methodBreakdown: { cash: number; upi: number; online: number; other: number };
}

export interface FeesData {
  institutionType: "school" | "college";
  structures: FeeStructure[];
  concessionRules: ConcessionRule[];
  concessionRequests: ConcessionRequest[];
  creditNotes: CreditNote[];
  creditNoteRequests: CreditNoteRequest[];
  examFeeInvoices: ExamFeeInvoice[];
  ledger: StudentFeeLedgerRow[];
  collection: FeeCollectionSnapshot;
  refunds: RefundRequest[];
  webhooks: WebhookEventLog[];
  reconciliation: PaymentReconciliationItem[];
  installmentSchedulesByStudent?: Record<string, StudentInstallmentScheduleRow[]>;
  batches?: FeeBatchOption[];
  currentAcademicYearId?: string | null;
}

export interface SaveFeeStructureInput {
  id?: string;
  name: string;
  appliesToLabel: string;
  batchId?: string;
  academicYearId?: string;
  components: { name: string; kind: FeeComponentKind; amount: number }[];
  installments: { label: string; dueDate: string; amount: number }[];
}

export interface SaveConcessionRuleInput {
  id?: string;
  name: string;
  description: string;
  percentOff: number;
  requiresApproval: boolean;
  active: boolean;
}

export interface ReviewConcessionInput {
  requestId: string;
  approve: boolean;
  note?: string;
}

export interface ReviewRefundInput {
  refundId: string;
  approve: boolean;
  note?: string;
}

export interface RequestCreditNoteInput {
  studentId: string;
  studentName: string;
  classLabel: string;
  amount: number;
  reason: string;
}

export interface ReviewCreditNoteInput {
  creditNoteRequestId: string;
  approve: boolean;
  note?: string;
}

