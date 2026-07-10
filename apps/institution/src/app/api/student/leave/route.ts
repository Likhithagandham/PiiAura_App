import type { StudentApplyLeaveInput } from "@eduos/types";
import { NextResponse } from "next/server";
import { requireStudent, studentJson, type StudentAuthOk } from "@/lib/student/api";
import { applyLeave, getLeave } from "@/lib/services/student-server";

const ctxOf = (auth: StudentAuthOk) => ({
  subdomain: auth.subdomain,
  userId: auth.studentUserId,
  rollNumber: auth.rollNumber,
  studentName: auth.studentName,
});

export async function GET(request: Request) {
  const auth = await requireStudent(request);
  if (!auth.ok) return auth.response;
  return studentJson(auth, await getLeave(request, ctxOf(auth)));
}

export async function POST(request: Request) {
  const auth = await requireStudent(request);
  if (!auth.ok) return auth.response;
  const body = (await request.json()) as StudentApplyLeaveInput;
  try {
    return studentJson(auth, await applyLeave(request, ctxOf(auth), body));
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Request failed" },
      { status: 400 },
    );
  }
}
