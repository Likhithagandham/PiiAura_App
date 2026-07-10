/**
 * TanStack Query hooks for the gallery module — keys, cached reads, and mutations.
 */

import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryOptions,
} from "@tanstack/react-query";
import type {
  ClassBatchSection,
  CreateAlbumInput,
  GalleryAlbum,
  GalleryAlbumDetail,
  GalleryAlbumListResponse,
  GalleryFilters,
  GalleryImage,
} from "@eduos/types";
import { apiGet, apiSend } from "./api-client";
import { uploadFilesToAlbum } from "./gallery-client";

/** Gallery list/detail changes on upload; keep cached briefly then revalidate. */
const GALLERY_STALE_MS = 2 * 60_000;
const GALLERY_GC_MS = 10 * 60_000;

export const galleryQueryKeys = {
  all: ["gallery"] as const,
  adminClassSections: ["gallery", "admin", "class-sections"] as const,
  adminAlbums: (path: string) => ["gallery", "admin", "albums", path] as const,
  adminAlbum: (albumId: string, page = 1) => ["gallery", "admin", "album", albumId, page] as const,
  studentAlbums: (page = 1) => ["gallery", "student", "albums", page] as const,
  studentAlbum: (albumId: string, page = 1) => ["gallery", "student", "album", albumId, page] as const,
} as const;

export function useAdminGalleryClassSectionsQuery() {
  return useQuery({
    queryKey: galleryQueryKeys.adminClassSections,
    queryFn: () =>
      apiGet<{ classSections: ClassBatchSection[] }>("/api/admin/batches").then(
        (res) => res.classSections ?? [],
      ),
    staleTime: 5 * 60_000,
  });
}

export function adminGalleryAlbumsPath(filters?: GalleryFilters): string {
  const p = new URLSearchParams();
  if (filters?.q) p.set("q", filters.q);
  if (filters?.batchId) p.set("batchId", filters.batchId);
  if (filters?.academicYearId) p.set("academicYearId", filters.academicYearId);
  if (filters?.eventTag) p.set("eventTag", filters.eventTag);
  if (filters?.dateFrom) p.set("dateFrom", filters.dateFrom);
  if (filters?.dateTo) p.set("dateTo", filters.dateTo);
  if (filters?.schoolOnly) p.set("schoolOnly", "true");
  if (filters?.page) p.set("page", String(filters.page));
  if (filters?.pageSize) p.set("pageSize", String(filters.pageSize));
  const qs = p.toString();
  return `/api/admin/gallery/albums${qs ? `?${qs}` : ""}`;
}

function galleryQueryDefaults<T>(): Partial<UseQueryOptions<T>> {
  return { staleTime: GALLERY_STALE_MS, gcTime: GALLERY_GC_MS };
}

export function useInvalidateGallery() {
  const queryClient = useQueryClient();
  return () =>
    queryClient.invalidateQueries({ queryKey: galleryQueryKeys.all });
}

export function useAdminGalleryAlbumsQuery(filters?: GalleryFilters) {
  const path = adminGalleryAlbumsPath(filters);
  return useQuery({
    queryKey: galleryQueryKeys.adminAlbums(path),
    queryFn: () => apiGet<GalleryAlbumListResponse>(path),
    ...galleryQueryDefaults<GalleryAlbumListResponse>(),
  });
}

export function useAdminGalleryAlbumQuery(albumId: string, page = 1) {
  const path = `/api/admin/gallery/albums/${albumId}?page=${page}&pageSize=48`;
  return useQuery({
    queryKey: galleryQueryKeys.adminAlbum(albumId, page),
    queryFn: () => apiGet<GalleryAlbumDetail>(path),
    enabled: Boolean(albumId),
    ...galleryQueryDefaults<GalleryAlbumDetail>(),
  });
}

export function useStudentGalleryAlbumsQuery(page = 1) {
  const path = `/api/student/gallery?page=${page}`;
  return useQuery({
    queryKey: galleryQueryKeys.studentAlbums(page),
    queryFn: () => apiGet<GalleryAlbumListResponse>(path),
    ...galleryQueryDefaults<GalleryAlbumListResponse>(),
  });
}

export function useStudentGalleryAlbumQuery(albumId: string, page = 1) {
  const path = `/api/student/gallery/${albumId}?page=${page}&pageSize=48`;
  return useQuery({
    queryKey: galleryQueryKeys.studentAlbum(albumId, page),
    queryFn: () => apiGet<GalleryAlbumDetail>(path),
    enabled: Boolean(albumId),
    ...galleryQueryDefaults<GalleryAlbumDetail>(),
  });
}

export function useCreateGalleryAlbumMutation() {
  const invalidate = useInvalidateGallery();
  return useMutation({
    mutationFn: (input: CreateAlbumInput) =>
      apiSend<GalleryAlbum>("/api/admin/gallery/albums", "POST", input),
    onSuccess: () => invalidate(),
  });
}

export function useDeleteGalleryAlbumMutation() {
  const invalidate = useInvalidateGallery();
  return useMutation({
    mutationFn: (albumId: string) =>
      apiSend<{ success: boolean }>(`/api/admin/gallery/albums/${albumId}`, "DELETE"),
    onSuccess: () => invalidate(),
  });
}

export function useBulkDeleteGalleryImagesMutation() {
  const invalidate = useInvalidateGallery();
  return useMutation({
    mutationFn: ({ albumId, imageIds }: { albumId: string; imageIds: string[] }) =>
      apiSend<{ deleted: number }>("/api/admin/gallery/images/bulk-delete", "POST", {
        albumId,
        imageIds,
      }),
    onSuccess: () => invalidate(),
  });
}

export function useSetGalleryCoverMutation() {
  const invalidate = useInvalidateGallery();
  return useMutation({
    mutationFn: ({ albumId, imageId }: { albumId: string; imageId: string }) =>
      apiSend<GalleryAlbum>(`/api/admin/gallery/albums/${albumId}/cover`, "POST", { imageId }),
    onSuccess: () => invalidate(),
  });
}

export function useReorderGalleryImagesMutation() {
  const invalidate = useInvalidateGallery();
  return useMutation({
    mutationFn: ({ albumId, imageIds }: { albumId: string; imageIds: string[] }) =>
      apiSend<{ success: boolean }>(`/api/admin/gallery/albums/${albumId}/reorder`, "POST", {
        imageIds,
      }),
    onSuccess: () => invalidate(),
  });
}

export function useUploadGalleryFilesMutation() {
  const invalidate = useInvalidateGallery();
  return useMutation({
    mutationFn: ({
      albumId,
      files,
      onQueueUpdate,
    }: {
      albumId: string;
      files: File[];
      onQueueUpdate: Parameters<typeof uploadFilesToAlbum>[2];
    }) => uploadFilesToAlbum(albumId, files, onQueueUpdate),
    onSuccess: () => invalidate(),
  });
}

export function useGalleryImageStatusQuery(
  albumId: string,
  imageId: string | null,
  enabled = false,
) {
  return useQuery({
    queryKey: ["gallery", "upload-status", albumId, imageId] as const,
    queryFn: () =>
      apiGet<GalleryImage>(
        `/api/admin/gallery/uploads/${encodeURIComponent(imageId!)}/status?albumId=${encodeURIComponent(albumId)}`,
      ),
    enabled: enabled && Boolean(albumId && imageId),
    refetchInterval: (query) =>
      query.state.data?.processingStatus === "pending" ? 500 : false,
    staleTime: 0,
  });
}
