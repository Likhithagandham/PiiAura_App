import { bridge } from "@/lib/services/route-bridge";
import type { UpdateNotificationChannelsInput } from "@eduos/types";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/api";

export async function GET(request: Request) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.response;
  return NextResponse.json(
    await bridge(request, { path: "/api/v1/admin/notifications/preferences/" }),
  );
}

export async function PATCH(request: Request) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.response;
  const body = (await request.json()) as { channels?: UpdateNotificationChannelsInput };
  try {
    return NextResponse.json(
      await bridge(request, {
        path: "/api/v1/admin/notifications/preferences/",
        method: "PATCH",
        body: { channels: body.channels },
      }),
    );
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Request failed" },
      { status: 400 },
    );
  }
}
