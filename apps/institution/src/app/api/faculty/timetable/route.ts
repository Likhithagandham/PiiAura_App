import type { FacultyTimetableData } from "@eduos/types";
import { facultyApiGet, facultyJsonResponse } from "@/lib/faculty/api";
import { withCache } from "@/lib/api/cache";

function parseParams(url: URL) {
  const year = url.searchParams.get("year");
  const month = url.searchParams.get("month");
  const date = url.searchParams.get("date") ?? undefined;
  return {
    year: year ? Number(year) : undefined,
    month: month ? Number(month) : undefined,
    date,
  };
}

export async function GET(request: Request) {
  const params = parseParams(new URL(request.url));

  const qs = new URLSearchParams();
  if (params.year != null) qs.set("year", String(params.year));
  if (params.month != null) qs.set("month", String(params.month));
  if (params.date) qs.set("date", params.date);
  const path = `/academics/faculty/timetable/${qs.toString() ? `?${qs.toString()}` : ""}`;

  const result = await facultyApiGet<FacultyTimetableData>(request, path);
  if (!result.ok) return result.response;
  return withCache(facultyJsonResponse(result.data, result.session, result.rotatedTokens), 300);
}
