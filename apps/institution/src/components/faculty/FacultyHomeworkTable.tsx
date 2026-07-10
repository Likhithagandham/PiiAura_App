"use client";

import type { DailyHomeworkEntry } from "@eduos/types";
import { Button } from "@eduos/ui";

const tableStyle: React.CSSProperties = { width: "100%", borderCollapse: "collapse", fontSize: "0.8125rem" };
const thStyle: React.CSSProperties = {
  textAlign: "left",
  padding: "0.5rem 0.75rem",
  borderBottom: "1px solid var(--eduos-border)",
  color: "var(--eduos-text-muted)",
  fontWeight: 700,
};
const tdStyle: React.CSSProperties = { padding: "0.5rem 0.75rem", borderBottom: "1px solid var(--eduos-border)" };

const smallBtnStyle: React.CSSProperties = {
  width: "auto",
  padding: "0.4rem 0.65rem",
  fontSize: "0.8125rem",
  fontWeight: 600,
  whiteSpace: "nowrap",
};

type Props = {
  rows: DailyHomeworkEntry[];
  canManageAll: boolean;
  currentUserId: string;
  pending: boolean;
  onPublish: (entry: DailyHomeworkEntry) => void;
  onDelete: (entry: DailyHomeworkEntry) => void;
  emptyMessage: string;
};

export function FacultyHomeworkTable({
  rows,
  canManageAll,
  currentUserId,
  pending,
  onPublish,
  onDelete,
  emptyMessage,
}: Props) {
  function canManage(entry: DailyHomeworkEntry) {
    if (canManageAll) return true;
    return entry.createdByUserId === currentUserId;
  }

  return (
    <table style={{ ...tableStyle, marginTop: "0.75rem" }}>
      <thead>
        <tr>
          <th style={thStyle}>Date</th>
          <th style={thStyle}>Class</th>
          <th style={thStyle}>Title</th>
          <th style={thStyle}>Posted by</th>
          <th style={thStyle}>Status</th>
          <th style={thStyle} />
        </tr>
      </thead>
      <tbody>
        {rows.length === 0 ? (
          <tr>
            <td colSpan={6} style={{ ...tdStyle, color: "var(--eduos-text-muted)" }}>
              {emptyMessage}
            </td>
          </tr>
        ) : (
          rows.map((h) => (
            <tr key={h.id}>
              <td style={tdStyle}>{h.date}</td>
              <td style={tdStyle}>{h.classLabel}</td>
              <td style={tdStyle}>{h.title}</td>
              <td style={tdStyle}>{h.createdBy}</td>
              <td style={tdStyle}>{h.status}</td>
              <td style={tdStyle}>
                {canManage(h) ? (
                  <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
                    {h.status === "draft" ? (
                      <Button
                        type="button"
                        variant="secondary"
                        style={smallBtnStyle}
                        onClick={() => onPublish(h)}
                        disabled={pending}
                      >
                        Publish
                      </Button>
                    ) : null}
                    <Button
                      type="button"
                      variant="secondary"
                      style={{ ...smallBtnStyle, color: "var(--eduos-danger)", borderColor: "var(--eduos-danger)" }}
                      onClick={() => onDelete(h)}
                      disabled={pending}
                    >
                      Delete
                    </Button>
                  </div>
                ) : null}
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
}

export { smallBtnStyle };
