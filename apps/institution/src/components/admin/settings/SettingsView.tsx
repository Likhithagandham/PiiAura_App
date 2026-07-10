"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { AdminSettings } from "@eduos/types";
import { ADMIN_ROUTES } from "@eduos/constants";
import { Button, Input, SkeletonText } from "@eduos/ui";
import { PortalTabs } from "@/components/layout/PortalTabs";
import { useApiData } from "@/lib/queries";
import { useAdminUrlTab } from "@/lib/admin/use-admin-url-tab";
import { AdminShell } from "../AdminShell";
import { AdminMessage } from "../ui";
import { AcademicYearRolloverPanel } from "./AcademicYearRolloverPanel";
import { AuditLogPanel } from "./AuditLogPanel";

const SETTINGS_TABS = ["institution", "academic-year", "attendance", "data"] as const;
type SettingsTab = (typeof SETTINGS_TABS)[number];

const TABS: { id: SettingsTab; label: string }[] = [
  { id: "institution", label: "Institution info" },
  { id: "academic-year", label: "Academic year" },
  { id: "attendance", label: "Attendance rules" },
  { id: "data", label: "Data lifecycle" },
];

function SettingsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [tab, setTab] = useAdminUrlTab(SETTINGS_TABS, "institution");
  const { data: settings, refetch } = useApiData<AdminSettings>("/api/admin/settings");
  const load = refetch;
  const [message, setMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (searchParams.get("tab") === "notifications") {
      router.replace(ADMIN_ROUTES.notifications);
    }
    if (searchParams.get("tab") === "features") {
      router.replace(ADMIN_ROUTES.settings);
    }
  }, [router, searchParams]);

  async function patch(section: string, data: Record<string, unknown>) {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ section, data }),
      });
      if (!res.ok) throw new Error("Save failed");
      await load();
      setMessage("Saved successfully.");
    } catch {
      setMessage("Could not save changes.");
    } finally {
      setSaving(false);
    }
  }

  if (!settings) return <SkeletonText lines={4} />;

  const inst = settings.institution;

  return (
    <>
      <PortalTabs
        className="eduos-portal-tabs"
        tabs={TABS}
        active={tab}
        onChange={(id) => {
          setTab(id);
          setMessage(null);
        }}
      />

      <AdminMessage variant={message && !message.includes("success") ? "error" : "success"}>{message}</AdminMessage>

      <div className="eduos-panel" style={{ maxWidth: tab === "academic-year" ? "720px" : "640px" }}>
        {tab === "institution" ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              patch("institution", {
                institutionName: fd.get("institutionName"),
                branchName: fd.get("branchName"),
                institutionAddress: {
                  line1: fd.get("instLine1"),
                  city: fd.get("instCity"),
                  state: fd.get("instState"),
                  pincode: fd.get("instPincode"),
                },
                branchAddress: {
                  line1: fd.get("branchLine1"),
                  city: fd.get("branchCity"),
                  state: fd.get("branchState"),
                  pincode: fd.get("branchPincode"),
                },
              });
            }}
            style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
          >
            <h3 className="eduos-subsection-title">Institution & branch</h3>
            <Input
              name="institutionName"
              label="Institution name"
              defaultValue={inst.institutionName}
            />
            <Input name="branchName" label="Branch name" defaultValue={inst.branchName} />
            <p className="eduos-hint">Institution address</p>
            <Input name="instLine1" label="Address line 1" defaultValue={inst.institutionAddress.line1} />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
              <Input name="instCity" label="City" defaultValue={inst.institutionAddress.city} />
              <Input name="instState" label="State" defaultValue={inst.institutionAddress.state} />
            </div>
            <Input name="instPincode" label="PIN code" defaultValue={inst.institutionAddress.pincode} />
            <p className="eduos-hint">Branch address</p>
            <Input name="branchLine1" label="Address line 1" defaultValue={inst.branchAddress.line1} />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
              <Input name="branchCity" label="City" defaultValue={inst.branchAddress.city} />
              <Input name="branchState" label="State" defaultValue={inst.branchAddress.state} />
            </div>
            <Input name="branchPincode" label="PIN code" defaultValue={inst.branchAddress.pincode} />
            <Button type="submit" disabled={saving}>
              Save institution info
            </Button>
          </form>
        ) : null}

        {tab === "academic-year" ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <h3 className="eduos-subsection-title">Academic years</h3>
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {settings.academicYears.map((y) => (
                <li
                  key={y.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "0.75rem",
                    border: "1px solid var(--eduos-border)",
                    borderRadius: "var(--eduos-radius)",
                    marginBottom: "0.5rem",
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600 }}>{y.label}</div>
                    <div style={{ fontSize: "0.8125rem", color: "var(--eduos-text-muted)" }}>
                      {y.startDate} → {y.endDate}
                    </div>
                  </div>
                  {y.isCurrent ? (
                    <span
                      style={{
                        fontSize: "0.75rem",
                        padding: "0.25rem 0.5rem",
                        background: "var(--eduos-primary-light)",
                        color: "var(--eduos-primary)",
                        borderRadius: "4px",
                        fontWeight: 600,
                      }}
                    >
                      Current
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => patch("academic-year-current", { yearId: y.id })}
                      style={{
                        fontSize: "0.8125rem",
                        color: "var(--eduos-primary)",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                      }}
                    >
                      Set as current
                    </button>
                  )}
                </li>
              ))}
            </ul>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                patch("academic-year-create", {
                  label: fd.get("label"),
                  startDate: fd.get("startDate"),
                  endDate: fd.get("endDate"),
                });
                e.currentTarget.reset();
              }}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.75rem",
                paddingTop: "1rem",
                borderTop: "1px solid var(--eduos-border)",
              }}
            >
              <p style={{ fontWeight: 600, fontSize: "0.875rem" }}>Add academic year</p>
              <Input name="label" label="Label" placeholder="2026–27" required />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                <Input name="startDate" label="Start date" type="date" required />
                <Input name="endDate" label="End date" type="date" required />
              </div>
              <Button type="submit" variant="secondary" disabled={saving}>
                Add year
              </Button>
            </form>

            <AcademicYearRolloverPanel />
          </div>
        ) : null}

        {tab === "data" ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
            <AuditLogPanel />
            <div>
              <h3 className="eduos-subsection-title">Bulk CSV import</h3>
              <p style={{ fontSize: "0.875rem", color: "var(--eduos-text-muted)", lineHeight: 1.5 }}>
                Import students or staff from a spreadsheet. This feature is coming soon — use Admissions
                for individual enrollments in the meantime.
              </p>
            </div>
            <div>
              <h3 className="eduos-subsection-title">Soft delete policy</h3>
              <p style={{ fontSize: "0.875rem", color: "var(--eduos-text-muted)", lineHeight: 1.5 }}>
                All domain records use soft delete: <code>is_active</code>, <code>deleted_at</code>, and{" "}
                <code>deleted_by</code>. Inactive records are hidden from daily operations but retained for
                audit and restore.
              </p>
            </div>
          </div>
        ) : null}

        {tab === "attendance" ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              patch("attendance-rules", {
                thresholdPercent: Number(fd.get("threshold")),
                examDayCountsTowardThreshold: fd.get("examDayRule") === "yes",
              });
            }}
            style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
          >
            <h3 className="eduos-subsection-title">Attendance rules</h3>
            <Input
              name="threshold"
              label="Minimum attendance threshold (%)"
              type="number"
              min={0}
              max={100}
              defaultValue={settings.attendanceRules.thresholdPercent}
            />
            <p className="eduos-hint">Default is 75%. Used for shortage alerts and reports.</p>
            <div>
              <span className="eduos-label">Exam-day attendance</span>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginTop: "0.5rem" }}>
                <label style={{ fontSize: "0.875rem", display: "flex", gap: "0.5rem" }}>
                  <input
                    type="radio"
                    name="examDayRule"
                    value="yes"
                    defaultChecked={settings.attendanceRules.examDayCountsTowardThreshold}
                  />
                  Count exam-day attendance toward threshold
                </label>
                <label style={{ fontSize: "0.875rem", display: "flex", gap: "0.5rem" }}>
                  <input
                    type="radio"
                    name="examDayRule"
                    value="no"
                    defaultChecked={!settings.attendanceRules.examDayCountsTowardThreshold}
                  />
                  Do not count exam-day attendance toward threshold
                </label>
              </div>
            </div>
            <Button type="submit" disabled={saving}>
              Save attendance rules
            </Button>
          </form>
        ) : null}
      </div>
    </>
  );
}

export function SettingsView() {
  return (
    <AdminShell title="Settings">
      <Suspense fallback={<SkeletonText lines={4} />}>
        <SettingsContent />
      </Suspense>
    </AdminShell>
  );
}
