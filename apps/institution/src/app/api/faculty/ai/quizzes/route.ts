import { bridge } from "@/lib/services/route-bridge";
import type { GenerateAiQuizRequest, GenerateAiQuizResponse, UpdateAiQuizRequest } from "@eduos/types";
import { NextResponse } from "next/server";
import { requireFaculty } from "@/lib/faculty/api";

/**
 * POST — generate quiz
 * Body: GenerateAiQuizRequest
 * Response: GenerateAiQuizResponse & { draftId }
 */
export async function POST(request: Request) {
  const auth = await requireFaculty(request);
  if (!auth.ok) return auth.response;
  const body = (await request.json()) as GenerateAiQuizRequest;
  try {
    const result = await bridge<GenerateAiQuizResponse & { draftId: string }>(request, {
      path: "/api/v1/faculty/ai/quizzes/generate/",
      method: "POST",
      body,
    });
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : "Request failed" },
      { status: 400 },
    );
  }
}

export async function PATCH(request: Request) {
  const auth = await requireFaculty(request);
  if (!auth.ok) return auth.response;
  const body = (await request.json()) as UpdateAiQuizRequest;
  try {
    const draft = await bridge(request, {
      path: "/api/v1/faculty/ai/quizzes/update/",
      method: "PATCH",
      body,
    });
    return NextResponse.json({ success: true, draft });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : "Request failed" },
      { status: 400 },
    );
  }
}
