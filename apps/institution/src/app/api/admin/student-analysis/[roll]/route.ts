import { NextResponse } from "next/server";
import { djangoGet, DjangoApiError } from "@/lib/services/django-client";
import { requireAdmin } from "@/lib/admin/api";
import type { StudentAnalysisReport } from "@eduos/types";

export async function GET(
  request: Request,
  context: { params: Promise<{ roll: string }> },
) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.response;

  const { roll } = await context.params;
  const rollNumber = decodeURIComponent(roll).trim();
  if (!rollNumber) {
    return NextResponse.json({ error: "Roll number is required." }, { status: 400 });
  }

  try {
    const report = await djangoGet<StudentAnalysisReport>(
      request,
      `/api/student-analysis/${encodeURIComponent(rollNumber)}/`,
    );
    return NextResponse.json(report);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to load student analysis";
    const status = err instanceof DjangoApiError ? err.status : 502;
    return NextResponse.json({ error: message }, { status });
  }
}
