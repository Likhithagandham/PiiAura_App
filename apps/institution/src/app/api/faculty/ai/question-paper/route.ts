import { bridge } from "@/lib/services/route-bridge";
import type {
  GenerateAiQuestionPaperRequest,
  GenerateAiQuestionPaperResponse,
  UpdateAiQuestionPaperRequest,
} from "@eduos/types";
import { NextResponse } from "next/server";
import { requireFaculty } from "@/lib/faculty/api";

/**
 * POST — generate question paper
 * Body: GenerateAiQuestionPaperRequest
 * Response: GenerateAiQuestionPaperResponse & { draftId }
 *
 * PATCH — update draft
 * Body: UpdateAiQuestionPaperRequest
 *
 * POST ?action=export — export PDF
 * Body: { draftId: string }
 */
export async function POST(request: Request) {
  const auth = await requireFaculty(request);
  if (!auth.ok) return auth.response;

  const body = (await request.json()) as GenerateAiQuestionPaperRequest & {
    action?: string;
    draftId?: string;
  };

  try {
    if (body.action === "export" && body.draftId) {
      const result = await bridge(request, {
        path: `/api/v1/faculty/ai/question-paper/${body.draftId}/export/`,
        method: "POST",
      });
      return NextResponse.json(result);
    }

    const { action: _a, draftId: _d, ...req } = body;
    const result = await bridge<GenerateAiQuestionPaperResponse & { draftId: string }>(request, {
      path: "/api/v1/faculty/ai/question-paper/generate/",
      method: "POST",
      body: req,
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
  const body = (await request.json()) as UpdateAiQuestionPaperRequest;
  try {
    const draft = await bridge(request, {
      path: "/api/v1/faculty/ai/question-paper/update/",
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
