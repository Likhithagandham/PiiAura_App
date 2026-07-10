import type { Dispatch, SetStateAction } from "react";
import type {
  CreatePlatformTenantInput,
  PlatformPlanLimits,
  SubdomainAvailabilityResult,
} from "@eduos/types";

function formatInr(n: number): string {
  return `₹${n.toLocaleString("en-IN")}`;
}

export function TenantWizardOverviewStep({
  form,
  setForm,
  subdomainCheck,
  subdomainChecking,
  planCatalog = [],
}: {
  form: CreatePlatformTenantInput;
  setForm: Dispatch<SetStateAction<CreatePlatformTenantInput>>;
  subdomainCheck: SubdomainAvailabilityResult | undefined;
  subdomainChecking: boolean;
  planCatalog?: PlatformPlanLimits[];
}) {
  const catalogByPlan = Object.fromEntries(planCatalog.map((p) => [p.plan, p]));

  function planOptionLabel(plan: CreatePlatformTenantInput["overview"]["plan"]): string {
    const entry = catalogByPlan[plan];
    if (!entry) return plan === "ai" ? "AI ERP" : "Standard ERP";
    return `${entry.label} — ${formatInr(entry.pricePerStudentInr)}/student/year`;
  }
  return (
    <div className="eduos-portal-toolbar" style={{ flexDirection: "column", alignItems: "stretch" }}>
      <label style={{ fontSize: "0.8125rem" }}>
        Institution name
        <input
          className="eduos-input eduos-input--field"
          value={form.overview.institutionName}
          onChange={(e) =>
            setForm((p) => ({
              ...p,
              overview: { ...p.overview, institutionName: e.target.value },
            }))
          }
          style={{ display: "block", marginTop: "0.2rem", width: "100%" }}
        />
      </label>
      <label style={{ fontSize: "0.8125rem" }}>
        Subdomain
        <input
          className="eduos-input eduos-input--field"
          value={form.overview.subdomain}
          onChange={(e) =>
            setForm((p) => ({
              ...p,
              overview: { ...p.overview, subdomain: e.target.value.toLowerCase() },
            }))
          }
          placeholder="Leave empty to auto-generate from name"
          style={{ display: "block", marginTop: "0.2rem", width: "100%" }}
          aria-describedby="subdomain-hint"
        />
        <span
          id="subdomain-hint"
          style={{
            display: "block",
            marginTop: "0.35rem",
            fontSize: "0.75rem",
            color:
              subdomainCheck?.available === true
                ? "var(--eduos-success, #15803d)"
                : subdomainCheck && !subdomainCheck.available
                  ? "var(--eduos-danger)"
                  : "var(--eduos-text-muted)",
          }}
        >
          {subdomainChecking
            ? "Checking availability…"
            : subdomainCheck
              ? subdomainCheck.message
              : "Unique subdomain enforced at database level (checked live)."}
        </span>
        {subdomainCheck?.available ? (
          <span style={{ fontSize: "0.75rem", color: "var(--eduos-text-muted)" }}>
            Portal URL: <code>{subdomainCheck.subdomain}.localhost:3000</code>
          </span>
        ) : null}
      </label>
      <label style={{ fontSize: "0.8125rem" }}>
        Institution type
        <select
          className="eduos-input eduos-input--field"
          value={form.overview.institutionType}
          onChange={(e) =>
            setForm((p) => ({
              ...p,
              overview: {
                ...p.overview,
                institutionType: e.target.value as CreatePlatformTenantInput["overview"]["institutionType"],
              },
            }))
          }
          style={{ display: "block", marginTop: "0.2rem" }}
        >
          <option value="school">School</option>
          <option value="college">College</option>
        </select>
      </label>
      <label style={{ fontSize: "0.8125rem" }}>
        Plan
        <select
          className="eduos-input eduos-input--field"
          value={form.overview.plan}
          onChange={(e) =>
            setForm((p) => ({
              ...p,
              overview: {
                ...p.overview,
                plan: e.target.value as CreatePlatformTenantInput["overview"]["plan"],
              },
            }))
          }
          style={{ display: "block", marginTop: "0.2rem" }}
        >
          <option value="standard">{planOptionLabel("standard")}</option>
          <option value="ai">{planOptionLabel("ai")}</option>
        </select>
      </label>
    </div>
  );
}
