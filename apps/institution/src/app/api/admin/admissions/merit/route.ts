import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/api";
import { getAdmissionsData, getMeritList } from "@/lib/services/admissions.service";

export async function GET(request: Request) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.response;
  const { searchParams } = new URL(request.url);
  const course = searchParams.get("course") ?? "";

  const overview = await getAdmissionsData(request, auth.subdomain);
  const catalog = overview.courseCatalog ?? [];
  const meritList = await getMeritList(request, course, catalog);
  return NextResponse.json({ meritList });
}

export async function POST(request: Request) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.response;

  return NextResponse.json(
    { error: "Merit score generation is not available on the live backend yet." },
    { status: 501 },
  );
}
