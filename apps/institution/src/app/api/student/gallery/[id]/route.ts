import { NextResponse } from "next/server";
import { getReaderAlbum } from "@/lib/services/gallery-server";
import { DjangoApiError } from "@/lib/services/django-client";
import { requireStudent, studentJson } from "@/lib/student/api";

type Params = { params: Promise<{ id: string }> };

export async function GET(request: Request, { params }: Params) {
  const auth = await requireStudent(request);
  if (!auth.ok) return auth.response;
  const { id } = await params;
  const page = Number(new URL(request.url).searchParams.get("page") ?? 1);
  try {
    return studentJson(auth, await getReaderAlbum(request, id, page));
  } catch (err) {
    const message = err instanceof DjangoApiError ? err.message : "Album not found";
    return NextResponse.json({ error: message }, { status: 404 });
  }
}
