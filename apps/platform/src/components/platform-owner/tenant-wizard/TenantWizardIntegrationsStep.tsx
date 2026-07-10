import type { Dispatch, SetStateAction } from "react";
import type { CreatePlatformTenantInput } from "@eduos/types";

export function TenantWizardIntegrationsStep({
  form,
  setForm,
}: {
  form: CreatePlatformTenantInput;
  setForm: Dispatch<SetStateAction<CreatePlatformTenantInput>>;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
      {(Object.keys(form.integrations) as (keyof typeof form.integrations)[]).map((key) => (
        <label key={key} style={{ fontSize: "0.875rem", display: "flex", gap: "0.5rem" }}>
          <input
            type="checkbox"
            checked={form.integrations[key]}
            onChange={(e) =>
              setForm((p) => ({
                ...p,
                integrations: { ...p.integrations, [key]: e.target.checked },
              }))
            }
          />
          {key}
        </label>
      ))}
    </div>
  );
}
