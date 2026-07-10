import { djangoGet } from "@/lib/services/django-client";
import { requireStudent, studentJson } from "@/lib/student/api";

export async function GET(request: Request) {
  const auth = await requireStudent(request);
  if (!auth.ok) return auth.response;
  return studentJson(
    auth,
    await djangoGet(request, "/api/v1/communications/announcements/me/unread-count/"),
  );
}
