import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/api";
import { DjangoApiError } from "@/lib/services/django-client";
import { reorderAlbumImages, setAlbumCover } from "@/lib/services/gallery-server";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.response;
  const { id } = await params;
  const body = await request.json();
  try {
    if (new URL(request.url).pathname.endsWith("/cover")) {
      const album = await setAlbumCover(request, id, body.imageId);
      return NextResponse.json(album);
    }
    await reorderAlbumImages(request, id, body.imageIds ?? []);
    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof DjangoApiError ? err.message : "Request failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
