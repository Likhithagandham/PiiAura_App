"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import type {
  CreatePlatformTenantInput,
  PlatformPlanLimitBlockedResponse,
  PlatformPlansData,
  SubdomainAvailabilityResult,
} from "@eduos/types";
import {
  PLATFORM_OWNER_ROUTES,
  PLATFORM_TENANT_WIZARD_STEPS,
  type PlatformTenantWizardStepId,
} from "@eduos/constants";
import { PlatformPlanLimitModal } from "@/components/platform-owner/PlatformPlanLimitModal";
import { PlatformOwnerShell } from "@/components/platform-owner/PlatformOwnerShell";
import { TenantWizardBranchesStep } from "@/components/platform-owner/tenant-wizard/TenantWizardBranchesStep";
import { TenantWizardFeaturesStep } from "@/components/platform-owner/tenant-wizard/TenantWizardFeaturesStep";
import { TenantWizardIntegrationsStep } from "@/components/platform-owner/tenant-wizard/TenantWizardIntegrationsStep";
import { TenantWizardOverviewStep } from "@/components/platform-owner/tenant-wizard/TenantWizardOverviewStep";
import { WizardFooter } from "@/components/platform-owner/tenant-wizard/WizardFooter";
import { WizardStepNav } from "@/components/platform-owner/tenant-wizard/WizardStepNav";
import {
  assigneeFilled,
  assigneePartial,
  EMPTY,
  EMPTY_ASSIGNEE,
  EMPTY_BRANCH_ENTRY,
} from "@/components/platform-owner/tenant-wizard/wizard-utils";
import { platformFetch } from "@/lib/platform-owner/fetch";
import { useApiData } from "@/lib/queries";

export default function NewTenantWizardPage() {
  const router = useRouter();
  const [step, setStep] = useState<PlatformTenantWizardStepId>("overview");
  const [form, setForm] = useState<CreatePlatformTenantInput>(EMPTY);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [planLimitModal, setPlanLimitModal] = useState<PlatformPlanLimitBlockedResponse | null>(
    null,
  );

  const stepIndex = PLATFORM_TENANT_WIZARD_STEPS.findIndex((s) => s.id === step);

  const [debouncedSubdomainQuery, setDebouncedSubdomainQuery] = useState({
    name: form.overview.institutionName.trim(),
    sub: form.overview.subdomain.trim(),
  });
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSubdomainQuery({
        name: form.overview.institutionName.trim(),
        sub: form.overview.subdomain.trim(),
      });
    }, 400);
    return () => clearTimeout(timer);
  }, [form.overview.institutionName, form.overview.subdomain]);

  const subdomainCheckPath = useMemo(() => {
    const { name, sub } = debouncedSubdomainQuery;
    if (!name && !sub) return null;
    const params = new URLSearchParams({ q: sub });
    if (!sub && name) params.set("fallback", name);
    return `/api/platform-owner/subdomains/check?${params.toString()}`;
  }, [debouncedSubdomainQuery]);

  const {
    data: subdomainCheck,
    isFetching: subdomainChecking,
  } = useApiData<SubdomainAvailabilityResult>(subdomainCheckPath, {
    enabled: step === "overview",
  });

  const { data: plansData } = useApiData<PlatformPlansData>("/api/platform-owner/plans");

  const overviewReady =
    form.overview.institutionName.trim().length > 0 &&
    subdomainCheck?.available === true &&
    !subdomainChecking;

  useEffect(() => {
    if (!form.branches) {
      setForm((p) => ({ ...p, branches: EMPTY.branches }));
      return;
    }
    const legacyNames = (form.branches as { names?: string[] }).names;
    if (!form.branches.entries && legacyNames) {
      setForm((p) => ({
        ...p,
        branches: {
          ...p.branches,
          entries: legacyNames.map((name) => ({
            name,
            assignees: name.trim() ? [EMPTY_ASSIGNEE("admin")] : [EMPTY_ASSIGNEE("super_admin")],
          })),
        },
      }));
      return;
    }
    if (!form.branches.entries) {
      setForm((p) => ({
        ...p,
        branches: { ...p.branches, entries: [EMPTY_BRANCH_ENTRY()] },
      }));
    }
  }, [form.branches]);

  const branches = form.branches ?? EMPTY.branches;
  const branchEntries = branches.entries ?? [EMPTY_BRANCH_ENTRY()];
  const superAdminCount = branchEntries
    .flatMap((entry) => entry.assignees)
    .filter((a) => a.role === "super_admin" && assigneeFilled(a)).length;
  const branchesReady =
    branches.hqCity.trim().length > 0 &&
    branches.hqState.trim().length > 0 &&
    branchEntries.map((e) => e.name.trim()).filter(Boolean).length > 0 &&
    superAdminCount === 1 &&
    !branchEntries
      .flatMap((entry) => entry.assignees)
      .some((a) => assigneePartial(a));

  async function validateFeatureLimits(): Promise<boolean> {
    const res = await platformFetch("/api/platform-owner/plan-limits/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        context: "wizard_features",
        plan: form.overview.plan,
        features: form.features,
      }),
    });
    const json = await res.json().catch(() => ({}));
    if (res.status === 409 && (json as PlatformPlanLimitBlockedResponse).limitBlocked) {
      setPlanLimitModal(json as PlatformPlanLimitBlockedResponse);
      return false;
    }
    return res.ok;
  }

  function goToStep(target: PlatformTenantWizardStepId) {
    if (target === step) return;
    setError(null);
    setStep(target);
  }

  async function goNext() {
    setError(null);
    if (step === "overview") {
      if (!overviewReady) {
        setError(
          subdomainCheck && !subdomainCheck.available
            ? subdomainCheck.message
            : "Enter an institution name and choose an available subdomain.",
        );
        return;
      }
    }
    if (step === "branches") {
      if (!branches.hqCity.trim() || !branches.hqState.trim()) {
        setError("Fill primary city and state.");
        return;
      }
      if (branchEntries.map((e) => e.name.trim()).filter(Boolean).length === 0) {
        setError("Add at least one branch name.");
        return;
      }
      if (branchEntries.flatMap((entry) => entry.assignees).some((a) => assigneePartial(a))) {
        setError("Each role assignment needs both a name and phone, or leave both empty.");
        return;
      }
      if (superAdminCount !== 1) {
        setError("Assign exactly one super admin with name and phone.");
        return;
      }
    }
    if (step === "features") {
      const ok = await validateFeatureLimits();
      if (!ok) return;
    }
    const next = PLATFORM_TENANT_WIZARD_STEPS[stepIndex + 1];
    if (next) setStep(next.id);
  }

  function goBack() {
    const prev = PLATFORM_TENANT_WIZARD_STEPS[stepIndex - 1];
    if (prev) setStep(prev.id);
  }

  async function submit() {
    setSubmitting(true);
    setError(null);
    try {
      if (!overviewReady) {
        throw new Error("Subdomain is not available. Go back to step 1 and fix it.");
      }
      const featuresOk = await validateFeatureLimits();
      if (!featuresOk) return;

      const res = await platformFetch("/api/platform-owner/tenants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          overview: {
            ...form.overview,
            subdomain: subdomainCheck?.subdomain ?? form.overview.subdomain,
          },
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (res.status === 409 && (json as PlatformPlanLimitBlockedResponse).limitBlocked) {
        setPlanLimitModal(json as PlatformPlanLimitBlockedResponse);
        return;
      }
      if (!res.ok) throw new Error((json as { error?: string }).error ?? "Failed to create tenant");
      const tenant = (json as { tenant: { id: string } }).tenant;
      router.push(PLATFORM_OWNER_ROUTES.tenantDetail(tenant.id));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create tenant");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <PlatformOwnerShell title="New tenant">
      {planLimitModal ? (
        <PlatformPlanLimitModal
          blocked={planLimitModal}
          onClose={() => setPlanLimitModal(null)}
        />
      ) : null}

      <p className="eduos-body-sm" style={{ marginBottom: "1rem" }}>
        Overview → Branches → Features → Integrations. Validates
        subdomain uniqueness on step 1; blocks features that exceed the selected plan.
      </p>

      <WizardStepNav step={step} onStepChange={goToStep} />

      {error ? <p className="eduos-admin-message eduos-admin-message--error">{error}</p> : null}

      <section className="eduos-panel">
        {step === "overview" ? (
          <TenantWizardOverviewStep
            form={form}
            setForm={setForm}
            subdomainCheck={subdomainCheck}
            subdomainChecking={subdomainChecking}
            planCatalog={plansData?.catalog}
          />
        ) : null}

        {step === "branches" ? (
          <TenantWizardBranchesStep
            form={form}
            setForm={setForm}
            branchEntries={branchEntries}
          />
        ) : null}

        {step === "features" ? (
          <TenantWizardFeaturesStep form={form} setForm={setForm} />
        ) : null}

        {step === "integrations" ? (
          <TenantWizardIntegrationsStep form={form} setForm={setForm} />
        ) : null}

        <WizardFooter
          step={step}
          stepIndex={stepIndex}
          overviewReady={overviewReady}
          branchesReady={branchesReady}
          submitting={submitting}
          onBack={goBack}
          onNext={() => void goNext()}
          onSubmit={() => void submit()}
        />
      </section>
    </PlatformOwnerShell>
  );
}
