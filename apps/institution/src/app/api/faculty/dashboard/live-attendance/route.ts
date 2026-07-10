import { djangoGet } from "@/lib/services/django-client";
import { NextResponse } from "next/server";
import { requireFaculty } from "@/lib/faculty/api";

export async function GET(request: Request) {
  const auth = await requireFaculty(request);
  if (!auth.ok) return auth.response;
  return NextResponse.json(await djangoGet(request, "/api/v1/attendance/faculty/live/"));
}
