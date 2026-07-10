import { NextResponse } from "next/server";
import { djangoSend } from "@/lib/services/django-client";
import { requireFaculty, facultyJsonResponse } from "@/lib/faculty/api";

export async function POST(request: Request) {
  const auth = await requireFaculty(request);
  if (!auth.ok) return auth.response;

  const body = (await request.json().catch(() => ({}))) as { examId?: string };
  try {
    const data = await djangoSend<{ report: unknown }>(
      request,
      "/api/v1/examinations/me/exports/class-results/",
      "POST",
      { examId: body.examId },
    );
    return facultyJsonResponse(data, auth.session);
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Export failed" }, { status: 400 });
  }
}
