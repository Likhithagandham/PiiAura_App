import type { StudentSubmitAssignmentInput } from "@eduos/types";
import { NextResponse } from "next/server";
import { requireStudent, studentJson } from "@/lib/student/api";
import { getAssignments } from "@/lib/services/student-server";
import { bridge } from "@/lib/services/route-bridge";

export async function GET(request: Request) {
  const auth = await requireStudent(request);
  if (!auth.ok) return auth.response;
  return studentJson(
    auth,
    await getAssignments(request, {
      subdomain: auth.subdomain,
      userId: auth.studentUserId,
      rollNumber: auth.rollNumber,
      studentName: auth.studentName,
    }),
  );
}

export async function POST(request: Request) {
  const auth = await requireStudent(request);
  if (!auth.ok) return auth.response;
  const body = (await request.json()) as StudentSubmitAssignmentInput;
  try {
    const result = await bridge(request, {
      path: "/api/v1/examinations/me/assignments/submit/",
      method: "POST",
      body,
    });
    return studentJson(auth, result);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Request failed" },
      { status: 400 },
    );
  }
}
