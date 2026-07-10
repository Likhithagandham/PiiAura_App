import { NextResponse } from "next/server";
import {
  captureFeePayment,
  createFeePaymentOrder,
  getFees,
  payExamFee,
} from "@/lib/services/parent-server";
import { parentJson, requireChildId, requireParent } from "@/lib/parent/api";

function parentCtx(auth: { subdomain: string; parentUserId: string }) {
  return { subdomain: auth.subdomain, parentUserId: auth.parentUserId };
}

export async function GET(request: Request) {
  const auth = await requireParent(request);
  if (!auth.ok) return auth.response;
  const childId = requireChildId(request);
  if (!childId) return NextResponse.json({ error: "childId is required" }, { status: 400 });

  try {
    return parentJson(auth, await getFees(request, parentCtx(auth), childId));
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Failed" }, { status: 400 });
  }
}

export async function POST(request: Request) {
  const auth = await requireParent(request);
  if (!auth.ok) return auth.response;
  const childId = requireChildId(request);
  if (!childId) return NextResponse.json({ error: "childId is required" }, { status: 400 });

  try {
    const body = (await request.json()) as { amount?: number; invoiceId?: string };
    if (body.invoiceId) {
      const paid = await payExamFee(request, parentCtx(auth), childId, String(body.invoiceId));
      return parentJson(auth, { invoice: paid });
    }
    const fees = await getFees(request, parentCtx(auth), childId);
    const amount = Number(body.amount) > 0 ? Number(body.amount) : fees.ledger.balance;
    if (amount <= 0) {
      return NextResponse.json({ error: "No balance due" }, { status: 400 });
    }
    const order = await createFeePaymentOrder(request, parentCtx(auth), childId, amount);
    return parentJson(auth, { order });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Failed" }, { status: 400 });
  }
}

export async function PATCH(request: Request) {
  const auth = await requireParent(request);
  if (!auth.ok) return auth.response;
  const childId = requireChildId(request);
  if (!childId) return NextResponse.json({ error: "childId is required" }, { status: 400 });

  try {
    const body = (await request.json()) as {
      orderId: string;
      paymentId: string;
      amount: number;
      backendPaymentId?: string;
    };
    const payment = await captureFeePayment(request, parentCtx(auth), childId, {
      orderId: String(body.orderId),
      paymentId: String(body.paymentId ?? `pay_${Date.now()}`),
      amount: Number(body.amount),
      backendPaymentId: body.backendPaymentId,
    });
    return parentJson(auth, { payment });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Failed" }, { status: 400 });
  }
}
