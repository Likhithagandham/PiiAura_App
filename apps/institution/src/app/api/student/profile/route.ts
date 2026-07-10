import type { ChangeStudentPasswordInput, UpdateStudentProfileInput } from "@eduos/types";
import {
  changeStudentPassword,
  getProfileForm,
  updateProfileForm,
} from "@/lib/services/student-server";
import { NextResponse } from "next/server";
import { requireStudent, studentJson } from "@/lib/student/api";

function ctxOf(auth: {
  subdomain: string;
  studentUserId: string;
  rollNumber: string | null;
  studentName: string;
}) {
  return {
    subdomain: auth.subdomain,
    userId: auth.studentUserId,
    rollNumber: auth.rollNumber,
    studentName: auth.studentName,
  };
}

export async function GET(request: Request) {
  const auth = await requireStudent(request);
  if (!auth.ok) return auth.response;
  try {
    return studentJson(auth, await getProfileForm(request, ctxOf(auth)));
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to load." },
      { status: 400 },
    );
  }
}

export async function PATCH(request: Request) {
  const auth = await requireStudent(request);
  if (!auth.ok) return auth.response;
  try {
    const body = (await request.json()) as UpdateStudentProfileInput;
    return studentJson(auth, await updateProfileForm(request, ctxOf(auth), body));
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Update failed" },
      { status: 400 },
    );
  }
}

export async function POST(request: Request) {
  const auth = await requireStudent(request);
  if (!auth.ok) return auth.response;
  try {
    const body = (await request.json()) as ChangeStudentPasswordInput;
    return studentJson(auth, await changeStudentPassword(request, ctxOf(auth), body));
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Password change failed" },
      { status: 400 },
    );
  }
}
