import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/api";
import { DjangoApiError } from "@/lib/services/django-client";
import { confirmUpload } from "@/lib/services/gallery-server";

export async function POST(request: Request) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.response;
  const body = await request.json();
  try {
    return NextResponse.json(await confirmUpload(request, body.albumId, body.imageId));
  } catch (err) {
    const message = err instanceof DjangoApiError ? err.message : "Confirm failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
