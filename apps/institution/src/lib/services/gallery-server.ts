/**
 * Gallery — Django backend boundary with direct R2 upload support.
 */

import type {
  CreateAlbumInput,
  GalleryAlbum,
  GalleryAlbumDetail,
  GalleryAlbumListResponse,
  GalleryFilters,
  GalleryImage,
  PresignFileSpec,
  PresignUploadResponse,
  UpdateAlbumInput,
} from "@eduos/types";
import { getAccessTokenFromRequest } from "@/lib/auth/cookies";
import { getApiBaseUrl } from "@/lib/config";
import { djangoGet, djangoSend } from "./django-client";

function qs(filters?: GalleryFilters): string {
  if (!filters) return "";
  const p = new URLSearchParams();
  if (filters.q) p.set("q", filters.q);
  if (filters.batchId) p.set("batchId", filters.batchId);
  if (filters.academicYearId) p.set("academicYearId", filters.academicYearId);
  if (filters.eventTag) p.set("eventTag", filters.eventTag);
  if (filters.dateFrom) p.set("dateFrom", filters.dateFrom);
  if (filters.dateTo) p.set("dateTo", filters.dateTo);
  if (filters.schoolOnly) p.set("schoolOnly", "true");
  if (filters.page) p.set("page", String(filters.page));
  if (filters.pageSize) p.set("pageSize", String(filters.pageSize));
  const s = p.toString();
  return s ? `?${s}` : "";
}

export async function listAlbums(request: Request, filters?: GalleryFilters): Promise<GalleryAlbumListResponse> {
  return djangoGet(request, `/api/v1/gallery/albums/${qs(filters)}`.replace(/\/\?/, "?"));
}

export async function createAlbum(request: Request, input: CreateAlbumInput): Promise<GalleryAlbum> {
  return djangoSend(request, "/api/v1/gallery/albums/", "POST", input);
}

export async function getAlbum(request: Request, albumId: string, page = 1): Promise<GalleryAlbumDetail> {
  return djangoGet(request, `/api/v1/gallery/albums/${albumId}/?page=${page}&pageSize=48`);
}

export async function updateAlbum(request: Request, albumId: string, input: UpdateAlbumInput): Promise<GalleryAlbum> {
  return djangoSend(request, `/api/v1/gallery/albums/${albumId}/`, "PATCH", input);
}

export async function deleteAlbum(request: Request, albumId: string): Promise<void> {
  await djangoSend(request, `/api/v1/gallery/albums/${albumId}/`, "DELETE");
}

export async function reorderAlbumImages(
  request: Request,
  albumId: string,
  imageIds: string[],
): Promise<void> {
  await djangoSend(request, `/api/v1/gallery/albums/${albumId}/reorder-images/`, "POST", { imageIds });
}

export async function setAlbumCover(request: Request, albumId: string, imageId: string): Promise<GalleryAlbum> {
  return djangoSend(request, `/api/v1/gallery/albums/${albumId}/set-cover/`, "POST", { imageId });
}

export async function presignUploads(
  request: Request,
  albumId: string,
  files: PresignFileSpec[],
): Promise<PresignUploadResponse> {
  return djangoSend(request, "/api/v1/gallery/images/presign/", "POST", { albumId, files });
}

export async function confirmUpload(
  request: Request,
  albumId: string,
  imageId: string,
): Promise<GalleryImage> {
  return djangoSend(request, "/api/v1/gallery/images/confirm/", "POST", { albumId, imageId });
}

export async function getImageStatus(
  request: Request,
  albumId: string,
  imageId: string,
): Promise<GalleryImage> {
  return djangoGet(request, `/api/v1/gallery/images/${imageId}/status/?albumId=${encodeURIComponent(albumId)}`);
}

export async function retryImageProcessing(
  request: Request,
  albumId: string,
  imageId: string,
): Promise<GalleryImage> {
  return djangoSend(request, `/api/v1/gallery/images/${imageId}/status/`, "POST", { albumId });
}

export async function bulkDeleteImages(
  request: Request,
  albumId: string,
  imageIds: string[],
): Promise<{ deleted: number }> {
  return djangoSend(request, "/api/v1/gallery/images/bulk-delete/", "POST", { albumId, imageIds });
}

export async function moveImages(
  request: Request,
  sourceAlbumId: string,
  targetAlbumId: string,
  imageIds: string[],
): Promise<{ moved: number }> {
  return djangoSend(request, "/api/v1/gallery/images/move/", "POST", {
    sourceAlbumId,
    targetAlbumId,
    imageIds,
  });
}

export async function listReaderAlbums(
  request: Request,
  page = 1,
): Promise<GalleryAlbumListResponse> {
  return djangoGet(request, `/api/v1/gallery/albums/me/?page=${page}&pageSize=24`);
}

export async function getReaderAlbum(
  request: Request,
  albumId: string,
  page = 1,
): Promise<GalleryAlbumDetail> {
  return djangoGet(request, `/api/v1/gallery/albums/me/${albumId}/?page=${page}&pageSize=48`);
}

/** Upload bytes to staging — uses presigned PUT for R2 or BFF proxy for sandbox. */
export async function uploadFileToStaging(
  request: Request,
  opts: {
    albumId: string;
    imageId: string;
    file: File;
    presignedUrl: string;
    onProgress?: (pct: number) => void;
  },
): Promise<void> {
  const { albumId, imageId, file, presignedUrl, onProgress } = opts;
  const isSandbox = presignedUrl.includes("sandbox-s3.local");

  if (isSandbox) {
    const token = getAccessTokenFromRequest(request);
    const form = new FormData();
    form.append("file", file);
    form.append("albumId", albumId);
    const res = await fetch(`${getApiBaseUrl()}/api/v1/gallery/images/${imageId}/staging/`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: form,
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error((body as { message?: string }).message ?? "Staging upload failed");
    }
    onProgress?.(100);
    return;
  }

  await new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", presignedUrl);
    xhr.setRequestHeader("Content-Type", file.type || "application/octet-stream");
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress?.(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () => (xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(new Error("Upload failed")));
    xhr.onerror = () => reject(new Error("Upload failed"));
    xhr.send(file);
  });
}

export async function pollUntilReady(
  request: Request,
  albumId: string,
  imageId: string,
  maxAttempts = 30,
): Promise<GalleryImage> {
  for (let i = 0; i < maxAttempts; i += 1) {
    const image = await getImageStatus(request, albumId, imageId);
    if (image.processingStatus === "ready") return image;
    if (image.processingStatus === "failed") {
      throw new Error(image.processingError ?? "Processing failed");
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error("Processing timed out");
}
