import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/api";
import { DjangoApiError } from "@/lib/services/django-client";
import { listAlbums } from "@/lib/services/gallery-server";

export async function GET(request: Request) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.response;
  try {
    const data = await listAlbums(request);
    return NextResponse.json({ albums: data.albums, total: data.total });
  } catch (err) {
    const message = err instanceof DjangoApiError ? err.message : "Failed to load gallery";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
