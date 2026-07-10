import type { CreateHolidayInput } from "@eduos/types";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/api";
import {
  createHoliday,
  deleteHoliday,
  getHolidaysView,
} from "@/lib/services/academics.service";

export async function GET(request: Request) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.response;
  return NextResponse.json(await getHolidaysView(request, auth.subdomain));
}

export async function POST(request: Request) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.response;

  const body = (await request.json()) as CreateHolidayInput;
  if (!body.name?.trim() || !body.date) {
    return NextResponse.json({ error: "Name and date are required" }, { status: 400 });
  }

  const holiday = await createHoliday(request, auth.subdomain, {
    name: body.name.trim(),
    date: body.date,
    scope: body.scope ?? "institution",
    classIds: body.classIds,
  });

  return NextResponse.json(holiday);
}

export async function DELETE(request: Request) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.response;

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Missing holiday id" }, { status: 400 });
  }

  const ok = await deleteHoliday(request, auth.subdomain, id);
  if (!ok) {
    return NextResponse.json({ error: "Holiday not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
