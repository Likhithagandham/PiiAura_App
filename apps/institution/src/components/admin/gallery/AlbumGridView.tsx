"use client";

import Link from "next/link";
import { Button, EmptyState, Input, SkeletonText } from "@eduos/ui";
import { useMemo, useState } from "react";
import { AdminShell } from "../AdminShell";
import { AdminMessage } from "../ui";
import { useAdminGalleryAlbumsQuery } from "@/lib/queries";

function albumHref(id: string) {
  return `/admin/gallery/${id}`;
}

export function AlbumGridView() {
  const [search, setSearch] = useState("");
  const [schoolOnly, setSchoolOnly] = useState(false);
  const filters = useMemo(
    () => ({ q: search.trim() || undefined, schoolOnly: schoolOnly || undefined }),
    [search, schoolOnly],
  );

  const { data, error: queryError, refetch, isFetching } = useAdminGalleryAlbumsQuery(filters);
  const albums = data?.albums ?? null;
  const displayError = queryError ? "Failed to load albums" : null;

  return (
    <AdminShell title="Gallery">
      <p className="eduos-section-desc">
        Organize campus photos in albums. Upload to Cloudflare R2 with automatic WebP optimization.
      </p>

      <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", marginBottom: "1rem", alignItems: "flex-end" }}>
        <Input
          label="Search albums"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Title, event, description…"
        />
        <label style={{ display: "flex", alignItems: "center", gap: "0.35rem", fontSize: "0.875rem" }}>
          <input type="checkbox" checked={schoolOnly} onChange={(e) => setSchoolOnly(e.target.checked)} />
          School albums only
        </label>
        <Link href="/admin/gallery/new" style={{ marginLeft: "auto" }}>
          <Button type="button">Create album</Button>
        </Link>
      </div>

      {displayError ? <AdminMessage variant="error">{displayError}</AdminMessage> : null}

      {!albums ? (
        <SkeletonText lines={8} />
      ) : albums.length === 0 ? (
        <EmptyState
          title="No albums yet"
          description="Create your first album to start uploading campus photos."
        />
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(14rem, 1fr))",
            gap: "1rem",
          }}
        >
          {albums.map((album) => (
            <Link key={album.id} href={albumHref(album.id)} className="eduos-panel" style={{ padding: 0, overflow: "hidden", textDecoration: "none", color: "inherit" }}>
              <div style={{ aspectRatio: "4/3", background: "var(--eduos-border)", position: "relative" }}>
                {album.coverImageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={album.coverImageUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  <div style={{ display: "grid", placeItems: "center", height: "100%", color: "var(--eduos-text-muted)", fontSize: "0.8125rem" }}>
                    No cover
                  </div>
                )}
              </div>
              <div style={{ padding: "0.75rem" }}>
                <strong style={{ fontSize: "0.875rem", display: "block" }}>{album.title}</strong>
                <p style={{ margin: "0.25rem 0 0", fontSize: "0.8125rem", color: "var(--eduos-text-muted)" }}>
                  {album.totalImages} photo{album.totalImages === 1 ? "" : "s"}
                  {album.batchName ? ` · ${album.batchName}` : " · School"}
                </p>
                <p style={{ margin: "0.25rem 0 0", fontSize: "0.75rem", color: "var(--eduos-text-muted)" }}>
                  {new Date(album.createdAt).toLocaleDateString()}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}

      <div style={{ marginTop: "1rem" }}>
        <Button type="button" variant="secondary" onClick={() => refetch()} disabled={isFetching}>
          {isFetching ? "Refreshing…" : "Refresh"}
        </Button>
      </div>
    </AdminShell>
  );
}
