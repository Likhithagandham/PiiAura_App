import { NextResponse } from "next/server";
import type { UpdateAlbumInput } from "@eduos/types";
import { requireAdmin } from "@/lib/admin/api";
import { DjangoApiError } from "@/lib/services/django-client";
import { deleteAlbum, getAlbum, updateAlbum } from "@/lib/services/gallery-server";

type Params = { params: Promise<{ id: string }> };

export async function GET(request: Request, { params }: Params) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.response;
  const { id } = await params;
  const page = Number(new URL(request.url).searchParams.get("page") ?? 1);
  try {
    return NextResponse.json(await getAlbum(request, id, page));
  } catch (err) {
    const message = err instanceof DjangoApiError ? err.message : "Album not found";
    return NextResponse.json({ error: message }, { status: 404 });
  }
}

export async function PATCH(request: Request, { params }: Params) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.response;
  const { id } = await params;
  const body = (await request.json()) as UpdateAlbumInput;
  try {
    return NextResponse.json(await updateAlbum(request, id, body));
  } catch (err) {
    const message = err instanceof DjangoApiError ? err.message : "Update failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(request: Request, { params }: Params) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.response;
  const { id } = await params;
  try {
    await deleteAlbum(request, id);
    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof DjangoApiError ? err.message : "Delete failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
