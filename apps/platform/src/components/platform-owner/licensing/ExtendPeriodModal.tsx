"use client";

import { useState } from "react";
import { Button, Input, Modal } from "@eduos/ui";
import { ApiError, apiSend } from "@/lib/api-client";

export function ExtendPeriodModal({
  periodId,
  currentEnd,
  onClose,
  onSaved,
}: {
  periodId: string;
  currentEnd: string;
  onClose: () => void;
  onSaved: () => Promise<void>;
}) {
  const [endDate, setEndDate] = useState(currentEnd);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    setSaving(true);
    setError(null);
    try {
      await apiSend(`/api/platform-owner/licensing/periods/${periodId}`, "PATCH", { endDate });
      await onSaved();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to extend subscription");
      setSaving(false);
    }
  }

  return (
    <Modal
      title="Extend subscription"
      onClose={saving ? undefined : onClose}
      footer={
        <>
          <Button type="button" variant="secondary" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button type="button" onClick={() => void submit()} disabled={saving}>
            {saving ? "Saving…" : "Extend"}
          </Button>
        </>
      }
    >
      <div style={{ display: "grid", gap: "0.75rem" }}>
        {error ? <p className="eduos-admin-message eduos-admin-message--error">{error}</p> : null}
        <p className="eduos-body-sm">
          Current end date: <strong>{new Date(currentEnd).toLocaleDateString("en-IN")}</strong>.
          Set a custom end date to align this school with its academic calendar (for example,
          extend to the end of June).
        </p>
        <Input
          label="New end date *"
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          required
        />
      </div>
    </Modal>
  );
}
