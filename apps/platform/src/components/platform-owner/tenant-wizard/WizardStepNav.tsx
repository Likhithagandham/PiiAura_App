import { PLATFORM_TENANT_WIZARD_STEPS, type PlatformTenantWizardStepId } from "@eduos/constants";

export function WizardStepNav({
  step,
  onStepChange,
}: {
  step: PlatformTenantWizardStepId;
  onStepChange: (target: PlatformTenantWizardStepId) => void;
}) {
  return (
    <ol
      className="eduos-wizard-steps"
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "0.5rem",
        listStyle: "none",
        marginBottom: "1.25rem",
        fontSize: "0.8125rem",
        padding: 0,
      }}
    >
      {PLATFORM_TENANT_WIZARD_STEPS.map((s, i) => {
        const active = s.id === step;
        return (
          <li key={s.id}>
            <button
              type="button"
              className="eduos-wizard-steps__tab"
              aria-current={active ? "step" : undefined}
              onClick={() => onStepChange(s.id)}
              style={{
                padding: "0.35rem 0.65rem",
                borderRadius: "6px",
                border: "none",
                font: "inherit",
                cursor: "pointer",
                background: active ? "var(--eduos-primary)" : "var(--eduos-surface-muted)",
                color: active ? "#fff" : "inherit",
              }}
            >
              {i + 1}. {s.label}
            </button>
          </li>
        );
      })}
    </ol>
  );
}
