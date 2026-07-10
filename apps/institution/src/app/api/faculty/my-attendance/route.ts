import { djangoGet, djangoSend } from "@/lib/services/django-client";
import { NextResponse } from "next/server";
import { requireFaculty } from "@/lib/faculty/api";

export async function GET(request: Request) {
  const auth = await requireFaculty(request);
  if (!auth.ok) return auth.response;
  return NextResponse.json(await djangoGet(request, "/api/v1/hr/me/attendance/"));
}

export async function POST(request: Request) {
  const auth = await requireFaculty(request);
  if (!auth.ok) return auth.response;
  try {
    return NextResponse.json(await djangoSend(request, "/api/v1/hr/me/attendance/", "POST", {}));
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Check-in failed" },
      { status: 400 },
    );
  }
}
