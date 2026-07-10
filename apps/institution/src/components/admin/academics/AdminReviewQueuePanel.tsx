"use client";

import Link from "next/link";
import type { AcademicsData } from "@eduos/types";
import { Button, EmptyState } from "@eduos/ui";

function reviewLabel(type: AcademicsData["adminReviewQueue"][number]["type"]) {
  if (type === "tbd_slots") return "TBD slots";
  if (type === "subject_teacher_unassigned") return "Subject teachers missing";
  return "Faculty unassigned";
}

function reviewSeverity(type: AcademicsData["adminReviewQueue"][number]["type"]) {
  if (type === "tbd_slots") return "portal-alert-card--warning";
  if (type === "subject_teacher_unassigned") return "portal-alert-card--warning";
  return "portal-alert-card--info";
}

export function AdminReviewQueuePanel({
  data,
  onResolve,
}: {
  data: AcademicsData;
  onResolve: (reviewId: string) => void;
}) {
  const pending = (data.adminReviewQueue ?? []).filter((r) => !r.resolved);

  return (
    <section className="eduos-panel">
      <div className="staffing-panel-head">
        <div>
          <h2 className="eduos-section-title">Admin review queue</h2>
          <p className="eduos-section-desc">Timetable, staffing, and faculty issues that need attention.</p>
        </div>
        {pending.length > 0 ? (
          <span className="staffing-status-badge staffing-status-badge--warning">
            {pending.length} pending
          </span>
        ) : null}
      </div>

      {pending.length === 0 ? (
        <EmptyState
          compact
          title="All clear"
          description="No pending timetable, staffing, or faculty issues."
        />
      ) : (
        <ul className="timetable-review-list">
          {pending.map((item) => (
            <li key={item.id} className={`portal-alert-card ${reviewSeverity(item.type)} timetable-review-item`}>
              <div className="portal-alert-card__title">{reviewLabel(item.type)}</div>
              <p className="timetable-review-item__message">{item.message}</p>
              <div className="timetable-review-item__meta">
                {item.type === "subject_teacher_unassigned" && (item.gaps?.length ?? 0) > 0
                  ? `${item.gaps!.length} assignment(s) · `
                  : (item.slotIds?.length ?? 0) > 0
                    ? `${item.slotIds!.length} slot(s) · `
                    : ""}
                {item.createdAt ? new Date(item.createdAt).toLocaleString("en-IN") : ""}
              </div>
              <div className="timetable-review-item__actions">
                {item.type === "subject_teacher_unassigned" ? (
                  <Link href="/admin/academics?tab=Staffing" className="eduos-link">
                    Open Staffing tab
                  </Link>
                ) : null}
                <Button type="button" variant="secondary" className="eduos-admin-btn-sm" onClick={() => onResolve(item.id)}>
                  Mark reviewed
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
