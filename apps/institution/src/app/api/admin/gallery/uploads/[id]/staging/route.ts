import { NextResponse } from "next/server";
import { getAccessTokenFromRequest } from "@/lib/auth/cookies";
import { getApiBaseUrl } from "@/lib/config";
import { requireAdmin } from "@/lib/admin/api";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.response;
  const { id } = await params;
  const incoming = await request.formData();
  const form = new FormData();
  const file = incoming.get("file");
  const albumId = incoming.get("albumId");
  if (file instanceof File) form.append("file", file);
  if (typeof albumId === "string") form.append("albumId", albumId);

  const token = getAccessTokenFromRequest(request);
  const res = await fetch(`${getApiBaseUrl()}/api/v1/gallery/images/${id}/staging/?albumId=${encodeURIComponent(String(albumId ?? ""))}`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: form,
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    return NextResponse.json(
      { error: (json as { message?: string }).message ?? "Staging upload failed" },
      { status: res.status },
    );
  }
  return NextResponse.json(json);
}
