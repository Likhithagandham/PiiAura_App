import type { CreateEnquiryInput } from "@eduos/types";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/api";
import { withIdempotency } from "@/lib/admin/idempotency";
import { createEnquiry } from "@/lib/services/admissions.service";

export async function POST(request: Request) {
  return withIdempotency(request, async () => {
    const auth = await requireAdmin(request);
    if (!auth.ok) return auth.response;
    const body = (await request.json()) as CreateEnquiryInput;
    if (!body.applicantName?.trim() || !body.phone?.trim()) {
      return NextResponse.json({ error: "Name and phone are required" }, { status: 400 });
    }
    const enquiry = await createEnquiry(request, auth.subdomain, body);
    return NextResponse.json(enquiry);
  });
}
