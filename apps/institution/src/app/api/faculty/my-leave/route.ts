import type { FacultyApplyLeaveInput } from "@eduos/types";
import { NextResponse } from "next/server";
import { requireFaculty } from "@/lib/faculty/api";
import { applyMyLeave, getMyLeave } from "@/lib/services/faculty-server";

const ctxOf = (auth: { subdomain: string; facultyUserId: string; facultyName?: string }) => ({
  subdomain: auth.subdomain,
  facultyUserId: auth.facultyUserId,
  facultyName: auth.facultyName,
});

export async function GET(request: Request) {
  const auth = await requireFaculty(request);
  if (!auth.ok) return auth.response;
  return NextResponse.json(await getMyLeave(request, ctxOf(auth)));
}

export async function POST(request: Request) {
  const auth = await requireFaculty(request);
  if (!auth.ok) return auth.response;
  const body = (await request.json()) as FacultyApplyLeaveInput;
  try {
    return NextResponse.json(await applyMyLeave(request, ctxOf(auth), body));
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Request failed" },
      { status: 400 },
    );
  }
}
