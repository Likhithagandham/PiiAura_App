"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import type {
  CreateFeeStructureTemplateInput,
  FeeBranchOverridesData,
  FeeStructureTemplate,
  FeeStructureTemplatesData,
  FeeTemplateScope,
  UpdateFeeBranchOverrideInput,
} from "@eduos/types";
import {
  Button,
  ChartLegend,
  DonutChart,
  EmptyState,
  IconChartBar,
  IconCheckCircle,
  IconRupee,
  SkeletonTable,
  SkeletonText,
  StatCard,
  TruncatedText,
  chartColor,
} from "@eduos/ui";
import { PortalTabs } from "@/components/layout/PortalTabs";
import { SuperAdminShell } from "@/components/super-admin/SuperAdminShell";
import { useSuperAdminUrlTab } from "@/lib/super-admin/use-super-admin-url-tab";
import { useApiData } from "@/lib/queries";

const TABS = ["templates", "overrides"] as const;
type TabId = (typeof TABS)[number];

const SCOPE_LABEL: Record<FeeTemplateScope, string> = {
  tuition: "Tuition",
  hostel: "Hostel",
  transport: "Transport",
  exam: "Exam",
  other: "Other",
};

const SCOPE_ORDER: FeeTemplateScope[] = ["tuition", "hostel", "transport", "exam", "other"];

function templateValue(t: FeeStructureTemplate): number {
  return t.items.reduce((sum, it) => sum + it.amount, 0);
}

function formatInr(n: number): string {
  return `₹${n.toLocaleString("en-IN")}`;
}

function TemplatesTab() {
  const { data, error: queryError, refetch } = useApiData<FeeStructureTemplatesData>(
    "/api/super-admin/fee-templates",
  );
  const load = refetch;
  const [mutationError, setMutationError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const error = mutationError ?? (queryError ? "Failed to load" : null);

  const [form, setForm] = useState<CreateFeeStructureTemplateInput>({
    name: "",
    scope: "tuition",
    academicYearLabel: "2026-27",
    items: [{ label: "Tuition fee", amount: 0, mandatory: true }],
  });

  const templateStats = useMemo(() => {
    if (!data) return null;
    const activeCount = data.templates.filter((t) => t.isActive).length;
    const totalValue = data.templates
      .filter((t) => t.isActive)
      .reduce((sum, t) => sum + templateValue(t), 0);
    const byScope = SCOPE_ORDER.map((scope, i) => ({
      label: SCOPE_LABEL[scope],
      value: data.templates
        .filter((t) => t.scope === scope && t.isActive)
        .reduce((sum, t) => sum + templateValue(t), 0),
      color: chartColor(i),
    })).filter((s) => s.value > 0);
    return { activeCount, totalValue, byScope };
  }, [data]);

  async function create() {
    setSaving(true);
    setMutationError(null);
    try {
      const res = await fetch("/api/super-admin/fee-templates", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error((json as { error?: string }).error ?? "Create failed");
      setForm({
        name: "",
        scope: "tuition",
        academicYearLabel: form.academicYearLabel,
        items: [{ label: "Tuition fee", amount: 0, mandatory: true }],
      });
      await load();
    } catch (e) {
      setMutationError(e instanceof Error ? e.message : "Create failed");
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(t: FeeStructureTemplate) {
    setMutationError(null);
    const res = await fetch("/api/super-admin/fee-templates/actions", {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "set_active", templateId: t.id, isActive: !t.isActive }),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      setMutationError((json as { error?: string }).error ?? "Update failed");
      return;
    }
    await load();
  }

  return (
    <>
      {error ? <p className="eduos-admin-message eduos-admin-message--error">{error}</p> : null}

      <section className="eduos-panel">
        <h2 className="eduos-section-title">Create fee template</h2>
        <p className="eduos-section-desc">Define a shared structure; branches can override amounts locally.</p>

        <div className="eduos-portal-toolbar" style={{ marginTop: "0.5rem" }}>
          <label style={{ fontSize: "0.8125rem", flex: 1, minWidth: 240 }}>
            Template name
            <input
              className="eduos-input eduos-input--field"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              placeholder="e.g. Tuition (Standard) — AY 2026-27"
              style={{ display: "block", marginTop: "0.2rem" }}
            />
          </label>
          <label style={{ fontSize: "0.8125rem" }}>
            Scope
            <select
              className="eduos-input eduos-input--field"
              value={form.scope}
              onChange={(e) => setForm((p) => ({ ...p, scope: e.target.value as FeeTemplateScope }))}
              style={{ display: "block", marginTop: "0.2rem" }}
            >
              <option value="tuition">Tuition</option>
              <option value="hostel">Hostel</option>
              <option value="transport">Transport</option>
              <option value="exam">Exam</option>
              <option value="other">Other</option>
            </select>
          </label>
          <label style={{ fontSize: "0.8125rem" }}>
            Academic year
            <input
              className="eduos-input eduos-input--field"
              value={form.academicYearLabel}
              onChange={(e) => setForm((p) => ({ ...p, academicYearLabel: e.target.value }))}
              placeholder="2026-27"
              style={{ display: "block", marginTop: "0.2rem", width: 120 }}
            />
          </label>
        </div>

        <div style={{ marginTop: "0.75rem" }}>
          <div style={{ fontWeight: 700, fontSize: "0.875rem" }}>Line items</div>
          <div style={{ marginTop: "0.35rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {form.items.map((it, idx) => (
              <div key={it.label ? `${it.label}-${idx}` : idx} className="eduos-portal-toolbar" style={{ gap: "0.5rem" }}>
                <input
                  className="eduos-input eduos-input--field"
                  value={it.label}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      items: p.items.map((x, i) => (i === idx ? { ...x, label: e.target.value } : x)),
                    }))
                  }
                  placeholder="Label"
                  style={{ flex: 1, minWidth: 200 }}
                />
                <input
                  className="eduos-input eduos-input--field"
                  type="number"
                  value={it.amount}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      items: p.items.map((x, i) => (i === idx ? { ...x, amount: Number(e.target.value) } : x)),
                    }))
                  }
                  placeholder="Amount"
                  style={{ width: 120 }}
                />
                <label style={{ fontSize: "0.8125rem", display: "flex", alignItems: "center", gap: "0.35rem" }}>
                  <input
                    type="checkbox"
                    checked={it.mandatory}
                    onChange={(e) =>
                      setForm((p) => ({
                        ...p,
                        items: p.items.map((x, i) => (i === idx ? { ...x, mandatory: e.target.checked } : x)),
                      }))
                    }
                  />
                  Mandatory
                </label>
                <Button
                  type="button"
                  variant="secondary"
                  className="eduos-admin-btn-sm"
                  onClick={() =>
                    setForm((p) => ({ ...p, items: p.items.filter((_, i) => i !== idx) || p.items }))
                  }
                  disabled={form.items.length <= 1}
                >
                  Remove
                </Button>
              </div>
            ))}
            <div className="eduos-portal-toolbar">
              <Button
                type="button"
                variant="secondary"
                className="eduos-admin-btn-sm"
                onClick={() =>
                  setForm((p) => ({
                    ...p,
                    items: [...p.items, { label: "", amount: 0, mandatory: false }],
                  }))
                }
              >
                Add item
              </Button>
              <Button type="button" className="eduos-admin-btn-sm" onClick={create} disabled={saving}>
                {saving ? "Creating…" : "Create template"}
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="eduos-panel">
        <h2 className="eduos-section-title">Templates</h2>
        {!data ? (
          <SkeletonTable columns={6} rows={5} />
        ) : data.templates.length === 0 ? (
          <EmptyState title="No templates yet" description="Create a fee template to get started." />
        ) : (
          <>
            {templateStats ? (
              <>
                <div className="eduos-admin-stat-grid" style={{ marginBottom: "1rem" }}>
                  <StatCard label="Templates" value={data.templates.length} icon={<IconChartBar />} accent="#2563eb" />
                  <StatCard label="Active" value={templateStats.activeCount} icon={<IconCheckCircle />} accent="#1a5f4a" />
                  <StatCard label="Active fee value" value={formatInr(templateStats.totalValue)} icon={<IconRupee />} accent="#7c3aed" />
                </div>
                {templateStats.byScope.length > 0 ? (
                  <div className="eduos-chart-split" style={{ marginBottom: "1rem" }}>
                    <DonutChart data={templateStats.byScope} centerValue={formatInr(templateStats.totalValue)} centerLabel="active" />
                    <div className="eduos-chart-split__legend">
                      <ChartLegend
                        items={templateStats.byScope.map((s) => ({ label: s.label, color: s.color, value: formatInr(s.value) }))}
                      />
                    </div>
                  </div>
                ) : null}
              </>
            ) : null}
            <div className="eduos-table-wrap">
            <table className="eduos-admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th className="eduos-admin-table__nowrap">Scope</th>
                  <th className="eduos-admin-table__nowrap">Year</th>
                  <th className="eduos-admin-table__nowrap">Items</th>
                  <th className="eduos-admin-table__nowrap">Status</th>
                  <th className="eduos-admin-table__nowrap">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.templates.map((t) => (
                  <tr key={t.id}>
                    <td style={{ fontWeight: 700 }}>
                      <TruncatedText text={t.name} maxWidth="16rem" />
                    </td>
                    <td className="eduos-admin-table__nowrap">{SCOPE_LABEL[t.scope]}</td>
                    <td className="eduos-admin-table__nowrap">{t.academicYearLabel}</td>
                    <td className="eduos-admin-table__nowrap">{t.items.length}</td>
                    <td className="eduos-admin-table__nowrap">{t.isActive ? "Active" : "Inactive"}</td>
                    <td className="eduos-admin-table__actions">
                      <div className="eduos-portal-toolbar">
                        <Button
                          type="button"
                          variant={t.isActive ? "secondary" : "primary"}
                          className="eduos-admin-btn-sm"
                          onClick={() => toggleActive(t)}
                        >
                          {t.isActive ? "Deactivate" : "Activate"}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </>
        )}
      </section>
    </>
  );
}

function OverridesTab() {
  const { data, error: queryError, refetch: refetchOverrides } =
    useApiData<FeeBranchOverridesData>("/api/super-admin/fee-overrides");
  const { data: templatesData, refetch: refetchTemplates } =
    useApiData<FeeStructureTemplatesData>("/api/super-admin/fee-templates");
  const load = () => Promise.all([refetchOverrides(), refetchTemplates()]);
  const fullTemplates = useMemo(() => templatesData?.templates ?? [], [templatesData]);

  const [mutationError, setMutationError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Branch/template selection defaults to the first available until the user picks.
  const [branchOverride, setBranchOverride] = useState<string | null>(null);
  const [templateOverride, setTemplateOverride] = useState<string | null>(null);
  const branchId = branchOverride ?? data?.branches[0]?.id ?? "";
  const templateId = templateOverride ?? data?.templates[0]?.id ?? "";

  const [items, setItems] = useState<Array<{ id?: string; label: string; amount: number; mandatory: boolean }>>([]);

  const error = mutationError ?? (queryError ? "Failed to load" : null);

  useEffect(() => {
    if (!data || !branchId || !templateId) return;
    const override = data.overrides.find((o) => o.branchId === branchId && o.templateId === templateId);
    if (override) {
      setItems(override.items.map((x) => ({ id: x.id, label: x.label, amount: x.amount, mandatory: x.mandatory })));
      return;
    }
    const t = fullTemplates.find((x) => x.id === templateId);
    if (t) {
      setItems(t.items.map((x) => ({ id: x.id, label: x.label, amount: x.amount, mandatory: x.mandatory })));
    }
  }, [data, branchId, templateId, fullTemplates]);

  const branchName = useMemo(
    () => data?.branches.find((b) => b.id === branchId)?.name ?? "Branch",
    [data, branchId],
  );
  const templateName = useMemo(
    () => data?.templates.find((t) => t.id === templateId)?.name ?? "Template",
    [data, templateId],
  );

  async function saveOverride() {
    if (!branchId || !templateId) return;
    setSaving(true);
    setMutationError(null);
    const body: UpdateFeeBranchOverrideInput = { branchId, templateId, items };
    try {
      const res = await fetch("/api/super-admin/fee-overrides", {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error((json as { error?: string }).error ?? "Save failed");
      await load();
    } catch (e) {
      setMutationError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      {error ? <p className="eduos-admin-message eduos-admin-message--error">{error}</p> : null}
      <section className="eduos-panel">
        <h2 className="eduos-section-title">Branch overrides</h2>
        <p className="eduos-section-desc">Override template amounts locally for a specific branch.</p>

        {!data ? (
          <SkeletonText lines={4} />
        ) : (
          <>
            <div className="eduos-portal-toolbar" style={{ marginTop: "0.5rem" }}>
              <label style={{ fontSize: "0.8125rem" }}>
                Branch
                <select
                  className="eduos-input eduos-input--field"
                  value={branchId}
                  onChange={(e) => setBranchOverride(e.target.value)}
                  style={{ display: "block", marginTop: "0.2rem" }}
                >
                  {data.branches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </label>
              <label style={{ fontSize: "0.8125rem", flex: 1, minWidth: 240 }}>
                Template
                <select
                  className="eduos-input eduos-input--field"
                  value={templateId}
                  onChange={(e) => setTemplateOverride(e.target.value)}
                  style={{ display: "block", marginTop: "0.2rem", width: "100%" }}
                >
                  {data.templates.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div style={{ marginTop: "0.75rem" }}>
              <div style={{ fontWeight: 700, fontSize: "0.875rem" }}>
                Editing: {branchName} · {templateName}
              </div>
              <div style={{ marginTop: "0.5rem" }} className="eduos-table-wrap">
                <table className="eduos-admin-table">
                  <thead>
                    <tr>
                      <th>Label</th>
                      <th className="eduos-admin-table__nowrap">Amount</th>
                      <th className="eduos-admin-table__nowrap">Mandatory</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((it, idx) => (
                      <tr key={it.id ?? idx}>
                        <td>
                          <input
                            className="eduos-input eduos-input--field"
                            value={it.label}
                            onChange={(e) =>
                              setItems((p) => p.map((x, i) => (i === idx ? { ...x, label: e.target.value } : x)))
                            }
                          />
                        </td>
                        <td className="eduos-admin-table__nowrap">
                          <input
                            className="eduos-input eduos-input--field"
                            type="number"
                            value={it.amount}
                            onChange={(e) =>
                              setItems((p) => p.map((x, i) => (i === idx ? { ...x, amount: Number(e.target.value) } : x)))
                            }
                            style={{ width: 120 }}
                          />
                        </td>
                        <td className="eduos-admin-table__nowrap">
                          <input
                            type="checkbox"
                            checked={it.mandatory}
                            onChange={(e) =>
                              setItems((p) =>
                                p.map((x, i) => (i === idx ? { ...x, mandatory: e.target.checked } : x)),
                              )
                            }
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="eduos-portal-toolbar" style={{ marginTop: "0.5rem" }}>
                <Button type="button" className="eduos-admin-btn-sm" onClick={saveOverride} disabled={saving}>
                  {saving ? "Saving…" : "Save override"}
                </Button>
              </div>
            </div>
          </>
        )}
      </section>
    </>
  );
}

function FeesContent() {
  const [tab, setTab] = useSuperAdminUrlTab(TABS, "templates");
  return (
    <>
      <PortalTabs
        className="eduos-portal-tabs"
        active={tab}
        onChange={setTab}
        tabs={[
          { id: "templates", label: "Templates" },
          { id: "overrides", label: "Branch overrides" },
        ]}
      />
      {tab === "templates" ? <TemplatesTab /> : null}
      {tab === "overrides" ? <OverridesTab /> : null}
    </>
  );
}

export function SuperAdminFeesView({ embedded = false }: { embedded?: boolean }) {
  const body = (
    <Suspense fallback={<SkeletonText lines={4} />}>
      <FeesContent />
    </Suspense>
  );

  if (embedded) return body;
  return (
    <SuperAdminShell title="Fee templates">
      {body}
    </SuperAdminShell>
  );
}

export default function SuperAdminFeesPage() {
  // Legacy route: keep working, but prefer the merged Finance module.
  useEffect(() => {
    window.location.replace("/super-admin/finance?tab=fees");
  }, []);
  return <p className="eduos-empty">Redirecting…</p>;
}

