import { getNotes } from "@/lib/services/faculty-server";
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
  return NextResponse.json(await getNotes(request, ctx));
}

