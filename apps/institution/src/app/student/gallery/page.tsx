"use client";

import Link from "next/link";
import { EmptyState, SkeletonText } from "@eduos/ui";
import { StudentShell } from "@/components/student/StudentShell";
import { useStudentGalleryAlbumsQuery } from "@/lib/queries";

export default function StudentGalleryPage() {
  const { data, error: queryError, isPending } = useStudentGalleryAlbumsQuery();
  const albums = queryError ? [] : data?.albums ?? (isPending ? null : []);

  return (
    <StudentShell title="Gallery">
      <p className="eduos-section-desc">Campus photo albums shared by your school.</p>
      {queryError ? (
        <p className="eduos-admin-message eduos-admin-message--error">Failed to load gallery</p>
      ) : null}
      {albums === null ? (
        <SkeletonText lines={6} />
      ) : albums.length === 0 ? (
        <EmptyState title="No albums yet" description="Your school has not published any gallery albums." />
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(14rem, 1fr))", gap: "1rem" }}>
          {albums.map((album) => (
            <Link
              key={album.id}
              href={`/student/gallery/${album.id}`}
              className="eduos-panel"
              style={{ padding: 0, overflow: "hidden", textDecoration: "none", color: "inherit" }}
            >
              <div style={{ aspectRatio: "4/3", background: "var(--eduos-border)" }}>
                {album.coverImageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={album.coverImageUrl} alt="" loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : null}
              </div>
              <div style={{ padding: "0.75rem" }}>
                <strong style={{ fontSize: "0.875rem" }}>{album.title}</strong>
                <p style={{ margin: "0.25rem 0 0", fontSize: "0.8125rem", color: "var(--eduos-text-muted)" }}>
                  {album.totalImages} photos
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </StudentShell>
  );
}
