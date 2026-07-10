import { djangoGet } from "@/lib/services/django-client";
import { requireStudent, studentJson } from "@/lib/student/api";
import { withCache } from "@/lib/api/cache";

export async function GET(request: Request) {
  const auth = await requireStudent(request);
  if (!auth.ok) return auth.response;
  // Real endpoint wraps the payload under a "results" key; the UI expects it flat.
  const d = await djangoGet<{ results?: unknown }>(request, "/api/v1/examinations/me/results/");
  return withCache(studentJson(auth, (d as { results?: unknown }).results ?? d), 120);
}
