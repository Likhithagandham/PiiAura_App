import { NextResponse } from "next/server";
import { requireStudent, studentJson } from "@/lib/student/api";
import { getElectives } from "@/lib/services/student-server";

export class AuthError extends Error {
  constructor(msg?: string) {
    super(msg ?? "Authentication error");
    this.name = "AuthError";
  }
}

export async function GET(request: Request) {
  const auth = await requireStudent(request);
  if (!auth.ok) return auth.response;

  try {
    const data = await getElectives(request, {
      subdomain: auth.subdomain,
      userId: auth.studentUserId,
      rollNumber: auth.rollNumber,
      studentName: auth.studentName,
    });
    return studentJson(auth, data);
  } catch (err) {
    const msg = err instanceof AuthError ? err.message : "Request failed";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
