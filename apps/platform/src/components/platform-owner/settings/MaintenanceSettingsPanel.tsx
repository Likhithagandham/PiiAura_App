import type { PlatformMaintenanceMode } from "@eduos/types";
import { Button } from "@eduos/ui";

export function MaintenanceSettingsPanel({
  maintenanceDraft,
  busy,
  onChange,
  onSave,
}: {
  maintenanceDraft: PlatformMaintenanceMode;
  busy: boolean;
  onChange: (next: PlatformMaintenanceMode) => void;
  onSave: () => void;
}) {
  return (
    <section className="eduos-panel">
      <h2 className="eduos-section-title">Global maintenance mode</h2>
      <p className="eduos-section-desc">
        Shows a persistent banner on every platform page. Optionally block POST,
        PATCH, and DELETE on platform-owner APIs (maintenance toggle always allowed).
      </p>
      <label
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          fontSize: "0.875rem",
          marginBottom: "0.75rem",
        }}
      >
        <input
          type="checkbox"
          checked={maintenanceDraft.enabled}
          onChange={(e) => onChange({ ...maintenanceDraft, enabled: e.target.checked })}
        />
        Maintenance mode active
      </label>
      <label
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          fontSize: "0.875rem",
          marginBottom: "0.75rem",
        }}
      >
        <input
          type="checkbox"
          checked={maintenanceDraft.blockWrites}
          onChange={(e) => onChange({ ...maintenanceDraft, blockWrites: e.target.checked })}
        />
        Block write APIs while maintenance is on
      </label>
      <label className="eduos-filter-grid__label" style={{ display: "block" }}>
        Banner message
        <textarea
          className="eduos-input eduos-input--field"
          rows={2}
          value={maintenanceDraft.message}
          onChange={(e) => onChange({ ...maintenanceDraft, message: e.target.value })}
          style={{ width: "100%", maxWidth: "none" }}
        />
      </label>
      <label className="eduos-filter-grid__label" style={{ display: "block", marginTop: "0.5rem" }}>
        Scheduled end (optional, ISO datetime-local)
        <input
          type="datetime-local"
          className="eduos-input eduos-input--field"
          value={
            maintenanceDraft.scheduledEndAt
              ? maintenanceDraft.scheduledEndAt.slice(0, 16)
              : ""
          }
          onChange={(e) =>
            onChange({
              ...maintenanceDraft,
              scheduledEndAt: e.target.value
                ? new Date(e.target.value).toISOString()
                : null,
            })
          }
          style={{ maxWidth: "20rem" }}
        />
      </label>
      <div className="eduos-panel__actions" style={{ marginTop: "0.75rem" }}>
        <Button type="button" disabled={busy} onClick={onSave}>
          {busy ? "Saving…" : "Save maintenance settings"}
        </Button>
      </div>
    </section>
  );
}
