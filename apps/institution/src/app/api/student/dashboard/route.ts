import { requireStudent, studentJson } from "@/lib/student/api";
import { getDashboard } from "@/lib/services/student-server";
import { withCache } from "@/lib/api/cache";

export async function GET(request: Request) {
  const auth = await requireStudent(request);
  if (!auth.ok) return auth.response;
  return withCache(
    studentJson(
      auth,
      await getDashboard(request, {
        subdomain: auth.subdomain,
        userId: auth.studentUserId,
        rollNumber: auth.rollNumber,
        studentName: auth.studentName,
      }),
    ),
    60,
  );
}
