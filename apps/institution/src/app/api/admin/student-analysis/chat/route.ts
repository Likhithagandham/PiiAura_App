import { NextResponse } from "next/server";
import { djangoGet, DjangoApiError } from "@/lib/services/django-client";
import { requireAdmin } from "@/lib/admin/api";
import {
  extractRollNumber,
  isPerformanceQuery,
} from "@/lib/admin/student-analysis-parse";
import { formatStudentAnalysisReply } from "@/lib/admin/student-analysis-format";
import type { StudentAnalysisChatResponse, StudentAnalysisReport } from "@eduos/types";

export async function POST(request: Request) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.response;

  let message = "";
  try {
    const body = (await request.json()) as { message?: string };
    message = (body.message ?? "").trim();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (!message) {
    return NextResponse.json({ error: "Message is required." }, { status: 400 });
  }

  const rollNumber = extractRollNumber(message);
  if (!rollNumber) {
    const reply: StudentAnalysisChatResponse = {
      reply:
        "Please include a roll or admission number. Example: \"Show performance for STU-001\" or \"roll number STU-001 analysis\".",
    };
    return NextResponse.json(reply);
  }

  if (!isPerformanceQuery(message)) {
    const reply: StudentAnalysisChatResponse = {
      reply: `I found roll number **${rollNumber}**. Ask about performance, marks, or attendance — e.g. "performance analysis for ${rollNumber}".`,
    };
    return NextResponse.json(reply);
  }

  try {
    const report = await djangoGet<StudentAnalysisReport>(
      request,
      `/api/student-analysis/${encodeURIComponent(rollNumber)}/`,
    );
    const reply: StudentAnalysisChatResponse = {
      reply: formatStudentAnalysisReply(report),
      rollNumber,
      report,
    };
    return NextResponse.json(reply);
  } catch (err) {
    if (err instanceof DjangoApiError && err.status === 404) {
      return NextResponse.json({
        reply: `No student found for roll number **${rollNumber}** in this institution. Check the ID and try again.`,
      });
    }
    const message = err instanceof Error ? err.message : "Lookup failed";
    const status = err instanceof DjangoApiError ? err.status : 502;
    return NextResponse.json({ error: message }, { status });
  }
}
