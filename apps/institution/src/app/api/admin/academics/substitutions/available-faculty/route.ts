import * as academicsServer from "@/lib/services/academics-overview.service";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/api";

export async function GET(request: Request) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.response;

  const { searchParams } = new URL(request.url);
  const timetableSlotId = searchParams.get("timetableSlotId");
  const date = searchParams.get("date");
  if (!timetableSlotId || !date) {
    return NextResponse.json({ error: "timetableSlotId and date are required." }, { status: 400 });
  }

  try {
    const result = await academicsServer.getAvailableSubstituteFaculty(request, auth.subdomain, {
      timetableSlotId,
      date,
    });
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to load available faculty" },
      { status: 500 },
    );
  }
}
