import { NextResponse } from "next/server";
import {
  captureFeePayment,
  createFeePaymentOrder,
  getFees,
  payExamFee,
} from "@/lib/services/student-server";
import { requireStudent, studentJson } from "@/lib/student/api";

function studentCtx(auth: { subdomain: string; studentUserId: string; rollNumber: string | null; studentName: string }) {
  return {
    subdomain: auth.subdomain,
    userId: auth.studentUserId,
    rollNumber: auth.rollNumber,
    studentName: auth.studentName,
  };
}

export async function GET(request: Request) {
  const auth = await requireStudent(request);
  if (!auth.ok) return auth.response;
  try {
    return studentJson(auth, await getFees(request, studentCtx(auth)));
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Failed to load" }, { status: 400 });
  }
}

export async function POST(request: Request) {
  const auth = await requireStudent(request);
  if (!auth.ok) return auth.response;
  try {
    const body = (await request.json()) as { amount?: number; invoiceId?: string };
    if (body.invoiceId) {
      const paid = await payExamFee(request, studentCtx(auth), String(body.invoiceId));
      return studentJson(auth, { invoice: paid });
    }
    const fees = await getFees(request, studentCtx(auth));
    const amount = Number(body.amount) > 0 ? Number(body.amount) : fees.ledger.balance;
    if (amount <= 0) {
      return NextResponse.json({ error: "No balance due" }, { status: 400 });
    }
    const order = await createFeePaymentOrder(request, studentCtx(auth), amount);
    return studentJson(auth, { order });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Could not create order" }, { status: 400 });
  }
}

export async function PATCH(request: Request) {
  const auth = await requireStudent(request);
  if (!auth.ok) return auth.response;
  try {
    const body = (await request.json()) as {
      orderId: string;
      paymentId: string;
      amount: number;
      backendPaymentId?: string;
    };
    const payment = await captureFeePayment(request, studentCtx(auth), {
      orderId: String(body.orderId),
      paymentId: String(body.paymentId ?? `pay_${Date.now()}`),
      amount: Number(body.amount),
      backendPaymentId: body.backendPaymentId,
    });
    return studentJson(auth, { payment });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Payment failed" }, { status: 400 });
  }
}
