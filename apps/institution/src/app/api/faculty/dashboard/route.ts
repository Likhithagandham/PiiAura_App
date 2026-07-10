import { requireFaculty } from "@/lib/faculty/api";
import { getDashboard } from "@/lib/services/faculty-server";
import { jsonCached } from "@/lib/api/cache";

export async function GET(request: Request) {
  const auth = await requireFaculty(request);
  if (!auth.ok) return auth.response;
  return jsonCached(
    await getDashboard(request, {
      subdomain: auth.subdomain,
      facultyUserId: auth.facultyUserId,
      facultyName: auth.facultyName,
    }),
    60,
  );
}
