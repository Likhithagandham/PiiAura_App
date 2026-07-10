import type { Announcement, CreateAnnouncementInput } from "@eduos/types";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/api";
import { djangoGet, djangoSend } from "@/lib/services/django-client";

export async function GET(request: Request) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.response;
  return NextResponse.json(
    await djangoGet<{
      announcements: Announcement[];
      options?: Record<string, { value: string; label: string }[]>;
    }>(request, "/api/v1/communications/announcements/"),
  );
}

export async function POST(request: Request) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.response;

  const body = (await request.json()) as CreateAnnouncementInput;
  if (!body.title?.trim() || !body.body?.trim()) {
    return NextResponse.json({ error: "Title and message are required" }, { status: 400 });
  }
  if (!body.channels?.length) {
    return NextResponse.json({ error: "Select at least one delivery channel" }, { status: 400 });
  }

  const payload = {
    title: body.title.trim(),
    body: body.body.trim(),
    targetType: body.targetType ?? "all",
    targetValue: body.targetValue,
    targetLabel: (body as { targetLabel?: string }).targetLabel,
    channels: body.channels,
  };

  const result = await djangoSend<{ announcement: Announcement }>(
    request, "/api/v1/communications/announcements/", "POST", payload,
  );
  return NextResponse.json(result.announcement ?? result);
}
