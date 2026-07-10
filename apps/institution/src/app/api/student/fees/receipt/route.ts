import { NextResponse } from "next/server";
import { djangoGet } from "@/lib/services/django-client";
import { applyStudentSessionCookies, requireStudent } from "@/lib/student/api";

export async function GET(request: Request) {
  const auth = await requireStudent(request);
  if (!auth.ok) return auth.response;

  const paymentId = new URL(request.url).searchParams.get("paymentId");
  if (!paymentId) return NextResponse.json({ error: "paymentId required" }, { status: 400 });

  const receipt = await djangoGet<{ content: string; receiptNo: string }>(
    request,
    `/api/v1/fees/me/receipts/?paymentId=${encodeURIComponent(paymentId)}`,
  );

  if (!receipt) return NextResponse.json({ error: "Payment not found" }, { status: 404 });

  return applyStudentSessionCookies(
    new NextResponse(receipt.content, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="receipt-${receipt.receiptNo}.pdf"`,
      },
    }),
    auth,
  );
}
