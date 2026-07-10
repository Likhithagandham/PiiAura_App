import { requireStudent, studentJson } from "@/lib/student/api";
import { getMaterials } from "@/lib/services/student-server";

export async function GET(request: Request) {
  const auth = await requireStudent(request);
  if (!auth.ok) return auth.response;
  const data = await getMaterials(request, {
    subdomain: auth.subdomain,
    userId: auth.studentUserId,
    rollNumber: auth.rollNumber,
    studentName: auth.studentName,
  });
  return studentJson(auth, data);
}
