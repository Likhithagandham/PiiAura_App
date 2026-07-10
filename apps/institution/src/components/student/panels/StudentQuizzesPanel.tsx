"use client";

import type { AiGeneratedQuiz, StudentPracticeQuizSummary, StudentQuizAttemptResult } from "@eduos/types";
import { Button, EmptyState } from "@eduos/ui";
import { useState } from "react";
import { useApiData } from "@/lib/queries";

export function StudentQuizzesPanel() {
  const { data: listData, error: queryError } = useApiData<{
    quizzes?: StudentPracticeQuizSummary[];
  }>("/api/student/practice-quizzes");
  const quizzes = listData?.quizzes ?? [];
  const [activeQuizId, setActiveQuizId] = useState<string | null>(null);
  const [quiz, setQuiz] = useState<AiGeneratedQuiz | null>(null);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [result, setResult] = useState<StudentQuizAttemptResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // `error` is set by the quiz-open/submit flow; fall back to the list query error.
  const displayError = error ?? (queryError ? "Failed to load quizzes." : null);

  async function openQuiz(id: string) {
    setError(null);
    setResult(null);
    setAnswers({});
    const res = await fetch(`/api/student/practice-quizzes?id=${encodeURIComponent(id)}`, {
      credentials: "include",
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError((json as { error?: string }).error ?? "Quiz not found");
      return;
    }
    setActiveQuizId(id);
    setQuiz((json as { quiz: AiGeneratedQuiz }).quiz);
  }

  if (displayError)
    return <p className="eduos-admin-message eduos-admin-message--error">{displayError}</p>;

  if (!activeQuizId || !quiz) {
    return (
      <section className="eduos-panel">
        <h2 className="eduos-section-title">Available quizzes</h2>
        {quizzes.length === 0 ? (
          <EmptyState compact title="No quizzes yet" description="Published practice quizzes will appear here." />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginTop: "0.5rem" }}>
            {quizzes.map((q) => (
              <article
                key={q.id}
                className="eduos-panel"
                style={{
                  padding: "0.75rem",
                  display: "flex",
                  justifyContent: "space-between",
                  gap: "0.75rem",
                  flexWrap: "wrap",
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, fontSize: "0.875rem" }}>{q.title}</div>
                  <div style={{ fontSize: "0.75rem", color: "var(--eduos-text-muted)" }}>
                    {q.subjectName} · {q.topic} · {q.difficulty} · {q.questionCount} questions
                  </div>
                </div>
                <Button type="button" className="eduos-admin-btn-sm" onClick={() => openQuiz(q.id)}>
                  Start
                </Button>
              </article>
            ))}
          </div>
        )}
      </section>
    );
  }

  if (result) {
    return (
      <section className="eduos-panel">
        <h2 className="eduos-section-title">{result.title}</h2>
        <p style={{ margin: "0.35rem 0 0.75rem", fontSize: "0.875rem" }}>
          Score: <strong>{result.scorePercent}%</strong> ({result.correctCount}/{result.totalQuestions} correct)
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          {result.feedback.map((f) => {
            const q = quiz.questions[f.questionIndex];
            return (
              <article
                key={f.questionIndex}
                className="eduos-panel"
                style={{
                  padding: "0.65rem",
                  borderColor: f.correct ? "var(--eduos-brand)" : "var(--eduos-danger)",
                }}
              >
                <div style={{ fontWeight: 600, fontSize: "0.8125rem" }}>{q?.question}</div>
                <div
                  style={{
                    fontSize: "0.75rem",
                    marginTop: "0.25rem",
                    color: f.correct ? "var(--eduos-brand)" : "var(--eduos-danger)",
                  }}
                >
                  {f.correct ? "Correct" : `Incorrect — answer: ${f.correctAnswer}`}
                </div>
                <p style={{ margin: "0.35rem 0 0", fontSize: "0.75rem", color: "var(--eduos-text-muted)" }}>
                  {f.explanation}
                </p>
              </article>
            );
          })}
        </div>
        <div className="eduos-portal-toolbar" style={{ marginTop: "0.75rem" }}>
          <Button
            type="button"
            className="eduos-admin-btn-sm"
            onClick={() => {
              setActiveQuizId(null);
              setQuiz(null);
              setResult(null);
            }}
          >
            Back to list
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section className="eduos-panel">
      <h2 className="eduos-section-title">{quiz.title}</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginTop: "0.5rem" }}>
        {quiz.questions.map((q, i) => (
          <fieldset key={i} style={{ border: "none", margin: 0, padding: 0 }}>
            <legend style={{ fontWeight: 600, fontSize: "0.8125rem", marginBottom: "0.35rem" }}>
              {i + 1}. {q.question}
            </legend>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
              {q.options.map((opt) => (
                <label key={opt} style={{ fontSize: "0.8125rem", display: "flex", gap: "0.35rem", alignItems: "center" }}>
                  <input
                    type="radio"
                    name={`q-${i}`}
                    checked={answers[i] === opt}
                    onChange={() => setAnswers((p) => ({ ...p, [i]: opt }))}
                  />
                  {opt}
                </label>
              ))}
            </div>
          </fieldset>
        ))}
      </div>
      <div className="eduos-portal-toolbar" style={{ marginTop: "0.75rem" }}>
        <Button
          type="button"
          className="eduos-admin-btn-sm"
          onClick={async () => {
            setError(null);
            const res = await fetch("/api/student/practice-quizzes", {
              method: "POST",
              credentials: "include",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                quizId: activeQuizId,
                answers: quiz.questions.map((_, questionIndex) => ({
                  questionIndex,
                  selectedAnswer: answers[questionIndex] ?? "",
                })),
              }),
            });
            const json = await res.json().catch(() => ({}));
            if (!res.ok) {
              setError((json as { error?: string }).error ?? "Submit failed");
              return;
            }
            setResult((json as { result: StudentQuizAttemptResult }).result);
          }}
        >
          Submit & review
        </Button>
        <Button
          type="button"
          className="eduos-admin-btn-sm"
          onClick={() => {
            setActiveQuizId(null);
            setQuiz(null);
          }}
        >
          Cancel
        </Button>
      </div>
    </section>
  );
}
