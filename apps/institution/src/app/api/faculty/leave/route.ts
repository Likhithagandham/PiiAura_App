import type { ReviewLeaveInput } from "@eduos/types";
import { NextResponse } from "next/server";
import { requireFaculty } from "@/lib/faculty/api";
import { getLeave, reviewStudentLeave } from "@/lib/services/faculty-server";

export async function GET(request: Request) {
  const auth = await requireFaculty(request);
  if (!auth.ok) return auth.response;
  return NextResponse.json(await getLeave(request, auth.subdomain));
}

export async function PATCH(request: Request) {
  const auth = await requireFaculty(request);
  if (!auth.ok) return auth.response;
  const body = (await request.json()) as { payload?: ReviewLeaveInput };
  if (!body.payload) return NextResponse.json({ error: "payload is required" }, { status: 400 });
  try {
    return NextResponse.json(
      await reviewStudentLeave(
        request,
        { subdomain: auth.subdomain, facultyUserId: auth.facultyUserId, facultyName: auth.facultyName },
        body.payload,
      ),
    );
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Request failed" },
      { status: 400 },
    );
  }
}
