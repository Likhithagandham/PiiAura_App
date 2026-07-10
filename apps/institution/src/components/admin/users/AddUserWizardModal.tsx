"use client";

import { useEffect, useState } from "react";
import type { AssignableRole, CreateUserInput, MultiRoleWarning } from "@eduos/types";
import { Button, Input } from "@eduos/ui";
import { AdminModal } from "../AdminModal";

const STEPS = ["Contact details", "Role & linking", "Review & invite"] as const;

const ROLES: { value: AssignableRole; label: string }[] = [
  { value: "admin", label: "Admin" },
  { value: "faculty", label: "Faculty" },
  { value: "student", label: "Student" },
  { value: "parent", label: "Parent" },
];

export function AddUserWizardModal({
  onClose,
  onCreated,
  apiBase = "/api/admin/users",
  checkMultiRoleApiBase = "/api/admin/users/check-multi-role",
  branches,
  requireBranch = false,
  defaultBranchId,
}: {
  onClose: () => void;
  onCreated: (msg: string) => void;
  apiBase?: string;
  checkMultiRoleApiBase?: string;
  branches?: { id: string; name: string }[];
  requireBranch?: boolean;
  defaultBranchId?: string;
}) {
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<AssignableRole>("faculty");
  const [sendInvite, setSendInvite] = useState(true);
  const [branchId, setBranchId] = useState(defaultBranchId ?? branches?.[0]?.id ?? "");
  const [batchId, setBatchId] = useState("");
  const [batchOptions, setBatchOptions] = useState<{ id: string; label: string }[]>([]);
  const [loadingBatches, setLoadingBatches] = useState(false);
  const [multiRoleWarning, setMultiRoleWarning] = useState<MultiRoleWarning | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const payload: CreateUserInput = {
    name,
    email,
    phone,
    role,
    send_invite: sendInvite,
    ...(requireBranch || branchId ? { branchId: branchId || undefined } : {}),
    ...(role === "student" && batchId ? { batchId } : {}),
  };

  const profileValid = name.trim() && email.trim() && phone.trim();
  const roleStepValid =
    role !== "student" || (Boolean(batchId) && (requireBranch ? Boolean(branchId) : true));

  const batchesApi = apiBase.includes("super-admin")
    ? "/api/super-admin/batches"
    : "/api/admin/batches";

  useEffect(() => {
    if (role !== "student") {
      setBatchOptions([]);
      setBatchId("");
      return;
    }
    let cancelled = false;
    async function loadBatches() {
      setLoadingBatches(true);
      const url =
        apiBase.includes("super-admin") && branchId
          ? `${batchesApi}?branchId=${encodeURIComponent(branchId)}`
          : batchesApi;
      const res = await fetch(url, { credentials: "include" });
      const json = await res.json().catch(() => ({}));
      if (cancelled) return;
      setLoadingBatches(false);
      if (!res.ok) {
        setBatchOptions([]);
        setBatchId("");
        return;
      }
      const opts = (json as { batches?: { id: string; label: string }[] }).batches ?? [];
      setBatchOptions(opts);
      setBatchId((prev) => (opts.some((o) => o.id === prev) ? prev : (opts[0]?.id ?? "")));
    }
    loadBatches();
    return () => {
      cancelled = true;
    };
  }, [role, branchId, apiBase, batchesApi]);

  async function checkMultiRole() {
    const res = await fetch(checkMultiRoleApiBase, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      const data = await res.json();
      setMultiRoleWarning(data.warning ?? null);
    }
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    const res = await fetch(apiBase, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) {
      setError(data.error ?? "Could not create user");
      return;
    }
    onCreated(
      sendInvite
        ? "User created. Invite sent (expires in 7 days, one-time link)."
        : "User created.",
    );
    onClose();
  }

  async function goNext() {
    setError(null);
    if (step === 1 && role === "student" && !batchId) {
      setError("Select a class/section for the student.");
      return;
    }
    if (step === 1) {
      await checkMultiRole();
    }
    setStep(step + 1);
  }

  return (
    <AdminModal title="Add user" onClose={onClose} wide>
      <div style={{ marginBottom: "1.25rem" }}>
        <div style={{ display: "flex", gap: "0.35rem" }}>
          {STEPS.map((label, i) => (
            <div key={label} style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  height: 4,
                  borderRadius: 2,
                  background: i <= step ? "var(--eduos-primary)" : "var(--eduos-border)",
                }}
              />
              <p
                style={{
                  fontSize: "0.6875rem",
                  color: i === step ? "var(--eduos-brand)" : "var(--eduos-text-muted)",
                  fontWeight: i === step ? 600 : 400,
                  margin: "0.35rem 0 0",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {i + 1}. {label}
              </p>
            </div>
          ))}
        </div>
      </div>

      {step === 0 ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
          <p className="eduos-section-desc" style={{ margin: 0 }}>
            Enter the person&apos;s contact information. All fields are required.
          </p>
          <Input label="Full name" value={name} onChange={(e) => setName(e.target.value)} required />
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input label="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} required />
        </div>
      ) : null}

      {step === 1 ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
          <p className="eduos-section-desc" style={{ margin: 0 }}>
            Choose the portal role for this account.
          </p>
          <div>
            <label className="eduos-label">Role</label>
            <select
              className="eduos-input"
              value={role}
              onChange={(e) => {
                setRole(e.target.value as AssignableRole);
                setMultiRoleWarning(null);
              }}
            >
              {ROLES.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>
          {branches && branches.length > 0 ? (
            <div>
              <label className="eduos-label">Branch {requireBranch ? "*" : ""}</label>
              <select
                className="eduos-input"
                value={branchId}
                onChange={(e) => {
                  setBranchId(e.target.value);
                  setBatchId("");
                }}
                required={requireBranch}
              >
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
          ) : null}
          {role === "student" ? (
            <div>
              <label className="eduos-label">Class / section *</label>
              <select
                className="eduos-input"
                value={batchId}
                onChange={(e) => setBatchId(e.target.value)}
                required
                disabled={loadingBatches || batchOptions.length === 0}
              >
                {loadingBatches ? <option value="">Loading classes…</option> : null}
                {!loadingBatches && batchOptions.length === 0 ? (
                  <option value="">No classes in this branch</option>
                ) : null}
                {batchOptions.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.label}
                  </option>
                ))}
              </select>
            </div>
          ) : null}
          <p style={{ fontSize: "0.8125rem", color: "var(--eduos-text-muted)", margin: 0 }}>
            Faculty and parent use separate accounts when the same person has multiple roles. They
            are linked by matching phone or email.
          </p>
          <Button type="button" variant="secondary" onClick={checkMultiRole}>
            Check linked accounts
          </Button>
          {multiRoleWarning ? (
            <div
              style={{
                padding: "0.75rem",
                background: "#fffbeb",
                borderRadius: "var(--eduos-radius)",
                fontSize: "0.8125rem",
              }}
            >
              <strong>Separate account will be linked</strong>
              <ul style={{ margin: "0.5rem 0 0", paddingLeft: "1.1rem" }}>
                {multiRoleWarning.existing_accounts.map((a) => (
                  <li key={a.user_id}>
                    {a.name} ({a.role}) — {a.is_active ? "active" : "inactive"}
                  </li>
                ))}
              </ul>
              <p style={{ margin: "0.5rem 0 0", color: "var(--eduos-text-muted)" }}>
                Linked by {multiRoleWarning.will_link_by}: {multiRoleWarning.linked_user_group_id}
              </p>
            </div>
          ) : null}
        </div>
      ) : null}

      {step === 2 ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
          <p className="eduos-section-desc" style={{ margin: 0 }}>
            Confirm the details below, then create the account.
          </p>
          <dl
            style={{
              display: "grid",
              gridTemplateColumns: "100px 1fr",
              gap: "0.35rem 0.75rem",
              fontSize: "0.875rem",
              margin: 0,
            }}
          >
            <dt style={{ color: "var(--eduos-text-muted)" }}>Name</dt>
            <dd style={{ margin: 0 }}>{name}</dd>
            <dt style={{ color: "var(--eduos-text-muted)" }}>Email</dt>
            <dd style={{ margin: 0 }}>{email}</dd>
            <dt style={{ color: "var(--eduos-text-muted)" }}>Phone</dt>
            <dd style={{ margin: 0 }}>{phone}</dd>
            <dt style={{ color: "var(--eduos-text-muted)" }}>Role</dt>
            <dd style={{ margin: 0, textTransform: "capitalize" }}>{role}</dd>
            {branches && branches.length > 0 ? (
              <>
                <dt style={{ color: "var(--eduos-text-muted)" }}>Branch</dt>
                <dd style={{ margin: 0 }}>
                  {branches.find((b) => b.id === branchId)?.name ?? branchId}
                </dd>
              </>
            ) : null}
            {role === "student" ? (
              <>
                <dt style={{ color: "var(--eduos-text-muted)" }}>Class</dt>
                <dd style={{ margin: 0 }}>
                  {batchOptions.find((b) => b.id === batchId)?.label ?? "—"}
                </dd>
              </>
            ) : null}
          </dl>
          {multiRoleWarning ? (
            <p style={{ fontSize: "0.8125rem", color: "var(--eduos-text-muted)", margin: 0 }}>
              This account will be linked to existing accounts ({multiRoleWarning.linked_user_group_id}
              ).
            </p>
          ) : null}
          <label style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <input
              type="checkbox"
              checked={sendInvite}
              onChange={(e) => setSendInvite(e.target.checked)}
            />
            <span style={{ fontSize: "0.875rem" }}>
              Send email invite (7-day expiry, one-time link)
            </span>
          </label>
        </div>
      ) : null}

      {error ? (
        <p style={{ color: "var(--eduos-danger)", fontSize: "0.8125rem", marginTop: "0.75rem" }}>
          {error}
        </p>
      ) : null}

      <div
        style={{
          marginTop: "1.25rem",
          paddingTop: "1rem",
          borderTop: "1px solid var(--eduos-border)",
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <Button
          type="button"
          variant="secondary"
          onClick={() => (step > 0 ? setStep(step - 1) : onClose())}
          disabled={saving}
        >
          {step > 0 ? "Back" : "Cancel"}
        </Button>
        {step < STEPS.length - 1 ? (
          <Button
            type="button"
            onClick={goNext}
            disabled={(step === 0 && !profileValid) || (step === 1 && !roleStepValid)}
          >
            Continue
          </Button>
        ) : (
          <Button type="button" onClick={handleSave} disabled={saving}>
            {saving ? "Saving…" : "Save user"}
          </Button>
        )}
      </div>
    </AdminModal>
  );
}
