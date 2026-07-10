import type { StudentQuizAnswerInput } from "@eduos/types";
import { NextResponse } from "next/server";
import { requireStudent, studentJson } from "@/lib/student/api";
import {
  listPracticeQuizzes,
  getPracticeQuiz,
  submitPracticeQuiz,
} from "@/lib/services/student-server";

export async function GET(request: Request) {
  const auth = await requireStudent(request);
  if (!auth.ok) return auth.response;

  const { searchParams } = new URL(request.url);
  const quizId = searchParams.get("id");
  if (quizId) {
    const quiz = await getPracticeQuiz(request, auth.subdomain, quizId);
    if (!quiz) return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    return studentJson(auth, { quiz });
  }

  return studentJson(auth, { quizzes: await listPracticeQuizzes(request, auth.subdomain) });
}

export async function POST(request: Request) {
  const auth = await requireStudent(request);
  if (!auth.ok) return auth.response;

  try {
    const body = (await request.json()) as { quizId: string; answers: StudentQuizAnswerInput[] };
    const result = await submitPracticeQuiz(
      request,
      auth.subdomain,
      String(body.quizId ?? ""),
      body.answers ?? [],
    );
    return studentJson(auth, { result });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Submit failed";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
