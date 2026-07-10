import { NextResponse } from "next/server";
import { AuthError } from "@/lib/services/auth-server";
import { getAccessTokenFromRequest, setAuthCookies } from "@/lib/auth/cookies";
import * as authServer from "@/lib/services/auth-server";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      targetUserId?: string;
      password?: string;
    };

    if (!body.targetUserId || !body.password) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const accessToken = getAccessTokenFromRequest(request);
    if (!accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await authServer.switchLinkedAccount({
      accessToken,
      targetUserId: body.targetUserId,
      password: body.password,
    });

    const response = NextResponse.json({ user: result.user });
    setAuthCookies(response, result.tokens, result.user.institution_type);
    return response;
  } catch (err) {
    const message =
      err instanceof AuthError ? err.message : "Could not switch account";
    const status = err instanceof AuthError ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
