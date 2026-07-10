import { djangoGet } from "@/lib/services/django-client";
import { requireStudent, studentJson } from "@/lib/student/api";
import { withCache } from "@/lib/api/cache";

export async function GET(request: Request) {
  const auth = await requireStudent(request);
  if (!auth.ok) return auth.response;
  return withCache(studentJson(auth, await djangoGet(request, "/api/v1/academics/me/timetable/")), 300);
}
