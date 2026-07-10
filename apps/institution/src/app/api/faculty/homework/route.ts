import { getHomework, saveHomework } from "@/lib/services/faculty-server";
import type { FacultySaveHomeworkInput } from "@eduos/types";
import { NextResponse } from "next/server";
import { requireFaculty } from "@/lib/faculty/api";

export async function GET(request: Request) {
  const auth = await requireFaculty(request);
  if (!auth.ok) return auth.response;
  const viewScope =
    new URL(request.url).searchParams.get("viewScope") === "college" ? "college" : "school";
  const ctx = {
    subdomain: auth.subdomain,
    facultyUserId: auth.facultyUserId,
    facultyName: auth.facultyName,
  };
  return NextResponse.json(await getHomework(request, ctx, viewScope));
}

export async function POST(request: Request) {
  const auth = await requireFaculty(request);
  if (!auth.ok) return auth.response;
  const body = (await request.json()) as FacultySaveHomeworkInput & {
    viewScope?: "school" | "college";
  };
  const ctx = {
    subdomain: auth.subdomain,
    facultyUserId: auth.facultyUserId,
    facultyName: auth.facultyName,
  };
  try {
    const entry = await saveHomework(request, ctx, body);
    return NextResponse.json({ success: true, entry });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : "Request failed" },
      { status: 400 },
    );
  }
}
