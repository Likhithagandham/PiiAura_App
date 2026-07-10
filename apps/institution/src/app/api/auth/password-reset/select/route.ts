import { NextResponse } from "next/server";
import { AuthError } from "@/lib/services/auth-server";
import * as authServer from "@/lib/services/auth-server";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      selectionToken?: string;
      userId?: string;
    };
    if (!body.selectionToken || !body.userId) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }
    const result = await authServer.selectAccountForReset(
      body.selectionToken,
      body.userId,
    );
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof AuthError ? err.message : "Request failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
