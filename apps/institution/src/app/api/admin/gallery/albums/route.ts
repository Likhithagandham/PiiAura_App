import { NextResponse } from "next/server";
import type { CreateAlbumInput, GalleryFilters, UpdateAlbumInput } from "@eduos/types";
import { requireAdmin } from "@/lib/admin/api";
import { DjangoApiError } from "@/lib/services/django-client";
import {
  bulkDeleteImages,
  createAlbum,
  deleteAlbum,
  getAlbum,
  listAlbums,
  moveImages,
  reorderAlbumImages,
  setAlbumCover,
  updateAlbum,
} from "@/lib/services/gallery-server";

function filtersFromUrl(url: URL): GalleryFilters {
  return {
    q: url.searchParams.get("q") ?? undefined,
    batchId: url.searchParams.get("batchId") ?? undefined,
    academicYearId: url.searchParams.get("academicYearId") ?? undefined,
    eventTag: url.searchParams.get("eventTag") ?? undefined,
    dateFrom: url.searchParams.get("dateFrom") ?? undefined,
    dateTo: url.searchParams.get("dateTo") ?? undefined,
    schoolOnly: url.searchParams.get("schoolOnly") === "true",
    page: Number(url.searchParams.get("page") ?? 1),
    pageSize: Number(url.searchParams.get("pageSize") ?? 24),
  };
}

export async function GET(request: Request) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.response;
  try {
    return NextResponse.json(await listAlbums(request, filtersFromUrl(new URL(request.url))));
  } catch (err) {
    const message = err instanceof DjangoApiError ? err.message : "Failed to load albums";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.response;
  const body = (await request.json().catch(() => null)) as CreateAlbumInput | null;
  if (!body?.title?.trim()) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }
  try {
    return NextResponse.json(await createAlbum(request, body), { status: 201 });
  } catch (err) {
    const message = err instanceof DjangoApiError ? err.message : "Could not create album";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
