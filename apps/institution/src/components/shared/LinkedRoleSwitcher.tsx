"use client";

import { useEffect, useRef, useState } from "react";
import { ROLE_LABELS } from "@eduos/constants";
import { useAuth } from "@eduos/hooks";
import { Button, Input, Modal } from "@eduos/ui";
import type { LinkedAccountOption } from "@eduos/types";

/** F-257 — switch to a linked role portal (e.g. faculty ↔ parent) with password confirmation. */
export function LinkedRoleSwitcher({ collapsed = false }: { collapsed?: boolean }) {
  const { user, linkedAccounts, switchLinkedAccount } = useAuth();
  const [target, setTarget] = useState<LinkedAccountOption | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  const others = linkedAccounts.filter((a) => a.userId !== user?.id);
  if (others.length === 0) return null;

  useEffect(() => {
    if (!menuOpen) return;
    function onPointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setMenuOpen(false);
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setMenuOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  function close() {
    setTarget(null);
    setMenuOpen(false);
    setPassword("");
    setError(null);
  }

  function pickAccount(account: LinkedAccountOption) {
    setMenuOpen(false);
    setTarget(account);
    setPassword("");
    setError(null);
  }

  async function confirm() {
    if (!target) return;
    setBusy(true);
    setError(null);
    try {
      await switchLinkedAccount(target.userId, password);
      close();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not switch portal");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      className={`eduos-linked-role-switcher${collapsed ? " eduos-linked-role-switcher--collapsed" : ""}`}
      ref={rootRef}
    >
      {collapsed ? (
        <button
          type="button"
          className="eduos-linked-role-switcher__icon-btn"
          title="Switch portal"
          aria-label="Switch portal"
          aria-expanded={menuOpen}
          aria-haspopup="menu"
          onClick={() => setMenuOpen((value) => !value)}
        >
          ⇄
        </button>
      ) : (
        <button
          type="button"
          className={`eduos-linked-role-switcher__trigger${menuOpen ? " eduos-linked-role-switcher__trigger--open" : ""}`}
          aria-expanded={menuOpen}
          aria-haspopup="menu"
          onClick={() => setMenuOpen((value) => !value)}
        >
          <span className="eduos-linked-role-switcher__trigger-icon" aria-hidden>
            ⇄
          </span>
          <span className="eduos-linked-role-switcher__trigger-text">Switch portal</span>
          <span className="eduos-linked-role-switcher__chevron" aria-hidden>
            ▾
          </span>
        </button>
      )}

      {menuOpen ? (
        <div className="eduos-linked-role-switcher__menu" role="menu">
          <div className="eduos-linked-role-switcher__menu-title">Open linked portal</div>
          {others.map((account) => (
            <button
              key={account.userId}
              type="button"
              role="menuitem"
              className="eduos-linked-role-switcher__menu-item"
              onClick={() => pickAccount(account)}
            >
              <span className="eduos-linked-role-switcher__menu-role">
                {ROLE_LABELS[account.role]}
              </span>
              <span className="eduos-linked-role-switcher__menu-name">
                {account.label || account.name}
              </span>
            </button>
          ))}
        </div>
      ) : null}

      {target ? (
        <Modal
          title={`Switch to ${ROLE_LABELS[target.role]} portal`}
          onClose={busy ? undefined : close}
          footer={
            <>
              <Button variant="secondary" onClick={close} disabled={busy}>
                Cancel
              </Button>
              <Button onClick={confirm} disabled={busy || !password}>
                {busy ? "Switching…" : "Switch portal"}
              </Button>
            </>
          }
        >
          <p style={{ marginTop: 0 }}>
            Re-authenticate to open your linked <strong>{ROLE_LABELS[target.role]}</strong> portal
            as <strong>{target.name}</strong>.
          </p>
          <Input
            type="password"
            label="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoFocus
          />
          {error ? (
            <p className="eduos-admin-message eduos-admin-message--error">{error}</p>
          ) : null}
        </Modal>
      ) : null}
    </div>
  );
}
