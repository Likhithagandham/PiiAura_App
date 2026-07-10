import { NextResponse } from "next/server";
import { listReaderAlbums } from "@/lib/services/gallery-server";
import { DjangoApiError } from "@/lib/services/django-client";
import { requireStudent, studentJson } from "@/lib/student/api";

export async function GET(request: Request) {
  const auth = await requireStudent(request);
  if (!auth.ok) return auth.response;
  const page = Number(new URL(request.url).searchParams.get("page") ?? 1);
  try {
    return studentJson(auth, await listReaderAlbums(request, page));
  } catch (err) {
    const message = err instanceof DjangoApiError ? err.message : "Failed to load gallery";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
