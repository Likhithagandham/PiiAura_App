import { NextResponse } from "next/server";
import { requireStudent, studentJson } from "@/lib/student/api";
import { getSessions, revokeSession } from "@/lib/services/student-server";

export class AuthError extends Error {
  constructor(msg?: string) {
    super(msg ?? "Authentication error");
    this.name = "AuthError";
  }
}

export async function GET(request: Request) {
  const auth = await requireStudent(request);
  if (!auth.ok) return auth.response;
  return studentJson(auth, await getSessions(request, auth.studentUserId, auth.accessToken));
}

export async function DELETE(request: Request) {
  const auth = await requireStudent(request);
  if (!auth.ok) return auth.response;
  try {
    const body = (await request.json()) as { sessionId: string };
    await revokeSession(request, auth.studentUserId, auth.accessToken, String(body.sessionId));
    return studentJson(auth, { success: true });
  } catch (err) {
    const msg = err instanceof AuthError ? err.message : err instanceof Error ? err.message : "Revoke failed";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
