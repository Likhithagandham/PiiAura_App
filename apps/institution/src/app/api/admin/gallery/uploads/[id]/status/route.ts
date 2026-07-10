import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/api";
import { DjangoApiError } from "@/lib/services/django-client";
import { getImageStatus, retryImageProcessing } from "@/lib/services/gallery-server";

type Params = { params: Promise<{ id: string }> };

export async function GET(request: Request, { params }: Params) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.response;
  const { id } = await params;
  const albumId = new URL(request.url).searchParams.get("albumId");
  if (!albumId) return NextResponse.json({ error: "albumId required" }, { status: 400 });
  try {
    return NextResponse.json(await getImageStatus(request, albumId, id));
  } catch (err) {
    const message = err instanceof DjangoApiError ? err.message : "Status unavailable";
    return NextResponse.json({ error: message }, { status: 404 });
  }
}

export async function POST(request: Request, { params }: Params) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.response;
  const { id } = await params;
  const body = await request.json();
  try {
    return NextResponse.json(await retryImageProcessing(request, body.albumId, id));
  } catch (err) {
    const message = err instanceof DjangoApiError ? err.message : "Retry failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
