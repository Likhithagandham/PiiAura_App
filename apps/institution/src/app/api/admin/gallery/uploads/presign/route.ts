import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/api";
import { DjangoApiError } from "@/lib/services/django-client";
import { confirmUpload, presignUploads } from "@/lib/services/gallery-server";

export async function POST(request: Request) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.response;
  const url = new URL(request.url);
  try {
    if (url.pathname.endsWith("/confirm")) {
      const body = await request.json();
      return NextResponse.json(await confirmUpload(request, body.albumId, body.imageId));
    }
    const body = await request.json();
    return NextResponse.json(await presignUploads(request, body.albumId, body.files ?? []));
  } catch (err) {
    const message = err instanceof DjangoApiError ? err.message : "Upload request failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
