import type { UpdateNotificationChannelsInput } from "@eduos/types";
import { NextResponse } from "next/server";
import { requireFaculty } from "@/lib/faculty/api";
import {
  getNotificationPreferences,
  updateNotificationPreferences,
} from "@/lib/services/faculty-server";

export async function GET(request: Request) {
  const auth = await requireFaculty(request);
  if (!auth.ok) return auth.response;
  return NextResponse.json(
    await getNotificationPreferences(request, {
      subdomain: auth.subdomain,
      facultyUserId: auth.facultyUserId,
      facultyName: auth.facultyName,
    }),
  );
}

export async function PATCH(request: Request) {
  const auth = await requireFaculty(request);
  if (!auth.ok) return auth.response;
  const body = (await request.json()) as { channels?: UpdateNotificationChannelsInput };
  try {
    return NextResponse.json(
      await updateNotificationPreferences(
        request,
        { subdomain: auth.subdomain, facultyUserId: auth.facultyUserId, facultyName: auth.facultyName },
        body.channels ?? {},
      ),
    );
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Request failed" },
      { status: 400 },
    );
  }
}
