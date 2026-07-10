"use client";

import type { Announcement } from "@eduos/types";
import { EmptyState, InlineLoading, PortalFilterBar, filterBySearch } from "@eduos/ui";
import { useEffect, useMemo, useRef, useState } from "react";
import { StudentShell } from "@/components/student/StudentShell";
import { useApiData } from "@/lib/queries";

type NoticeRow = Announcement & { read?: boolean };

function formatDate(value?: string): string {
  if (!value) return "";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? "" : d.toLocaleString();
}

export default function StudentNoticesPage() {
  const { data, error: queryError } = useApiData<{ announcements?: NoticeRow[] }>(
    "/api/student/announcements",
  );
  const items = data ? (data.announcements ?? []) : null;
  const error = queryError ? "Failed to load notices." : null;
  const [search, setSearch] = useState("");

  // Once the notices have loaded, mark them read (fire-and-forget) and let the
  // shell's unread badge refresh. Runs once per mount.
  const markedRef = useRef(false);
  useEffect(() => {
    if (!data || markedRef.current) return;
    markedRef.current = true;
    void fetch("/api/student/announcements", { method: "POST", credentials: "include" }).catch(
      () => {},
    );
    window.dispatchEvent(new Event("notices-read"));
  }, [data]);

  const filteredItems = useMemo(
    () => filterBySearch(items ?? [], search, (a) => [a.title, a.body]),
    [items, search],
  );

  return (
    <StudentShell title="Notices">
      <p className="eduos-section-desc">
        Messages published by your school. For personal fee and attendance reminders, see Alerts.
      </p>
      {error ? <p className="eduos-admin-message eduos-admin-message--error">{error}</p> : null}
      {items === null ? (
        <InlineLoading />
      ) : items.length === 0 ? (
        <EmptyState title="No notices" description="School notices will appear here." />
      ) : (
        <>
          <PortalFilterBar
            search={search}
            onSearchChange={setSearch}
            searchPlaceholder="Search notices…"
            total={items.length}
            filtered={filteredItems.length}
          />
          {filteredItems.length === 0 ? (
            <EmptyState compact title="No matches" description="Try a different search term." />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {filteredItems.map((a) => (
                <article key={a.id} className="eduos-panel">
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: "0.75rem",
                      alignItems: "baseline",
                    }}
                  >
                    <h3 className="eduos-subsection-title" style={{ margin: 0 }}>
                      {a.title}
                      {a.read === false ? (
                        <span
                          style={{
                            marginLeft: "0.5rem",
                            fontSize: "0.625rem",
                            fontWeight: 700,
                            color: "#fff",
                            background: "var(--eduos-primary)",
                            borderRadius: "999px",
                            padding: "0.1rem 0.4rem",
                            verticalAlign: "middle",
                          }}
                        >
                          NEW
                        </span>
                      ) : null}
                    </h3>
                    <time style={{ fontSize: "0.75rem", color: "var(--eduos-text-muted)" }}>
                      {formatDate(a.sentAt)}
                    </time>
                  </div>
                  <p className="eduos-body-sm" style={{ marginTop: "0.5rem", lineHeight: 1.5 }}>
                    {a.body}
                  </p>
                </article>
              ))}
            </div>
          )}
        </>
      )}
    </StudentShell>
  );
}
