"use client";

import type { UploadQueueItem } from "@eduos/types";
import { Button } from "../components/Button";

export interface UploadProgressListProps {
  items: UploadQueueItem[];
  onRetry?: (id: string) => void;
  onRemove?: (id: string) => void;
}

export function UploadProgressList({ items, onRetry, onRemove }: UploadProgressListProps) {
  if (!items.length) return null;
  return (
    <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: "0.5rem" }}>
      {items.map((item) => (
        <li
          key={item.id}
          className="eduos-panel"
          style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.5rem 0.75rem" }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={item.previewUrl}
            alt=""
            style={{ width: 48, height: 48, objectFit: "cover", borderRadius: 4 }}
          />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: "0.8125rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {item.file.name}
            </div>
            <div
              style={{
                marginTop: 4,
                height: 4,
                borderRadius: 2,
                background: "var(--eduos-border)",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${item.progress}%`,
                  height: "100%",
                  background: item.status === "failed" ? "#c53030" : "var(--eduos-primary, #1a5f4a)",
                  transition: "width 0.2s",
                }}
              />
            </div>
            <div style={{ fontSize: "0.75rem", color: "var(--eduos-text-muted)", marginTop: 2 }}>
              {item.status}{item.error ? ` — ${item.error}` : ""}
            </div>
          </div>
          {item.status === "failed" && onRetry ? (
            <Button type="button" variant="secondary" className="eduos-admin-btn-sm" onClick={() => onRetry(item.id)}>
              Retry
            </Button>
          ) : null}
          {onRemove ? (
            <Button type="button" variant="secondary" className="eduos-admin-btn-sm" onClick={() => onRemove(item.id)}>
              Remove
            </Button>
          ) : null}
        </li>
      ))}
    </ul>
  );
}
