import { NextResponse } from "next/server";
import { AUTH_COOKIE_NAMES } from "@eduos/constants";
import { requireFaculty } from "@/lib/faculty/api";
import { getMarks, saveExamMark, saveInternalMark } from "@/lib/services/faculty-server";

function institutionTypeFromRequest(request: Request): "school" | "college" | null {
  const cookie = request.headers.get("cookie") ?? "";
  const match = cookie.match(new RegExp(`${AUTH_COOKIE_NAMES.institutionType}=([^;]+)`));
  const value = match?.[1];
  return value === "college" ? "college" : value === "school" ? "school" : null;
}

export async function GET(request: Request) {
  const auth = await requireFaculty(request);
  if (!auth.ok) return auth.response;
  return NextResponse.json(
    await getMarks(request, {
      subdomain: auth.subdomain,
      facultyUserId: auth.facultyUserId,
      facultyName: auth.facultyName,
    }),
  );
}

export async function PATCH(request: Request) {
  const auth = await requireFaculty(request);
  if (!auth.ok) return auth.response;
  const body = (await request.json()) as {
    kind?: "internal" | "exam";
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    payload?: any;
  };
  const ctx = {
    subdomain: auth.subdomain,
    facultyUserId: auth.facultyUserId,
    facultyName: auth.facultyName,
  };
  try {
    if (body.kind === "internal" && body.payload) {
      if (institutionTypeFromRequest(request) === "school") {
        return NextResponse.json(
          { error: "Internal marks are not used for schools. Use exam marks instead." },
          { status: 403 },
        );
      }
      return NextResponse.json(await saveInternalMark(request, ctx, body.payload));
    }
    if (body.kind === "exam" && body.payload) {
      return NextResponse.json(await saveExamMark(request, ctx, body.payload));
    }
    return NextResponse.json({ error: "Unknown kind" }, { status: 400 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Request failed" },
      { status: 400 },
    );
  }
}
