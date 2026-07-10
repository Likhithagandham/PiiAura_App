import {
  getSyllabusProgress,
  updateSyllabusProgress,
} from "@/lib/services/faculty-server";
import type { FacultyUpdateSyllabusInput } from "@eduos/types";
import { NextResponse } from "next/server";
import { requireFaculty } from "@/lib/faculty/api";

export async function GET(request: Request) {
  const auth = await requireFaculty(request);
  if (!auth.ok) return auth.response;
  const ctx = {
    subdomain: auth.subdomain,
    facultyUserId: auth.facultyUserId,
    facultyName: auth.facultyName,
  };
  return NextResponse.json(await getSyllabusProgress(request, ctx));
}

export async function PATCH(request: Request) {
  const auth = await requireFaculty(request);
  if (!auth.ok) return auth.response;
  const body = (await request.json()) as FacultyUpdateSyllabusInput;
  const ctx = {
    subdomain: auth.subdomain,
    facultyUserId: auth.facultyUserId,
    facultyName: auth.facultyName,
  };
  try {
    const subject = await updateSyllabusProgress(request, ctx, body);
    return NextResponse.json({ subject });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Request failed" },
      { status: 400 },
    );
  }
}
