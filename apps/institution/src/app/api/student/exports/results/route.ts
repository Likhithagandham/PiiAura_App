import { NextResponse } from "next/server";
import { djangoSend } from "@/lib/services/django-client";
import { requireStudent, studentJson } from "@/lib/student/api";

export async function POST(request: Request) {
  const auth = await requireStudent(request);
  if (!auth.ok) return auth.response;

  try {
    const data = await djangoSend<{ report: unknown }>(
      request,
      "/api/v1/examinations/me/exports/results/",
      "POST",
      {},
    );
    return studentJson(auth, data);
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Export failed" }, { status: 400 });
  }
}
