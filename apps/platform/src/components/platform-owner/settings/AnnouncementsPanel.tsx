import type {
  PlatformAnnouncementSeverity,
  PlatformGlobalAnnouncement,
} from "@eduos/types";
import { Button, TruncatedText } from "@eduos/ui";

export function AnnouncementsPanel({
  announcements,
  annForm,
  busy,
  onFormChange,
  onPublish,
  onToggle,
}: {
  announcements: PlatformGlobalAnnouncement[];
  annForm: { title: string; body: string; severity: PlatformAnnouncementSeverity };
  busy: boolean;
  onFormChange: (next: {
    title: string;
    body: string;
    severity: PlatformAnnouncementSeverity;
  }) => void;
  onPublish: () => void;
  onToggle: (id: string, isActive: boolean) => void;
}) {
  return (
    <section className="eduos-panel">
      <h2 className="eduos-section-title">Global announcements</h2>
      <p className="eduos-section-desc">
        Publish banners visible to all institution portals (mock delivery).
      </p>
      <div className="eduos-filter-grid" style={{ marginBottom: "1rem" }}>
        <label className="eduos-filter-grid__label">
          Title
          <input
            className="eduos-input eduos-input--field"
            value={annForm.title}
            onChange={(e) => onFormChange({ ...annForm, title: e.target.value })}
          />
        </label>
        <label className="eduos-filter-grid__label">
          Severity
          <select
            className="eduos-input eduos-input--field"
            value={annForm.severity}
            onChange={(e) =>
              onFormChange({
                ...annForm,
                severity: e.target.value as PlatformAnnouncementSeverity,
              })
            }
          >
            <option value="info">Info</option>
            <option value="warning">Warning</option>
            <option value="critical">Critical</option>
          </select>
        </label>
      </div>
      <label className="eduos-filter-grid__label" style={{ display: "block" }}>
        Message
        <textarea
          className="eduos-input eduos-input--field"
          rows={3}
          value={annForm.body}
          onChange={(e) => onFormChange({ ...annForm, body: e.target.value })}
          style={{ width: "100%", maxWidth: "none" }}
        />
      </label>
      <div className="eduos-panel__actions" style={{ marginTop: "0.75rem" }}>
        <Button type="button" disabled={busy} onClick={onPublish}>
          {busy ? "Publishing…" : "Publish announcement"}
        </Button>
      </div>

      {announcements.length > 0 ? (
        <div className="eduos-table-wrap" style={{ marginTop: "1.25rem" }}>
          <table className="eduos-admin-table">
            <thead>
              <tr>
                <th>Title</th>
                <th className="eduos-admin-table__nowrap">Severity</th>
                <th className="eduos-admin-table__nowrap">Published</th>
                <th className="eduos-admin-table__nowrap">Status</th>
                <th className="eduos-admin-table__actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              {announcements.map((a) => (
                <tr key={a.id}>
                  <td style={{ fontWeight: 600 }}>
                    <TruncatedText text={a.title} maxWidth="16rem" />
                  </td>
                  <td className="eduos-admin-table__nowrap">{a.severity}</td>
                  <td className="eduos-admin-table__nowrap">
                    {new Date(a.publishedAt).toLocaleString()}
                  </td>
                  <td className="eduos-admin-table__nowrap">
                    {a.isActive ? "Active" : "Hidden"}
                  </td>
                  <td className="eduos-admin-table__actions">
                    <Button
                      type="button"
                      variant="secondary"
                      className="eduos-admin-btn-sm"
                      disabled={busy}
                      onClick={() => onToggle(a.id, !a.isActive)}
                    >
                      {a.isActive ? "Hide" : "Show"}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </section>
  );
}
