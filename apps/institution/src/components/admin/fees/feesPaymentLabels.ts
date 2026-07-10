import type { FeePayment } from "@eduos/types";

export type RecordPaymentMethod = "cash" | "upi" | "cheque" | "bank_transfer";

export const RECORD_PAYMENT_METHODS: { value: RecordPaymentMethod; label: string }[] = [
  { value: "cash", label: "Cash (at school)" },
  { value: "upi", label: "UPI (at school)" },
  { value: "cheque", label: "Cheque" },
  { value: "bank_transfer", label: "Bank transfer" },
];

export function paymentChannelLabel(payment: Pick<FeePayment, "source" | "method">): string {
  if (payment.source === "gateway") return "Online (Razorpay)";
  if (payment.method === "cash") return "At school · Cash";
  if (payment.method === "upi") return "At school · UPI";
  if (payment.method === "card") return "At school · Card";
  if (payment.method === "netbanking") return "At school · Net banking";
  return "At school";
}

export function paymentMethodShort(payment: Pick<FeePayment, "method" | "source">): string {
  if (payment.source === "gateway") return "Razorpay";
  return payment.method.toUpperCase();
}
