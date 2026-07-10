"use server";

import type {
  GenerateAiQuestionPaperRequest,
  GenerateAiQuestionPaperResponse,
  GenerateAiQuizRequest,
  GenerateAiQuizResponse,
  PdfExportResult,
  UpdateAiQuestionPaperRequest,
  UpdateAiQuizRequest,
} from "@eduos/types";
import { getFacultySession } from "@/lib/faculty/session";

type ActionResult<T> = { ok: true; data: T } | { ok: false; error: string };

async function facultyCtx() {
  const session = await getFacultySession();
  if (!session.ok) return session;
  return {
    ok: true as const,
    subdomain: session.subdomain,
    facultyUserId: session.user.id,
    facultyName: session.user.name,
  };
}

/**
 * Internal helper — calls our own BFF route handlers from a server action.
 * Server actions don't have a `Request` object, so we call the Next.js API
 * routes which in turn call Django.
 */
async function callBff<T>(path: string, method: "POST" | "PATCH", body: unknown): Promise<T> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? ""}${path}`, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Request failed" }));
    throw new Error((err as { error?: string }).error ?? "Request failed");
  }
  return res.json() as Promise<T>;
}

export async function generateQuestionPaperAction(
  body: GenerateAiQuestionPaperRequest,
): Promise<ActionResult<GenerateAiQuestionPaperResponse & { draftId: string }>> {
  const ctx = await facultyCtx();
  if (!ctx.ok) return { ok: false, error: ctx.error };
  try {
    const data = await callBff<GenerateAiQuestionPaperResponse & { draftId: string }>(
      "/api/faculty/ai/question-paper",
      "POST",
      body,
    );
    return { ok: true, data };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Request failed" };
  }
}

export async function updateQuestionPaperAction(
  body: UpdateAiQuestionPaperRequest,
): Promise<ActionResult<{ draftId: string }>> {
  const ctx = await facultyCtx();
  if (!ctx.ok) return { ok: false, error: ctx.error };
  try {
    const result = await callBff<{ draft: { id: string } }>(
      "/api/faculty/ai/question-paper",
      "PATCH",
      body,
    );
    return { ok: true, data: { draftId: result.draft.id } };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Request failed" };
  }
}

export async function exportQuestionPaperAction(draftId: string): Promise<ActionResult<PdfExportResult>> {
  const ctx = await facultyCtx();
  if (!ctx.ok) return { ok: false, error: ctx.error };
  try {
    const data = await callBff<PdfExportResult>(
      "/api/faculty/ai/question-paper",
      "POST",
      { action: "export", draftId },
    );
    return { ok: true, data };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Request failed" };
  }
}

export async function generateQuizAction(
  body: GenerateAiQuizRequest,
): Promise<ActionResult<GenerateAiQuizResponse & { draftId: string }>> {
  const ctx = await facultyCtx();
  if (!ctx.ok) return { ok: false, error: ctx.error };
  try {
    const data = await callBff<GenerateAiQuizResponse & { draftId: string }>(
      "/api/faculty/ai/quizzes",
      "POST",
      body,
    );
    return { ok: true, data };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Request failed" };
  }
}

export async function updateQuizAction(
  body: UpdateAiQuizRequest,
): Promise<ActionResult<{ draftId: string }>> {
  const ctx = await facultyCtx();
  if (!ctx.ok) return { ok: false, error: ctx.error };
  try {
    const result = await callBff<{ draft: { id: string } }>(
      "/api/faculty/ai/quizzes",
      "PATCH",
      body,
    );
    return { ok: true, data: { draftId: result.draft.id } };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Request failed" };
  }
}
