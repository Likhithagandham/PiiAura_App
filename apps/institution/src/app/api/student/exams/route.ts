import { djangoGet } from "@/lib/services/django-client";
import { requireStudent, studentJson } from "@/lib/student/api";

export async function GET(request: Request) {
  const auth = await requireStudent(request);
  if (!auth.ok) return auth.response;
  // Real endpoint wraps the hub under a "hub" key; the UI expects it flat.
  const d = await djangoGet<{ hub?: unknown }>(request, "/api/v1/examinations/me/exams/");
  return studentJson(auth, (d as { hub?: unknown }).hub ?? d);
}
