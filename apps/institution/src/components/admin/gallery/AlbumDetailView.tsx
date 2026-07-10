"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { UploadQueueItem } from "@eduos/types";
import { Button, Dropzone, Lightbox, SortableImageGrid, UploadProgressList } from "@eduos/ui";
import { useCallback, useMemo, useState } from "react";
import { AdminShell } from "../AdminShell";
import { AdminMessage } from "../ui";
import {
  useAdminGalleryAlbumQuery,
  useBulkDeleteGalleryImagesMutation,
  useDeleteGalleryAlbumMutation,
  useReorderGalleryImagesMutation,
  useSetGalleryCoverMutation,
  useUploadGalleryFilesMutation,
} from "@/lib/queries";

export function AlbumDetailView({ albumId }: { albumId: string }) {
  const router = useRouter();
  const { data, error: queryError, refetch, isFetching } = useAdminGalleryAlbumQuery(albumId);
  const uploadMutation = useUploadGalleryFilesMutation();
  const bulkDeleteMutation = useBulkDeleteGalleryImagesMutation();
  const setCoverMutation = useSetGalleryCoverMutation();
  const reorderMutation = useReorderGalleryImagesMutation();
  const deleteAlbumMutation = useDeleteGalleryAlbumMutation();

  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [uploadQueue, setUploadQueue] = useState<UploadQueueItem[]>([]);
  const [lightboxId, setLightboxId] = useState<string | null>(null);

  const album = data?.album;
  const images = data?.images ?? [];
  const readyImages = useMemo(
    () => images.filter((i) => i.processingStatus === "ready"),
    [images],
  );

  const lightboxIndex = lightboxId ? readyImages.findIndex((i) => i.id === lightboxId) : -1;
  const lightboxImage = lightboxIndex >= 0 ? readyImages[lightboxIndex] : null;
  const uploading = uploadMutation.isPending;

  const toggleSelect = useCallback((id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  async function handleFiles(files: File[]) {
    if (!album || uploading) return;
    setError(null);
    try {
      await uploadMutation.mutateAsync({
        albumId: album.id,
        files,
        onQueueUpdate: setUploadQueue,
      });
      setMessage(`${files.length} file(s) processed.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    }
  }

  async function bulkDelete() {
    if (!album || selected.size === 0) return;
    if (!confirm(`Delete ${selected.size} photo(s)?`)) return;
    setError(null);
    try {
      await bulkDeleteMutation.mutateAsync({
        albumId: album.id,
        imageIds: [...selected],
      });
      setSelected(new Set());
      setMessage("Photos deleted.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
    }
  }

  async function setCover(imageId: string) {
    if (!album) return;
    setError(null);
    try {
      await setCoverMutation.mutateAsync({ albumId: album.id, imageId });
      setMessage("Cover updated.");
    } catch {
      setError("Could not set cover");
    }
  }

  async function reorder(imageIds: string[]) {
    if (!album) return;
    await reorderMutation.mutateAsync({ albumId: album.id, imageIds });
  }

  async function deleteAlbum() {
    if (!album || !confirm("Delete this album and all photos?")) return;
    setError(null);
    try {
      await deleteAlbumMutation.mutateAsync(album.id);
      router.push("/admin/gallery");
    } catch {
      setError("Could not delete album");
    }
  }

  const displayError = error ?? (queryError ? "Failed to load album" : null);

  return (
    <AdminShell title={album?.title ?? "Album"}>
      <p className="eduos-section-desc">
        <Link href="/admin/gallery">← Back to albums</Link>
        {album ? (
          <>
            {" · "}
            {album.isSchoolAlbum ? "School album" : `Class: ${album.batchName}`}
            {" · "}
            {album.totalImages} photos
          </>
        ) : null}
      </p>

      {message ? <AdminMessage>{message}</AdminMessage> : null}
      {displayError ? <AdminMessage variant="error">{displayError}</AdminMessage> : null}

      <Dropzone disabled={uploading || !album} onFiles={handleFiles} />
      <UploadProgressList items={uploadQueue} />

      {selected.size > 0 ? (
        <div style={{ display: "flex", gap: "0.5rem", margin: "1rem 0", flexWrap: "wrap" }}>
          <Button
            type="button"
            variant="secondary"
            onClick={bulkDelete}
            disabled={bulkDeleteMutation.isPending}
          >
            Delete selected ({selected.size})
          </Button>
        </div>
      ) : null}

      {readyImages.length > 0 ? (
        <SortableImageGrid
          images={readyImages}
          selectedIds={selected}
          onToggleSelect={toggleSelect}
          onOpen={setLightboxId}
          onReorder={reorder}
        />
      ) : (
        <p className="eduos-hint" style={{ marginTop: "1rem" }}>No photos yet. Upload images above.</p>
      )}

      {lightboxImage ? (
        <Lightbox
          open={Boolean(lightboxId)}
          src={lightboxImage.imageUrl}
          alt={lightboxImage.originalFileName}
          onClose={() => setLightboxId(null)}
          onPrev={lightboxIndex > 0 ? () => setLightboxId(readyImages[lightboxIndex - 1]!.id) : undefined}
          onNext={
            lightboxIndex < readyImages.length - 1
              ? () => setLightboxId(readyImages[lightboxIndex + 1]!.id)
              : undefined
          }
          allowDownload
        />
      ) : null}

      {album && readyImages.length > 0 ? (
        <div style={{ marginTop: "1.5rem", display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          {lightboxId ? (
            <Button
              type="button"
              variant="secondary"
              onClick={() => setCover(lightboxId)}
              disabled={setCoverMutation.isPending}
            >
              Set as cover
            </Button>
          ) : null}
          <Button type="button" variant="secondary" onClick={() => refetch()} disabled={isFetching}>
            {isFetching ? "Refreshing…" : "Refresh"}
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={deleteAlbum}
            disabled={deleteAlbumMutation.isPending}
          >
            Delete album
          </Button>
        </div>
      ) : null}
    </AdminShell>
  );
}
