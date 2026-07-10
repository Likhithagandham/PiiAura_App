import type { StudentFeesData, StudentFeeInstallmentRow, StudentRazorpayOrder } from "@eduos/types";

type DjangoInstallment = {
  id: string;
  sequence: number;
  amountPaise: number;
  paidPaise: number;
  dueDate: string;
  status: string;
};

export type DjangoInvoice = {
  id: string;
  dueDate?: string;
  totalPaise: number;
  paidPaise: number;
  status: string;
  installments?: DjangoInstallment[];
};

type DjangoPayment = {
  id: string;
  amountPaise: number;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
};

export function paiseToInr(paise: number): number {
  return Math.round(paise) / 100;
}

export function buildInstallmentSchedule(invoices: DjangoInvoice[]): StudentFeeInstallmentRow[] {
  const rows: StudentFeeInstallmentRow[] = [];
  for (const inv of invoices) {
    for (const inst of inv.installments ?? []) {
      const amount = paiseToInr(inst.amountPaise);
      const paid = paiseToInr(inst.paidPaise);
      rows.push({
        invoiceId: inv.id,
        installmentId: inst.id,
        sequence: inst.sequence,
        label: `Installment ${inst.sequence}`,
        dueDate: inst.dueDate,
        amount,
        paid,
        balance: Math.max(0, amount - paid),
        status: inst.status as StudentFeeInstallmentRow["status"],
      });
    }
  }
  return rows.sort((a, b) => a.dueDate.localeCompare(b.dueDate) || a.sequence - b.sequence);
}

export function composeFeesDataFromInvoices(
  invoices: DjangoInvoice[],
  extras: {
    institutionType: "school" | "college";
    payments: StudentFeesData["payments"];
    razorpayKeyId: string;
    examFees: StudentFeesData["examFees"];
  },
): StudentFeesData {
  const totalDue = invoices.reduce((sum, i) => sum + paiseToInr(i.totalPaise), 0);
  const paid = invoices.reduce((sum, i) => sum + paiseToInr(i.paidPaise), 0);
  const balance = Math.max(0, totalDue - paid);
  const today = new Date().toISOString().slice(0, 10);
  const openDueDates = invoices
    .filter((i) => paiseToInr(i.totalPaise) - paiseToInr(i.paidPaise) > 0 && i.dueDate)
    .map((i) => i.dueDate as string);
  const nextDueDate = openDueDates.length > 0 ? openDueDates.sort()[0]! : null;
  const isOverdue = openDueDates.some((d) => d < today);

  return {
    institutionType: extras.institutionType,
    ledger: { totalDue, paid, balance, nextDueDate, isOverdue },
    payments: extras.payments,
    razorpayKeyId: extras.razorpayKeyId,
    examFees: extras.examFees,
    installmentSchedule: buildInstallmentSchedule(invoices),
  };
}

export function pickOpenInvoice(invoices: DjangoInvoice[]): DjangoInvoice | null {
  const open = invoices
    .filter((i) => i.totalPaise - i.paidPaise > 0)
    .sort((a, b) => (a.dueDate ?? "").localeCompare(b.dueDate ?? ""));
  return open[0] ?? null;
}

export function mapPaymentToRazorpayOrder(
  payment: DjangoPayment,
  razorpayKeyId: string,
): StudentRazorpayOrder {
  return {
    orderId: payment.razorpayOrderId ?? "",
    backendPaymentId: payment.id,
    amount: paiseToInr(payment.amountPaise),
    amountPaise: payment.amountPaise,
    currency: "INR",
    razorpayKeyId,
  };
}
