"use client";

import type { ChangeStudentPasswordInput, StudentProfileFormData } from "@eduos/types";
import { Button, SkeletonText } from "@eduos/ui";
import { useState } from "react";
import { useApiData } from "@/lib/queries";

export function StudentProfilePanel() {
  const { data: profile, error: queryError, refetch } = useApiData<StudentProfileFormData>(
    "/api/student/profile",
  );
  const load = refetch;
  // Editable fields default to the fetched profile; a non-null override means the
  // user has typed something. Deriving avoids setState-in-effect on load.
  const [nameOverride, setNameOverride] = useState<string | null>(null);
  const [phoneOverride, setPhoneOverride] = useState<string | null>(null);
  const name = nameOverride ?? profile?.name ?? "";
  const ownPhone = phoneOverride ?? profile?.ownPhone ?? "";
  const [passwordForm, setPasswordForm] = useState<ChangeStudentPasswordInput>({
    currentPassword: "",
    newPassword: "",
  });
  const [message, setMessage] = useState<string | null>(null);

  const error = queryError ? "Failed to load." : null;

  if (error) return <p className="eduos-admin-message eduos-admin-message--error">{error}</p>;
  if (!profile) return <SkeletonText lines={4} />;

  return (
    <>
      {message ? <p className="eduos-admin-message">{message}</p> : null}
      <section className="eduos-panel">
        <h2 className="eduos-section-title">Profile details</h2>
        <p className="eduos-section-desc">Roll number and class are read-only.</p>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(10rem, 1fr))",
            gap: "0.5rem",
            marginTop: "0.5rem",
            maxWidth: "32rem",
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
            Your phone
            <input
              className="eduos-input eduos-input--field"
              style={{ display: "block", marginTop: "0.2rem", width: "100%" }}
              value={ownPhone}
              onChange={(e) => setPhoneOverride(e.target.value)}
              placeholder="+91…"
            />
          </label>
          <label style={{ fontSize: "0.8125rem" }}>
            Roll / ID
            <input
              className="eduos-input eduos-input--field"
              style={{ display: "block", marginTop: "0.2rem", width: "100%" }}
              value={profile.customLoginId ?? ""}
              disabled
            />
          </label>
          <label style={{ fontSize: "0.8125rem" }}>
            Class
            <input
              className="eduos-input eduos-input--field"
              style={{ display: "block", marginTop: "0.2rem", width: "100%" }}
              value={profile.classLabel}
              disabled
            />
          </label>
        </div>
        <div style={{ marginTop: "0.5rem" }}>
          <Button
            type="button"
            className="eduos-admin-btn-sm"
            onClick={async () => {
              setMessage(null);
              const res = await fetch("/api/student/profile", {
                method: "PATCH",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, ownPhone }),
              });
              const json = await res.json().catch(() => ({}));
              if (!res.ok) {
                setMessage((json as { error?: string }).error ?? "Save failed");
                return;
              }
              setMessage("Profile updated.");
              await load();
            }}
          >
            Save profile
          </Button>
        </div>
      </section>
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
              const res = await fetch("/api/student/profile", {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(passwordForm),
              });
              const json = await res.json().catch(() => ({}));
              if (!res.ok) {
                setMessage((json as { error?: string }).error ?? "Password change failed");
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
    </>
  );
}
