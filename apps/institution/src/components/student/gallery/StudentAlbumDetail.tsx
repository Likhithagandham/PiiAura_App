"use client";

import Link from "next/link";
import { ImageGrid, Lightbox, SkeletonText } from "@eduos/ui";
import { useState } from "react";
import { StudentShell } from "@/components/student/StudentShell";
import { useStudentGalleryAlbumQuery } from "@/lib/queries";

export function StudentAlbumDetail({ albumId }: { albumId: string }) {
  const { data, error: queryError, isPending } = useStudentGalleryAlbumQuery(albumId);
  const [lightboxId, setLightboxId] = useState<string | null>(null);
  const images = data?.images?.filter((i) => i.processingStatus === "ready") ?? [];
  const idx = lightboxId ? images.findIndex((i) => i.id === lightboxId) : -1;
  const current = idx >= 0 ? images[idx] : null;

  return (
    <StudentShell title={data?.album?.title ?? "Album"}>
      <p className="eduos-section-desc">
        <Link href="/student/gallery">← All albums</Link>
      </p>
      {queryError ? <p className="eduos-admin-message eduos-admin-message--error">Failed to load album</p> : null}
      {isPending && !data ? (
        <SkeletonText lines={6} />
      ) : (
        <ImageGrid
          items={images.map((i) => ({
            id: i.id,
            src: i.thumbnailUrl || i.imageUrl || "",
            alt: i.originalFileName,
          }))}
          onOpen={setLightboxId}
        />
      )}
      {current ? (
        <Lightbox
          open={Boolean(lightboxId)}
          src={current.imageUrl}
          alt={current.originalFileName}
          onClose={() => setLightboxId(null)}
          onPrev={idx > 0 ? () => setLightboxId(images[idx - 1]!.id) : undefined}
          onNext={idx < images.length - 1 ? () => setLightboxId(images[idx + 1]!.id) : undefined}
        />
      ) : null}
    </StudentShell>
  );
}
