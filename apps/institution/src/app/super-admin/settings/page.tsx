"use client";

import { useMemo, useState } from "react";
import type { InstitutionAddress, TenantBranding, TenantInstitutionSettings } from "@eduos/types";
import { Button, InstitutionLogo, SkeletonText } from "@eduos/ui";
import { SuperAdminShell } from "@/components/super-admin/SuperAdminShell";
import { useApiData } from "@/lib/queries";

function emptyAddress(): InstitutionAddress {
  return { line1: "", line2: "", city: "", state: "", pincode: "" };
}

function isHexColor(v: string): boolean {
  return /^#([0-9a-fA-F]{6})$/.test(v.trim());
}

export default function SuperAdminInstitutionSettingsPage() {
  const { data, error: settingsError, refetch: refetchSettings } =
    useApiData<TenantInstitutionSettings>("/api/super-admin/institution-settings");
  const { data: branding, refetch: refetchBranding } =
    useApiData<TenantBranding>("/api/super-admin/branding");
  const load = () => Promise.all([refetchSettings(), refetchBranding()]);

  const [mutationError, setMutationError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const error = mutationError ?? (settingsError ? "Failed to load" : null);

  // Editable fields default to the fetched values until the user edits them.
  const [brandColorOverride, setBrandColorOverride] = useState<string | null>(null);
  const [institutionNameOverride, setInstitutionNameOverride] = useState<string | null>(null);
  const [institutionTypeOverride, setInstitutionTypeOverride] = useState<
    "school" | "college" | null
  >(null);
  const [logoUrlOverride, setLogoUrlOverride] = useState<string | null>(null);
  const [addressOverride, setAddressOverride] = useState<InstitutionAddress | null>(null);
  const [parentPortalOverride, setParentPortalOverride] = useState<boolean | null>(null);

  const brandColor = brandColorOverride ?? branding?.brandColor ?? "#1a5f4a";
  const institutionName = institutionNameOverride ?? data?.institutionName ?? "";
  const institutionType = institutionTypeOverride ?? data?.institutionType ?? "school";
  const logoUrl = logoUrlOverride ?? data?.logoUrl ?? "";
  const address = addressOverride ?? data?.address ?? emptyAddress();
  const parentPortalEnabled = parentPortalOverride ?? data?.parentPortalEnabled ?? true;

  const setBrandColor = setBrandColorOverride;
  const setInstitutionName = setInstitutionNameOverride;
  const setInstitutionType = setInstitutionTypeOverride;
  const setLogoUrl = setLogoUrlOverride;
  // Keep the functional-updater signature so the address handlers stay unchanged.
  function setAddress(updater: (p: InstitutionAddress) => InstitutionAddress) {
    setAddressOverride(updater(address));
  }

  const canChangeType = !data?.goLiveAt;
  const goLiveLabel = data?.goLiveAt ? `Go-live: ${new Date(data.goLiveAt).toLocaleString()}` : "Not live yet";

  const canSave = useMemo(() => {
    if (!data) return false;
    if (institutionName.trim().length < 2) return false;
    if (!canChangeType && institutionType !== data.institutionType) return false;
    return true;
  }, [data, institutionName, institutionType, canChangeType]);

  const canSaveBranding = useMemo(() => {
    if (!branding) return false;
    if (!brandColor.trim()) return true;
    return isHexColor(brandColor);
  }, [branding, brandColor]);

  async function save() {
    setSaving(true);
    setMutationError(null);
    setMessage(null);
    try {
      const res = await fetch("/api/super-admin/institution-settings", {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          institutionName,
          institutionType,
          logoUrl,
          address,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error((json as { error?: string }).error ?? "Save failed");
      setMessage("Settings updated.");
      await load();
    } catch (e) {
      setMutationError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  const showParentPortal = institutionType === "college";

  async function toggleParentPortal(next: boolean) {
    setSaving(true);
    setMutationError(null);
    setMessage(null);
    try {
      const res = await fetch("/api/super-admin/institution-settings", {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ parentPortalEnabled: next }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error((json as { error?: string }).error ?? "Failed");
      setParentPortalOverride(next);
      setMessage(next ? "Parent portal enabled." : "Parent portal disabled.");
      await load();
    } catch (e) {
      setMutationError(e instanceof Error ? e.message : "Failed");
    } finally {
      setSaving(false);
    }
  }

  async function toggleGoLive(next: boolean) {
    setSaving(true);
    setMutationError(null);
    setMessage(null);
    try {
      const res = await fetch("/api/super-admin/institution-settings", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: next ? "go_live" : "undo_go_live" }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error((json as { error?: string }).error ?? "Failed");
      setMessage(next ? "Marked as live. Institution type is now locked." : "Go-live reverted. Institution type unlocked.");
      await load();
    } catch (e) {
      setMutationError(e instanceof Error ? e.message : "Failed");
    } finally {
      setSaving(false);
    }
  }

  async function saveBranding() {
    setSaving(true);
    setMutationError(null);
    setMessage(null);
    try {
      const res = await fetch("/api/super-admin/branding", {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brandColor }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error((json as { error?: string }).error ?? "Save failed");
      setMessage("Branding updated.");
      await load();
    } catch (e) {
      setMutationError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <SuperAdminShell title="Institution settings">
      {message ? <p className="eduos-admin-message">{message}</p> : null}
      {error ? <p className="eduos-admin-message eduos-admin-message--error">{error}</p> : null}

      {!data ? (
        <SkeletonText lines={4} />
      ) : (
        <>
          <section className="eduos-panel">
            <h2 className="eduos-section-title">Overview</h2>
            <div className="eduos-portal-toolbar" style={{ marginTop: "0.5rem", alignItems: "center" }}>
              <span className="eduos-tag">{goLiveLabel}</span>
              <Button
                type="button"
                variant={data.goLiveAt ? "secondary" : "primary"}
                className="eduos-admin-btn-sm"
                onClick={() => toggleGoLive(!data.goLiveAt)}
                disabled={saving}
              >
                {data.goLiveAt ? "Undo go-live" : "Mark as go-live"}
              </Button>
            </div>
            <p className="eduos-empty eduos-empty--sm" style={{ marginTop: "0.35rem" }}>
              After go-live, the institution type becomes read-only.
            </p>
          </section>

          <section className="eduos-panel">
            <h2 className="eduos-section-title">Institution</h2>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(14rem, 1fr))",
                gap: "0.75rem",
                marginTop: "0.5rem",
              }}
            >
              <label style={{ fontSize: "0.8125rem" }}>
                Name
                <input
                  className="eduos-input eduos-input--field"
                  value={institutionName}
                  onChange={(e) => setInstitutionName(e.target.value)}
                  style={{ display: "block", marginTop: "0.2rem" }}
                />
              </label>
              <label style={{ fontSize: "0.8125rem" }}>
                Type
                <select
                  className="eduos-input eduos-input--field"
                  value={institutionType}
                  onChange={(e) => setInstitutionType(e.target.value as "school" | "college")}
                  style={{ display: "block", marginTop: "0.2rem" }}
                  disabled={!canChangeType}
                >
                  <option value="school">School</option>
                  <option value="college">College</option>
                </select>
              </label>
              <label style={{ fontSize: "0.8125rem", gridColumn: "1 / -1" }}>
                Logo URL
                <input
                  className="eduos-input eduos-input--field"
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  placeholder="https://.../logo.png"
                  style={{ display: "block", marginTop: "0.2rem", width: "100%" }}
                />
              </label>
            </div>
            <div style={{ marginTop: "0.75rem" }}>
              <div style={{ fontWeight: 700, fontSize: "0.875rem" }}>Preview</div>
              <div
                style={{
                  marginTop: "0.35rem",
                  width: 220,
                  height: 90,
                  border: "1px solid var(--eduos-border)",
                  borderRadius: "var(--eduos-radius)",
                  background: "var(--eduos-bg)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "0.5rem",
                }}
              >
                <InstitutionLogo logoUrl={logoUrl.trim() || null} institutionName={institutionName || "Institution"} size={60} />
              </div>
            </div>
          </section>

          {showParentPortal ? (
            <section className="eduos-panel">
              <h2 className="eduos-section-title">Parent portal</h2>
              <p className="eduos-empty eduos-empty--sm" style={{ marginTop: "0.35rem" }}>
                Control whether parents can sign in and view attendance, fees, and results. Applies to college
                institutions only.
              </p>
              <label
                style={{
                  display: "flex",
                  gap: "0.75rem",
                  marginTop: "0.75rem",
                  padding: "0.875rem",
                  border: "1px solid var(--eduos-border)",
                  borderRadius: "var(--eduos-radius)",
                  cursor: saving ? "not-allowed" : "pointer",
                  opacity: saving ? 0.7 : 1,
                }}
              >
                <input
                  type="checkbox"
                  checked={parentPortalEnabled}
                  disabled={saving}
                  onChange={(e) => toggleParentPortal(e.target.checked)}
                  style={{ marginTop: "0.2rem" }}
                />
                <div>
                  <div style={{ fontWeight: 600, fontSize: "0.875rem" }}>Enable parent portal</div>
                  <div style={{ fontSize: "0.8125rem", color: "var(--eduos-text-muted)" }}>
                    When disabled, parent logins are blocked with an institution message.
                  </div>
                </div>
              </label>
            </section>
          ) : null}

          <section className="eduos-panel">
            <h2 className="eduos-section-title">Branding</h2>
            <p className="eduos-section-desc">
              Logo is managed above (Institution → Logo URL). Use this section to set the brand color used across portals.
            </p>
            <div className="eduos-portal-toolbar" style={{ marginTop: "0.5rem", alignItems: "flex-end" }}>
              <label style={{ fontSize: "0.8125rem" }}>
                Brand color (hex)
                <input
                  className="eduos-input eduos-input--field"
                  value={brandColor}
                  onChange={(e) => setBrandColor(e.target.value)}
                  placeholder="#1a5f4a"
                  style={{ display: "block", marginTop: "0.2rem", width: 140 }}
                />
              </label>
              <label style={{ fontSize: "0.8125rem" }}>
                Picker
                <input
                  type="color"
                  value={isHexColor(brandColor) ? brandColor : "#1a5f4a"}
                  onChange={(e) => setBrandColor(e.target.value)}
                  style={{
                    display: "block",
                    marginTop: "0.2rem",
                    width: 56,
                    height: 40,
                    padding: 0,
                    border: "none",
                    background: "transparent",
                  }}
                  aria-label="Pick brand color"
                />
              </label>
              <div
                style={{
                  width: 56,
                  height: 40,
                  borderRadius: 10,
                  border: "1px solid var(--eduos-border)",
                  background: isHexColor(brandColor) ? brandColor : "var(--eduos-card)",
                }}
                aria-hidden
                title="Preview"
              />
              {!isHexColor(brandColor) && brandColor.trim() ? (
                <span className="eduos-admin-message eduos-admin-message--error" style={{ margin: 0 }}>
                  Use a 6-digit hex like #1a5f4a
                </span>
              ) : null}
              <Button
                type="button"
                variant="secondary"
                className="eduos-admin-btn-sm"
                onClick={saveBranding}
                disabled={!canSaveBranding || saving}
              >
                {saving ? "Saving…" : "Save branding"}
              </Button>
            </div>
          </section>

          <section className="eduos-panel">
            <h2 className="eduos-section-title">Address</h2>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(14rem, 1fr))",
                gap: "0.75rem",
                marginTop: "0.5rem",
              }}
            >
              <label style={{ fontSize: "0.8125rem", gridColumn: "1 / -1" }}>
                Address line 1
                <input
                  className="eduos-input eduos-input--field"
                  value={address.line1}
                  onChange={(e) => setAddress((p) => ({ ...p, line1: e.target.value }))}
                  style={{ display: "block", marginTop: "0.2rem", width: "100%" }}
                />
              </label>
              <label style={{ fontSize: "0.8125rem", gridColumn: "1 / -1" }}>
                Address line 2
                <input
                  className="eduos-input eduos-input--field"
                  value={address.line2 ?? ""}
                  onChange={(e) => setAddress((p) => ({ ...p, line2: e.target.value }))}
                  style={{ display: "block", marginTop: "0.2rem", width: "100%" }}
                />
              </label>
              <label style={{ fontSize: "0.8125rem" }}>
                City
                <input
                  className="eduos-input eduos-input--field"
                  value={address.city}
                  onChange={(e) => setAddress((p) => ({ ...p, city: e.target.value }))}
                  style={{ display: "block", marginTop: "0.2rem" }}
                />
              </label>
              <label style={{ fontSize: "0.8125rem" }}>
                State
                <input
                  className="eduos-input eduos-input--field"
                  value={address.state}
                  onChange={(e) => setAddress((p) => ({ ...p, state: e.target.value }))}
                  style={{ display: "block", marginTop: "0.2rem" }}
                />
              </label>
              <label style={{ fontSize: "0.8125rem" }}>
                Pincode
                <input
                  className="eduos-input eduos-input--field"
                  value={address.pincode}
                  onChange={(e) => setAddress((p) => ({ ...p, pincode: e.target.value }))}
                  style={{ display: "block", marginTop: "0.2rem" }}
                />
              </label>
            </div>
          </section>

          <div className="eduos-portal-toolbar">
            <Button type="button" className="eduos-admin-btn-sm" onClick={save} disabled={!canSave || saving}>
              {saving ? "Saving…" : "Save settings"}
            </Button>
          </div>
        </>
      )}
    </SuperAdminShell>
  );
}

