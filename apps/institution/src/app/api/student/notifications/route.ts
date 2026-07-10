import { NextResponse } from "next/server";
import { requireStudent, studentJson, type StudentAuthOk } from "@/lib/student/api";
import {
  getNotificationPreferences,
  updateNotificationPreferences,
} from "@/lib/services/student-server";

const ctxOf = (auth: StudentAuthOk) => ({
  subdomain: auth.subdomain,
  userId: auth.studentUserId,
  rollNumber: auth.rollNumber,
  studentName: auth.studentName,
});

export async function GET(request: Request) {
  const auth = await requireStudent(request);
  if (!auth.ok) return auth.response;
  return studentJson(auth, await getNotificationPreferences(request, ctxOf(auth)));
}

export async function PATCH(request: Request) {
  const auth = await requireStudent(request);
  if (!auth.ok) return auth.response;
  const body = (await request.json()) as {
    channels?: { in_app?: boolean; sms?: boolean; email?: boolean };
  };
  try {
    return studentJson(
      auth,
      await updateNotificationPreferences(request, ctxOf(auth), body.channels ?? {}),
    );
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Update failed" },
      { status: 400 },
    );
  }
}
