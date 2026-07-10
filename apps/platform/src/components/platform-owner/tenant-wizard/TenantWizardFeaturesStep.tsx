import type { Dispatch, SetStateAction } from "react";
import type { CreatePlatformTenantInput } from "@eduos/types";

export function TenantWizardFeaturesStep({
  form,
  setForm,
}: {
  form: CreatePlatformTenantInput;
  setForm: Dispatch<SetStateAction<CreatePlatformTenantInput>>;
}) {
  return (
    <>
      <p className="eduos-section-desc" style={{ marginBottom: "0.75rem" }}>
        Only features included in the <strong>{form.overview.plan}</strong> plan can be enabled.
        Incompatible selections are blocked when you continue.
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        {(Object.keys(form.features) as (keyof typeof form.features)[]).map((key) => (
          <label key={key} style={{ fontSize: "0.875rem", display: "flex", gap: "0.5rem" }}>
            <input
              type="checkbox"
              checked={form.features[key]}
              onChange={(e) =>
                setForm((p) => ({
                  ...p,
                  features: { ...p.features, [key]: e.target.checked },
                }))
              }
            />
            {key.replace(/([A-Z])/g, " $1")}
          </label>
        ))}
      </div>
    </>
  );
}
