import type { CreateStudentGrievanceInput } from "@eduos/types";
import { NextResponse } from "next/server";
import { requireStudent, studentJson, type StudentAuthOk } from "@/lib/student/api";
import { createGrievance, getGrievances } from "@/lib/services/student-server";

const ctxOf = (auth: StudentAuthOk) => ({
  subdomain: auth.subdomain,
  userId: auth.studentUserId,
  rollNumber: auth.rollNumber,
  studentName: auth.studentName,
});

export async function GET(request: Request) {
  const auth = await requireStudent(request);
  if (!auth.ok) return auth.response;
  return studentJson(auth, await getGrievances(request, ctxOf(auth)));
}

export async function POST(request: Request) {
  const auth = await requireStudent(request);
  if (!auth.ok) return auth.response;
  try {
    const body = (await request.json()) as CreateStudentGrievanceInput;
    if (!body.subject?.trim() || !body.category?.trim()) {
      return NextResponse.json({ error: "Category and subject are required" }, { status: 400 });
    }
    return studentJson(auth, await createGrievance(request, ctxOf(auth), body));
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Could not submit grievance" },
      { status: 400 },
    );
  }
}
