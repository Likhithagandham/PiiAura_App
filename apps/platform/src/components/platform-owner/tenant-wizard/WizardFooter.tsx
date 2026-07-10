import Link from "next/link";
import { PLATFORM_OWNER_ROUTES, PLATFORM_TENANT_WIZARD_STEPS } from "@eduos/constants";
import type { PlatformTenantWizardStepId } from "@eduos/constants";
import { Button } from "@eduos/ui";

export function WizardFooter({
  step,
  stepIndex,
  overviewReady,
  branchesReady,
  submitting,
  onBack,
  onNext,
  onSubmit,
}: {
  step: PlatformTenantWizardStepId;
  stepIndex: number;
  overviewReady: boolean;
  branchesReady: boolean;
  submitting: boolean;
  onBack: () => void;
  onNext: () => void;
  onSubmit: () => void;
}) {
  return (
    <div className="eduos-portal-toolbar" style={{ marginTop: "1.25rem" }}>
      {stepIndex > 0 ? (
        <Button type="button" variant="secondary" onClick={onBack}>
          Back
        </Button>
      ) : (
        <Link href={PLATFORM_OWNER_ROUTES.tenants}>Cancel</Link>
      )}
      {stepIndex < PLATFORM_TENANT_WIZARD_STEPS.length - 1 ? (
        <Button
          type="button"
          onClick={onNext}
          disabled={
            (step === "overview" && !overviewReady) ||
            (step === "branches" && !branchesReady)
          }
        >
          Next
        </Button>
      ) : (
        <Button type="button" onClick={onSubmit} disabled={submitting}>
          {submitting ? "Creating…" : "Create tenant"}
        </Button>
      )}
    </div>
  );
}
