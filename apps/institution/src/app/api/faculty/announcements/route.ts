import { NextResponse } from "next/server";
import { requireFaculty } from "@/lib/faculty/api";
import { getAnnouncements } from "@/lib/services/faculty-server";

export async function GET(request: Request) {
  const auth = await requireFaculty(request);
  if (!auth.ok) return auth.response;
  return NextResponse.json(
    await getAnnouncements(request, {
      subdomain: auth.subdomain,
      facultyUserId: auth.facultyUserId,
      facultyName: auth.facultyName,
    }),
  );
}
