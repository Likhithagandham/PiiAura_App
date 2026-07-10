import type { PlatformPlanDefinition, PlatformTenantPlan } from "@eduos/types";
import { Button } from "@eduos/ui";

export function PlanDefinitionsPanel({
  plans,
  draftPlans,
  busy,
  onDraftChange,
  onSavePlan,
}: {
  plans: PlatformPlanDefinition[];
  draftPlans: Partial<Record<PlatformTenantPlan, PlatformPlanDefinition>>;
  busy: boolean;
  onDraftChange: (
    plan: PlatformTenantPlan,
    draft: PlatformPlanDefinition,
  ) => void;
  onSavePlan: (plan: PlatformTenantPlan) => void;
}) {
  return (
    <section className="eduos-panel">
      <h2 className="eduos-section-title">Plan definitions</h2>
      <p className="eduos-section-desc">
        Configure list pricing and AI credit defaults. Core ERP modules are included on every plan.
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
        {plans.map((p) => {
          const draft = draftPlans[p.plan];
          if (!draft) return null;
          return (
            <div
              key={p.plan}
              style={{
                border: "1px solid var(--eduos-border)",
                borderRadius: "var(--eduos-radius-lg)",
                padding: "1rem",
              }}
            >
              <h3 className="eduos-subsection-title">{draft.label}</h3>
              <div className="eduos-filter-grid" style={{ marginTop: "0.75rem" }}>
                <label className="eduos-filter-grid__label">
                  Display name
                  <input
                    className="eduos-input eduos-input--field"
                    value={draft.label}
                    onChange={(e) =>
                      onDraftChange(p.plan, { ...draft, label: e.target.value })
                    }
                  />
                </label>
                <label className="eduos-filter-grid__label">
                  Price per student (INR/year)
                  <input
                    type="number"
                    className="eduos-input eduos-input--field"
                    value={draft.pricePerStudentInr}
                    onChange={(e) =>
                      onDraftChange(p.plan, {
                        ...draft,
                        pricePerStudentInr: Number(e.target.value) || 0,
                      })
                    }
                  />
                </label>
                <label className="eduos-filter-grid__label">
                  AI credits per student
                  <input
                    type="number"
                    className="eduos-input eduos-input--field"
                    value={draft.includedAiCreditsPerStudent}
                    disabled={!draft.includesAi}
                    onChange={(e) =>
                      onDraftChange(p.plan, {
                        ...draft,
                        includedAiCreditsPerStudent: Number(e.target.value) || 0,
                      })
                    }
                  />
                </label>
              </div>
              <label
                className="eduos-filter-grid__label"
                style={{ display: "block", marginTop: "0.75rem" }}
              >
                Description
                <textarea
                  className="eduos-input eduos-input--field"
                  value={draft.description}
                  onChange={(e) =>
                    onDraftChange(p.plan, { ...draft, description: e.target.value })
                  }
                  rows={2}
                  style={{ maxWidth: "none", width: "100%" }}
                />
              </label>
              <div style={{ marginTop: "0.75rem" }}>
                <Button
                  type="button"
                  className="eduos-admin-btn-sm"
                  disabled={busy}
                  onClick={() => onSavePlan(p.plan)}
                >
                  Save {draft.label}
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
