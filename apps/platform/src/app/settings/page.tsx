"use client";

import { useEffect, useState } from "react";
import type {
  PlatformAnnouncementSeverity,
  PlatformMaintenanceMode,
  PlatformPlanDefinition,
  PlatformSettingsData,
  PlatformTenantPlan,
} from "@eduos/types";
import { SkeletonText } from "@eduos/ui";
import { AnnouncementsPanel } from "@/components/platform-owner/settings/AnnouncementsPanel";
import { MaintenanceSettingsPanel } from "@/components/platform-owner/settings/MaintenanceSettingsPanel";
import { PlanDefinitionsPanel } from "@/components/platform-owner/settings/PlanDefinitionsPanel";
import { PlatformOwnerShell } from "@/components/platform-owner/PlatformOwnerShell";
import { ApiError, apiSend } from "@/lib/api-client";
import { usePlatformMaintenance } from "@/lib/platform-owner/maintenance-context";
import { useApiData } from "@/lib/queries";

export default function PlatformSettingsPage() {
  return (
    <PlatformOwnerShell title="Platform settings">
      <PlatformSettingsContent />
    </PlatformOwnerShell>
  );
}

function PlatformSettingsContent() {
  const { refresh: refreshMaintenanceBanner } = usePlatformMaintenance();
  const {
    data,
    error: queryError,
    refetch,
  } = useApiData<PlatformSettingsData>("/api/platform-owner/settings");
  const loadError = queryError
    ? queryError instanceof ApiError
      ? queryError.message
      : "Failed to load settings"
    : null;
  const [maintenanceDraft, setMaintenanceDraft] = useState<PlatformMaintenanceMode | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [draftPlans, setDraftPlans] = useState<
    Partial<Record<PlatformTenantPlan, PlatformPlanDefinition>>
  >({});
  const [annForm, setAnnForm] = useState({
    title: "",
    body: "",
    severity: "info" as PlatformAnnouncementSeverity,
  });
  const error = actionError ?? loadError;

  useEffect(() => {
    if (!data) return;
    const drafts: Record<PlatformTenantPlan, PlatformPlanDefinition> = {} as Record<
      PlatformTenantPlan,
      PlatformPlanDefinition
    >;
    for (const p of data.planDefinitions) {
      drafts[p.plan] = { ...p, includedFeatures: [...p.includedFeatures] };
    }
    setDraftPlans(drafts);
    setMaintenanceDraft({ ...data.maintenance });
  }, [data]);

  async function saveMaintenance() {
    if (!maintenanceDraft) return;
    setBusy(true);
    setMessage(null);
    setActionError(null);
    try {
      await apiSend("/api/platform-owner/maintenance", "PATCH", {
        enabled: maintenanceDraft.enabled,
        message: maintenanceDraft.message,
        blockWrites: maintenanceDraft.blockWrites,
        scheduledEndAt: maintenanceDraft.scheduledEndAt,
      });
      setMessage(
        maintenanceDraft.enabled
          ? "Maintenance mode enabled — banner is visible platform-wide."
          : "Maintenance mode disabled.",
      );
      await refreshMaintenanceBanner();
      await refetch();
    } catch (e) {
      setActionError(e instanceof ApiError ? e.message : "Save failed");
    } finally {
      setBusy(false);
    }
  }

  async function savePlan(plan: PlatformTenantPlan) {
    const row = draftPlans[plan];
    if (!row) return;
    setBusy(true);
    setMessage(null);
    setActionError(null);
    try {
      await apiSend("/api/platform-owner/settings", "PATCH", {
        plan,
        label: row.label,
        description: row.description,
        pricePerStudentInr: row.pricePerStudentInr,
        includedAiCreditsPerStudent: row.includedAiCreditsPerStudent,
        includesAi: row.includesAi,
      });
      setMessage(`Saved ${row.label} plan definition.`);
      await refetch();
    } catch (e) {
      setActionError(e instanceof ApiError ? e.message : "Save failed");
    } finally {
      setBusy(false);
    }
  }

  async function publishAnnouncement() {
    setBusy(true);
    setMessage(null);
    setActionError(null);
    try {
      await apiSend("/api/platform-owner/settings", "POST", annForm);
      setAnnForm({ title: "", body: "", severity: "info" });
      setMessage("Global announcement published to all institution portals.");
      await refetch();
    } catch (e) {
      setActionError(e instanceof ApiError ? e.message : "Publish failed");
    } finally {
      setBusy(false);
    }
  }

  async function toggleAnnouncement(id: string, isActive: boolean) {
    setBusy(true);
    setActionError(null);
    try {
      await apiSend("/api/platform-owner/settings", "PATCH", {
        type: "announcement_toggle",
        id,
        isActive,
      });
      await refetch();
    } catch (e) {
      setActionError(e instanceof ApiError ? e.message : "Update failed");
    } finally {
      setBusy(false);
    }
  }

  const plans = data?.planDefinitions ?? [];

  return (
    <>
      {error ? <p className="eduos-admin-message eduos-admin-message--error">{error}</p> : null}
      {message ? <p className="eduos-admin-message">{message}</p> : null}

      {!data && !error ? (
        <SkeletonText lines={4} />
      ) : !data ? null : (
        <>
          {maintenanceDraft ? (
            <MaintenanceSettingsPanel
              maintenanceDraft={maintenanceDraft}
              busy={busy}
              onChange={setMaintenanceDraft}
              onSave={() => void saveMaintenance()}
            />
          ) : null}

          <PlanDefinitionsPanel
            plans={plans}
            draftPlans={draftPlans}
            busy={busy}
            onDraftChange={(plan, draft) =>
              setDraftPlans((d) => ({ ...d, [plan]: draft }))
            }
            onSavePlan={(plan) => void savePlan(plan)}
          />

          <AnnouncementsPanel
            announcements={data.announcements}
            annForm={annForm}
            busy={busy}
            onFormChange={setAnnForm}
            onPublish={() => void publishAnnouncement()}
            onToggle={(id, isActive) => void toggleAnnouncement(id, isActive)}
          />
        </>
      )}
    </>
  );
}
