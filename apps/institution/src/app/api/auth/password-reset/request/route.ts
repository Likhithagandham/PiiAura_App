import { NextResponse } from "next/server";
import { AuthError } from "@/lib/services/auth-server";
import * as authServer from "@/lib/services/auth-server";
import { getTenantSubdomainFromRequest } from "@/lib/tenant";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { phone?: string };
    const phone = body.phone?.trim();
    if (!phone) {
      return NextResponse.json({ error: "Phone is required" }, { status: 400 });
    }

    const subdomain = getTenantSubdomainFromRequest(request);
    const result = await authServer.requestPasswordReset(phone, subdomain);
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof AuthError ? err.message : "Request failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
