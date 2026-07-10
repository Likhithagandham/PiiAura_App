import { facultyApiGet, facultyJsonResponse } from "@/lib/faculty/api";
import type { FacultyInvigilationData } from "@eduos/types";

export async function GET(request: Request) {
  const result = await facultyApiGet<FacultyInvigilationData>(
    request,
    "/examinations/me/invigilation/",
  );
  if (!result.ok) return result.response;
  return facultyJsonResponse(result.data, result.session, result.rotatedTokens);
}
