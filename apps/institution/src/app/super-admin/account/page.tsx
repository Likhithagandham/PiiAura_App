"use client";

import { Suspense, useState } from "react";
import type {
  ChangeSuperAdminPasswordInput,
  SuperAdminNotificationPrefs,
  SuperAdminProfileData,
  UpdateSuperAdminProfileInput,
} from "@eduos/types";
import { Button, SkeletonText } from "@eduos/ui";
import { PortalTabs } from "@/components/layout/PortalTabs";
import { SuperAdminShell } from "@/components/super-admin/SuperAdminShell";
import { useApiData } from "@/lib/queries";
import { ActiveSessionsPanel } from "@/components/shared/security/ActiveSessionsPanel";
import { ChangeEmailPanel } from "@/components/shared/security/ChangeEmailPanel";
import { ChangePhonePanel } from "@/components/shared/security/ChangePhonePanel";
import { useSuperAdminUrlTab } from "@/lib/super-admin/use-super-admin-url-tab";

const TABS = ["profile", "password", "notifications", "security"] as const;
type TabId = (typeof TABS)[number];

function AccountContent() {
  const [tab, setTab] = useSuperAdminUrlTab(TABS, "profile");

  const profileTab = tab === "profile" || tab === "password";
  const { data: profile, error: profileError, refetch: loadProfile } =
    useApiData<SuperAdminProfileData>("/api/super-admin/profile", { enabled: profileTab });
  const { data: prefsData, error: prefsError, refetch: loadPrefs } =
    useApiData<SuperAdminNotificationPrefs>("/api/super-admin/notifications", {
      enabled: tab === "notifications",
    });

  // Editable fields default to the fetched values until the user edits them.
  const [nameOverride, setNameOverride] = useState<string | null>(null);
  const [phoneOverride, setPhoneOverride] = useState<string | null>(null);
  const name = nameOverride ?? profile?.name ?? "";
  const ownPhone = phoneOverride ?? profile?.ownPhone ?? "";

  const [prefsOverride, setPrefsOverride] = useState<SuperAdminNotificationPrefs | null>(null);
  const prefs = prefsOverride ?? prefsData ?? null;
  // Keep the old functional-updater signature so the checkbox handlers below are unchanged.
  function setPrefs(
    updater: (p: SuperAdminNotificationPrefs | null) => SuperAdminNotificationPrefs | null,
  ) {
    const next = updater(prefs);
    if (next) setPrefsOverride(next);
  }

  const [passwordForm, setPasswordForm] = useState<ChangeSuperAdminPasswordInput>({
    currentPassword: "",
    newPassword: "",
  });
  const [message, setMessage] = useState<string | null>(null);
  const [mutationError, setMutationError] = useState<string | null>(null);

  const error =
    mutationError ??
    (profileTab ? (profileError ? "Failed to load" : null) : prefsError ? "Failed to load" : null);

  return (
    <>
      <PortalTabs
        className="eduos-portal-tabs"
        active={tab}
        onChange={(t) => {
          setMessage(null);
          setMutationError(null);
          setTab(t);
        }}
        tabs={[
          { id: "profile", label: "Profile" },
          { id: "password", label: "Password" },
          { id: "notifications", label: "Notifications" },
          { id: "security", label: "Security" },
        ]}
      />

      {message ? <p className="eduos-admin-message">{message}</p> : null}
      {error ? <p className="eduos-admin-message eduos-admin-message--error">{error}</p> : null}

      {tab === "profile" ? (
        !profile ? (
          <SkeletonText lines={4} />
        ) : (
          <section className="eduos-panel">
            <h2 className="eduos-section-title">Profile</h2>
            <p className="eduos-section-desc">Update your display name and contact phone.</p>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(12rem, 1fr))",
                gap: "0.5rem",
                marginTop: "0.5rem",
                maxWidth: "36rem",
              }}
            >
              <label style={{ fontSize: "0.8125rem" }}>
                Name
                <input
                  className="eduos-input eduos-input--field"
                  style={{ display: "block", marginTop: "0.2rem", width: "100%" }}
                  value={name}
                  onChange={(e) => setNameOverride(e.target.value)}
                />
              </label>
              <label style={{ fontSize: "0.8125rem" }}>
                Login phone
                <input
                  className="eduos-input eduos-input--field"
                  style={{ display: "block", marginTop: "0.2rem", width: "100%" }}
                  value={profile.phone ?? ""}
                  disabled
                />
              </label>
              <label style={{ fontSize: "0.8125rem" }}>
                Contact phone
                <input
                  className="eduos-input eduos-input--field"
                  style={{ display: "block", marginTop: "0.2rem", width: "100%" }}
                  value={ownPhone}
                  onChange={(e) => setPhoneOverride(e.target.value)}
                  placeholder="+91…"
                />
              </label>
            </div>
            <div style={{ marginTop: "0.5rem" }}>
              <Button
                type="button"
                className="eduos-admin-btn-sm"
                onClick={async () => {
                  setMessage(null);
                  setMutationError(null);
                  const body: UpdateSuperAdminProfileInput = { name, ownPhone };
                  const res = await fetch("/api/super-admin/profile", {
                    method: "PATCH",
                    credentials: "include",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(body),
                  });
                  const json = await res.json().catch(() => ({}));
                  if (!res.ok) {
                    setMutationError((json as { error?: string }).error ?? "Save failed");
                    return;
                  }
                  setMessage("Profile updated.");
                  await loadProfile();
                }}
              >
                Save profile
              </Button>
            </div>
          </section>
        )
      ) : null}

      {tab === "password" ? (
        !profile ? (
          <SkeletonText lines={4} />
        ) : (
          <section className="eduos-panel">
            <h2 className="eduos-section-title">Change password</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", maxWidth: "20rem" }}>
              <input
                type="password"
                className="eduos-input eduos-input--field"
                placeholder="Current password"
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm((p) => ({ ...p, currentPassword: e.target.value }))}
              />
              <input
                type="password"
                className="eduos-input eduos-input--field"
                placeholder="New password (min 8 chars)"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm((p) => ({ ...p, newPassword: e.target.value }))}
              />
            </div>
            <div style={{ marginTop: "0.5rem" }}>
              <Button
                type="button"
                className="eduos-admin-btn-sm"
                onClick={async () => {
                  setMessage(null);
                  setMutationError(null);
                  const res = await fetch("/api/super-admin/profile", {
                    method: "POST",
                    credentials: "include",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(passwordForm),
                  });
                  const json = await res.json().catch(() => ({}));
                  if (!res.ok) {
                    setMutationError((json as { error?: string }).error ?? "Password change failed");
                    return;
                  }
                  setMessage("Password updated.");
                  setPasswordForm({ currentPassword: "", newPassword: "" });
                }}
              >
                Update password
              </Button>
            </div>
          </section>
        )
      ) : null}

      {tab === "security" ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <ActiveSessionsPanel />
          <ChangePhonePanel />
          <ChangeEmailPanel />
        </div>
      ) : null}

      {tab === "notifications" ? (
        !prefs ? (
          <SkeletonText lines={4} />
        ) : (
          <section className="eduos-panel">
            <h2 className="eduos-section-title">Notification preferences</h2>
            <p className="eduos-section-desc">Choose how super-admin alerts and updates are delivered.</p>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(14rem, 1fr))", gap: "0.75rem", marginTop: "0.5rem" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.875rem" }}>
                <input
                  type="checkbox"
                  checked={prefs.inApp}
                  onChange={(e) => setPrefs((p) => (p ? { ...p, inApp: e.target.checked } : p))}
                />
                In-app notifications
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.875rem" }}>
                <input
                  type="checkbox"
                  checked={prefs.email}
                  onChange={(e) => setPrefs((p) => (p ? { ...p, email: e.target.checked } : p))}
                />
                Email
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.875rem" }}>
                <input
                  type="checkbox"
                  checked={prefs.sms}
                  onChange={(e) => setPrefs((p) => (p ? { ...p, sms: e.target.checked } : p))}
                />
                SMS
              </label>
              <label style={{ fontSize: "0.8125rem" }}>
                Digest
                <select
                  className="eduos-input eduos-input--field"
                  value={prefs.digest}
                  onChange={(e) => setPrefs((p) => (p ? { ...p, digest: e.target.value as SuperAdminNotificationPrefs["digest"] } : p))}
                  style={{ display: "block", marginTop: "0.2rem", maxWidth: "14rem" }}
                >
                  <option value="off">Off</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                </select>
              </label>
            </div>

            <div style={{ marginTop: "0.75rem" }}>
              <Button
                type="button"
                className="eduos-admin-btn-sm"
                onClick={async () => {
                  setMessage(null);
                  setMutationError(null);
                  const res = await fetch("/api/super-admin/notifications", {
                    method: "PATCH",
                    credentials: "include",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(prefs),
                  });
                  const json = await res.json().catch(() => ({}));
                  if (!res.ok) {
                    setMutationError((json as { error?: string }).error ?? "Save failed");
                    return;
                  }
                  setMessage("Preferences updated.");
                  setPrefsOverride(null);
                  await loadPrefs();
                }}
              >
                Save preferences
              </Button>
            </div>
          </section>
        )
      ) : null}
    </>
  );
}

export default function SuperAdminAccountPage() {
  return (
    <SuperAdminShell title="Account">
      <Suspense fallback={<SkeletonText lines={4} />}>
        <AccountContent />
      </Suspense>
    </SuperAdminShell>
  );
}

