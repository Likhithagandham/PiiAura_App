import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/api";
import { DjangoApiError } from "@/lib/services/django-client";
import { setAlbumCover } from "@/lib/services/gallery-server";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.response;
  const { id } = await params;
  const body = await request.json();
  try {
    return NextResponse.json(await setAlbumCover(request, id, body.imageId));
  } catch (err) {
    const message = err instanceof DjangoApiError ? err.message : "Could not set cover";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
