import { NextResponse } from "next/server";
import { requireFaculty } from "@/lib/faculty/api";
import { getAttendance, markAttendance } from "@/lib/services/faculty-server";

export async function GET(request: Request) {
  const auth = await requireFaculty(request);
  if (!auth.ok) return auth.response;
  return NextResponse.json(await getAttendance(request, auth.subdomain));
}

export async function PATCH(request: Request) {
  const auth = await requireFaculty(request);
  if (!auth.ok) return auth.response;
  const body = (await request.json()) as {
    recordId?: string;
    newStatus?: string;
    geo?: { latitude?: number; longitude?: number };
  };
  if (!body.recordId || !body.newStatus) {
    return NextResponse.json({ error: "recordId and newStatus are required" }, { status: 400 });
  }
  const geo =
    body.geo?.latitude != null && body.geo?.longitude != null
      ? { latitude: Number(body.geo.latitude), longitude: Number(body.geo.longitude) }
      : undefined;
  try {
    return NextResponse.json(
      await markAttendance(
        request,
        { subdomain: auth.subdomain, facultyUserId: auth.facultyUserId, facultyName: auth.facultyName },
        { recordId: String(body.recordId), newStatus: String(body.newStatus), geo },
      ),
    );
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Request failed" },
      { status: 400 },
    );
  }
}
