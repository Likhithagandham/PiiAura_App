import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/api";
import { DjangoApiError } from "@/lib/services/django-client";
import { bulkDeleteImages, moveImages } from "@/lib/services/gallery-server";

export async function POST(request: Request) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.response;
  const body = await request.json();
  const url = new URL(request.url);
  try {
    if (url.pathname.endsWith("/move")) {
      return NextResponse.json(
        await moveImages(request, body.sourceAlbumId, body.targetAlbumId, body.imageIds ?? []),
      );
    }
    return NextResponse.json(
      await bulkDeleteImages(request, body.albumId, body.imageIds ?? []),
    );
  } catch (err) {
    const message = err instanceof DjangoApiError ? err.message : "Operation failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
