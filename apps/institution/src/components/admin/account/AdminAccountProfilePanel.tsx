"use client";

import type { AdminAccountProfileData } from "@eduos/types";
import { SkeletonText } from "@eduos/ui";
import { useApiData } from "@/lib/queries";

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function ProfileField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt style={{ fontSize: "0.75rem", color: "var(--eduos-muted, #64748b)", marginBottom: "0.15rem" }}>
        {label}
      </dt>
      <dd style={{ margin: 0, fontSize: "0.9375rem", fontWeight: 500 }}>{value || "—"}</dd>
    </div>
  );
}

export function AdminAccountProfilePanel() {
  const { data: profile, error: queryError } = useApiData<AdminAccountProfileData>("/api/admin/account");
  const error = queryError ? (queryError instanceof Error ? queryError.message : "Failed to load profile.") : null;

  if (error) return <p className="eduos-admin-message eduos-admin-message--error">{error}</p>;
  if (!profile) return <SkeletonText lines={6} />;

  const initials = profile.name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const institutionTypeLabel = profile.institutionType === "college" ? "College" : "School";

  return (
    <section className="eduos-panel">
      <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1rem" }}>
        <div
          aria-hidden
          style={{
            width: "3rem",
            height: "3rem",
            borderRadius: "999px",
            background: "var(--eduos-brand-muted, #e8f5f0)",
            color: "var(--eduos-brand, #1a5f4a)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 600,
            fontSize: "1rem",
          }}
        >
          {initials}
        </div>
        <div>
          <h2 className="eduos-section-title" style={{ margin: 0 }}>
            {profile.name}
          </h2>
          <p className="eduos-section-desc" style={{ margin: "0.15rem 0 0" }}>
            {profile.roleLabel} · {profile.institutionName}
          </p>
        </div>
      </div>

      <dl
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(12rem, 1fr))",
          gap: "1rem 1.5rem",
          margin: 0,
        }}
      >
        <ProfileField label="Role" value={profile.roleLabel} />
        <ProfileField label="Institution" value={profile.institutionName} />
        <ProfileField label="Branch" value={profile.branchName ?? "—"} />
        <ProfileField label="Institution type" value={institutionTypeLabel} />
        <ProfileField label="Login phone" value={profile.phone ?? "—"} />
        <ProfileField label="Email" value={profile.email ?? "—"} />
        <ProfileField label="Member since" value={formatDate(profile.dateJoined)} />
      </dl>
    </section>
  );
}
