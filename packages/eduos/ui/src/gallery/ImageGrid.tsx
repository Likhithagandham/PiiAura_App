"use client";

export interface ImageGridItem {
  id: string;
  src: string;
  alt: string;
  selected?: boolean;
}

export interface ImageGridProps {
  items: ImageGridItem[];
  onSelect?: (id: string) => void;
  onOpen?: (id: string) => void;
}

export function ImageGrid({ items, onSelect, onOpen }: ImageGridProps) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(10rem, 1fr))",
        gap: "0.75rem",
      }}
    >
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          className="eduos-panel"
          style={{
            padding: 0,
            overflow: "hidden",
            border: item.selected ? "2px solid var(--eduos-primary, #1a5f4a)" : "1px solid var(--eduos-border)",
            cursor: "pointer",
            background: "transparent",
          }}
          onClick={() => (onOpen ? onOpen(item.id) : onSelect?.(item.id))}
        >
          <div style={{ aspectRatio: "1", position: "relative", background: "var(--eduos-border)" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={item.src}
              alt={item.alt}
              loading="lazy"
              decoding="async"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>
        </button>
      ))}
    </div>
  );
}
