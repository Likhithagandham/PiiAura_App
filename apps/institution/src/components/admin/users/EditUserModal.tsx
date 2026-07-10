"use client";

import { useState } from "react";
import type { ManagedUser, UpdateUserInput } from "@eduos/types";
import { Button, Input } from "@eduos/ui";
import { AdminModal } from "../AdminModal";

export function EditUserModal({
  user,
  onClose,
  onSaved,
  actionsApiBase = "/api/admin/users/actions",
}: {
  user: ManagedUser;
  onClose: () => void;
  onSaved: (msg: string) => void;
  actionsApiBase?: string;
}) {
  const [form, setForm] = useState<UpdateUserInput>({
    name: user.name,
    email: user.email,
    phone: user.phone ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    setSaving(true);
    setError(null);
    const res = await fetch(actionsApiBase, {
      method: "PATCH",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "Idempotency-Key": `users-edit-${Date.now()}`,
      },
      body: JSON.stringify({ action: "update_user", userId: user.id, payload: form }),
    });
    const data = await res.json().catch(() => ({}));
    setSaving(false);
    if (!res.ok) {
      setError((data as { error?: string }).error ?? "Could not update user");
      return;
    }
    onSaved(`Updated ${user.name}.`);
    onClose();
  }

  return (
    <AdminModal title={`Edit ${user.name}`} onClose={onClose} wide>
      {error ? <p style={{ color: "var(--eduos-danger)" }}>{error}</p> : null}
      <Input label="Name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
      <div style={{ height: "0.75rem" }} />
      <Input label="Email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
      <div style={{ height: "0.75rem" }} />
      <Input label="Phone" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
      <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem", marginTop: "1rem" }}>
        <Button type="button" variant="secondary" onClick={onClose} disabled={saving}>
          Cancel
        </Button>
        <Button type="button" onClick={handleSave} disabled={saving || !form.name.trim()}>
          {saving ? "Saving…" : "Save"}
        </Button>
      </div>
    </AdminModal>
  );
}
