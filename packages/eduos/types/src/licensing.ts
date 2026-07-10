/**
 * Platform licensing — non-recyclable per-student licenses.
 * Shapes mirror eduOS-backend apps/organizations/serializers/licensing.py.
 */

import type { PlatformTenantPricing } from "./platform-owner";

export type SubscriptionPeriodStatus = "active" | "grace" | "expired" | "cancelled";
export type LicenseInvoiceType = "initial" | "top_up" | "renewal";
export type LicenseInvoiceStatus = "draft" | "issued" | "paid" | "void";
export type LicensePaymentMode = "cash" | "cheque" | "upi" | "bank_transfer" | "online";
export type StudentLicenseStatus = "licensed" | "unlicensed";

export interface LicensePeriod {
  id: string;
  startDate: string;
  endDate: string;
  status: SubscriptionPeriodStatus;
  pricePerStudentInr: number;
  graceEndsAt: string | null;
}

export interface LicenseSummary {
  licensesPurchased: number;
  licensesConsumed: number;
  unlicensedStudents: number;
  pendingAmountInr: number;
  unitPriceInr: number;
  period: LicensePeriod | null;
}

/** Tenant-scoped summary for school dashboards (Super Admin / Branch Admin). */
export interface SchoolLicenseSummary extends LicenseSummary {
  branchUnlicensedStudents?: number;
  branchPendingAmountInr?: number;
  payments?: LicensePaymentRecord[];
}

export interface LicensePaymentRecord {
  id: string;
  tenantId: string;
  branchId: string | null;
  branchName: string | null;
  licensesGranted: number;
  amountInr: number;
  paymentMode: LicensePaymentMode;
  referenceNumber: string;
  paidAt: string;
  notes: string;
  recordedBy: string;
  createdAt: string;
}

export interface LicenseInvoiceRecord {
  id: string;
  tenantId: string;
  invoiceType: LicenseInvoiceType;
  licensesCount: number;
  unitPriceInr: number;
  amountInr: number;
  status: LicenseInvoiceStatus;
  issuedAt: string | null;
  notes: string;
}

export interface StudentLicenseRow {
  id: string;
  studentUserId: string | null;
  studentName: string;
  admissionNumber: string | null;
  branchId: string | null;
  branchName: string | null;
  enrolledAt: string;
  licenseStatus: StudentLicenseStatus;
  licensedAt: string | null;
  isActive: boolean;
}

export interface PlatformLicensingSchoolRow extends LicenseSummary {
  tenantId: string;
  tenantName: string;
  subdomain: string;
}

export interface PlatformLicensingUpcomingRenewal {
  tenantId: string;
  tenantName: string;
  endDate: string;
  licensesConsumed: number;
  renewalAmountInr: number;
}

export interface PlatformLicensingOverview {
  kpis: {
    totalSchools: number;
    totalLicensedStudents: number;
    totalUnlicensedStudents: number;
    pendingCollectionsInr: number;
    revenueCollectedInr: number;
    schoolsRequiringBilling: number;
  };
  schools: PlatformLicensingSchoolRow[];
  upcomingRenewals: PlatformLicensingUpcomingRenewal[];
}

export interface LicenseBranchBillingRow {
  id: string;
  name: string;
  unlicensedCount: number;
  pendingAmountInr: number;
}

export interface PlatformLicensingTenantDetail {
  tenant: { id: string; name: string; subdomain: string; status: string };
  summary: LicenseSummary;
  pricing: PlatformTenantPricing;
  branches: LicenseBranchBillingRow[];
  unlicensedQueue: StudentLicenseRow[];
  payments: LicensePaymentRecord[];
  invoices: LicenseInvoiceRecord[];
  periods: LicensePeriod[];
}

export interface RecordLicensePaymentInput {
  tenantId: string;
  licensesGranted: number;
  amountInr: number;
  paymentMode: LicensePaymentMode;
  branchId?: string | null;
  referenceNumber?: string;
  paidAt?: string;
  notes?: string;
  idempotencyKey?: string;
  invoiceId?: string;
}

export interface GenerateLicenseInvoiceInput {
  tenantId: string;
  invoiceType: LicenseInvoiceType;
  licensesCount?: number;
  branchId?: string | null;
  notes?: string;
}

/** Student access policy computed from license + subscription state. */
export interface StudentAccessInfo {
  licenseStatus: StudentLicenseStatus | null;
  subscriptionStatus: SubscriptionPeriodStatus | null;
  blockedModules: string[];
}
