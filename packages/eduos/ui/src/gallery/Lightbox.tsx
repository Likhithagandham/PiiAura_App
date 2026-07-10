"use client";

import { useEffect } from "react";
import { Modal } from "../components/Modal";
import { Button } from "../components/Button";

export interface LightboxProps {
  open: boolean;
  src: string | null;
  alt?: string;
  onClose: () => void;
  onPrev?: () => void;
  onNext?: () => void;
  allowDownload?: boolean;
}

export function Lightbox({ open, src, alt = "", onClose, onPrev, onNext, allowDownload }: LightboxProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onPrev?.();
      if (e.key === "ArrowRight") onNext?.();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose, onPrev, onNext]);

  if (!open || !src) return null;

  return (
    <Modal title={alt || "Photo"} wide onClose={onClose}>
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem", alignItems: "center" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt}
          style={{ maxWidth: "100%", maxHeight: "70vh", objectFit: "contain" }}
        />
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", justifyContent: "center" }}>
          {onPrev ? (
            <Button type="button" variant="secondary" onClick={onPrev}>
              Previous
            </Button>
          ) : null}
          {onNext ? (
            <Button type="button" variant="secondary" onClick={onNext}>
              Next
            </Button>
          ) : null}
          {allowDownload && src ? (
            <Button type="button" variant="secondary" onClick={() => window.open(src, "_blank")}>
              Download
            </Button>
          ) : null}
          <Button type="button" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
}
