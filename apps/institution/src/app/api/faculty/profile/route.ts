import type { ChangeStudentPasswordInput, UpdateFacultyProfileInput } from "@eduos/types";
import {
  changeFacultyPassword,
  getProfileForm,
  updateProfileForm,
} from "@/lib/services/faculty-server";
import { NextResponse } from "next/server";
import { facultyJsonResponse, requireFaculty } from "@/lib/faculty/api";

function ctxOf(auth: { subdomain: string; facultyUserId: string; facultyName: string }) {
  return {
    subdomain: auth.subdomain,
    facultyUserId: auth.facultyUserId,
    facultyName: auth.facultyName,
  };
}

export async function GET(request: Request) {
  const auth = await requireFaculty(request);
  if (!auth.ok) return auth.response;
  try {
    const data = await getProfileForm(request, ctxOf(auth));
    return facultyJsonResponse(data, auth.session);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to load." },
      { status: 400 },
    );
  }
}

export async function PATCH(request: Request) {
  const auth = await requireFaculty(request);
  if (!auth.ok) return auth.response;
  try {
    const body = (await request.json()) as UpdateFacultyProfileInput;
    const data = await updateProfileForm(request, ctxOf(auth), body);
    return facultyJsonResponse(data, auth.session);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Update failed" },
      { status: 400 },
    );
  }
}

export async function POST(request: Request) {
  const auth = await requireFaculty(request);
  if (!auth.ok) return auth.response;
  try {
    const body = (await request.json()) as ChangeStudentPasswordInput;
    const data = await changeFacultyPassword(request, ctxOf(auth), body);
    return facultyJsonResponse(data, auth.session);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Password change failed" },
      { status: 400 },
    );
  }
}
