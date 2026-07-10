/** F-191 / F-192 — backend API contract (req/res) */

export type AiQuestionType = "MCQ" | "Short" | "Long";

/** POST /api/faculty/ai/question-paper */
export interface GenerateAiQuestionPaperRequest {
  subject: string;
  unit: string;
  marks: number;
  difficulty: string;
  questionTypes: AiQuestionType[];
  instructions?: string;
}

export interface AiPaperQuestion {
  type: AiQuestionType;
  question: string;
  marks: number;
}

export interface AiGeneratedPaper {
  title: string;
  questions: AiPaperQuestion[];
}

export interface GenerateAiQuestionPaperResponse {
  success: boolean;
  paper: AiGeneratedPaper;
}

export interface UpdateAiQuestionPaperRequest {
  id: string;
  paper: AiGeneratedPaper;
}

/** POST /api/faculty/ai/quizzes */
export interface GenerateAiQuizRequest {
  subject: string;
  unit: string;
  difficulty: string;
  questionCount?: number;
}

export interface AiQuizMcq {
  question: string;
  options: string[];
  correctAnswer: string;
}

export interface AiGeneratedQuiz {
  title: string;
  questions: AiQuizMcq[];
}

export interface GenerateAiQuizResponse {
  success: boolean;
  quiz: AiGeneratedQuiz;
}

export interface UpdateAiQuizRequest {
  id: string;
  quiz: AiGeneratedQuiz;
  published?: boolean;
}

/** Stored drafts (server-side) */
export interface FacultyQuestionPaperDraft {
  id: string;
  request: GenerateAiQuestionPaperRequest;
  response: GenerateAiQuestionPaperResponse;
  status: "draft" | "exported";
  createdAt: string;
  updatedAt: string;
  createdByUserId: string;
}

export interface FacultyQuizDraft {
  id: string;
  request: GenerateAiQuizRequest;
  response: GenerateAiQuizResponse;
  published: boolean;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  createdByUserId: string;
}

export interface FacultyQuestionPaperDraftsData {
  drafts: FacultyQuestionPaperDraft[];
}

export interface FacultyQuizDraftsData {
  drafts: FacultyQuizDraft[];
}

export interface StudentPracticeQuizSummary {
  id: string;
  title: string;
  subjectName: string;
  topic: string;
  difficulty: string;
  questionCount: number;
  publishedAt: string;
}
