"use client";

import { useEffect, type ReactNode } from "react";

interface ModalProps {
  title: string;
  children: ReactNode;
  /** Called on backdrop click, close button, or Escape. Omit to make the modal non-dismissable. */
  onClose?: () => void;
  /** Optional footer actions row. */
  footer?: ReactNode;
  wide?: boolean;
  /** Hide the × button (e.g. for forced decisions). Defaults to showing it when onClose is set. */
  hideCloseButton?: boolean;
}

/** Shared accessible dialog primitive (backdrop click + Escape to dismiss). */
export function Modal({
  title,
  children,
  onClose,
  footer,
  wide = false,
  hideCloseButton = false,
}: ModalProps) {
  useEffect(() => {
    if (!onClose) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose?.();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="eduos-modal__backdrop"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onClick={() => onClose?.()}
    >
      <div
        className={`eduos-modal${wide ? " eduos-modal--wide" : ""}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="eduos-modal__header">
          <h2 className="eduos-modal__title">{title}</h2>
          {onClose && !hideCloseButton ? (
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="eduos-modal__close"
            >
              ×
            </button>
          ) : null}
        </div>
        <div className="eduos-modal__body">{children}</div>
        {footer ? <div className="eduos-modal__footer">{footer}</div> : null}
      </div>
    </div>
  );
}
