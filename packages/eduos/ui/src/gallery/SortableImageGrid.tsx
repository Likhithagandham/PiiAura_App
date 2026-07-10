"use client";

import type { GalleryImage } from "@eduos/types";
import { ImageGrid } from "./ImageGrid";

export interface SortableImageGridProps {
  images: GalleryImage[];
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
  onOpen: (id: string) => void;
  onReorder: (imageIds: string[]) => void;
}

export function SortableImageGrid({
  images,
  selectedIds,
  onToggleSelect,
  onOpen,
  onReorder,
}: SortableImageGridProps) {
  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData("text/plain", id);
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    const sourceId = e.dataTransfer.getData("text/plain");
    if (!sourceId || sourceId === targetId) return;
    const ids = images.map((i) => i.id);
    const from = ids.indexOf(sourceId);
    const to = ids.indexOf(targetId);
    if (from < 0 || to < 0) return;
    ids.splice(from, 1);
    ids.splice(to, 0, sourceId);
    onReorder(ids);
  };

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(10rem, 1fr))",
        gap: "0.75rem",
      }}
    >
      {images.map((image) => (
        <div
          key={image.id}
          draggable
          onDragStart={(e) => handleDragStart(e, image.id)}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => handleDrop(e, image.id)}
        >
          <ImageGrid
            items={[{
              id: image.id,
              src: image.thumbnailUrl || image.imageUrl || "",
              alt: image.originalFileName,
              selected: selectedIds.has(image.id),
            }]}
            onSelect={onToggleSelect}
            onOpen={onOpen}
          />
        </div>
      ))}
    </div>
  );
}
