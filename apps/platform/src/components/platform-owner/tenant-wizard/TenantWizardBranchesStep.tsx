import type { Dispatch, SetStateAction } from "react";
import type {
  CreatePlatformTenantInput,
  PlatformTenantBranchStaffRole,
  PlatformTenantWizardBranchEntry,
} from "@eduos/types";
import { Button } from "@eduos/ui";
import { EMPTY_ASSIGNEE, EMPTY_BRANCH_ENTRY } from "./wizard-utils";

export function TenantWizardBranchesStep({
  form,
  setForm,
  branchEntries,
}: {
  form: CreatePlatformTenantInput;
  setForm: Dispatch<SetStateAction<CreatePlatformTenantInput>>;
  branchEntries: PlatformTenantWizardBranchEntry[];
}) {
  return (
    <div className="eduos-portal-toolbar" style={{ flexDirection: "column", alignItems: "stretch" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
        <label style={{ fontSize: "0.8125rem" }}>
          Primary city
          <input
            className="eduos-input eduos-input--field"
            value={form.branches.hqCity}
            onChange={(e) =>
              setForm((p) => ({
                ...p,
                branches: { ...p.branches, hqCity: e.target.value },
                address: { ...p.address, city: e.target.value },
              }))
            }
            style={{ display: "block", marginTop: "0.2rem", width: "100%" }}
          />
        </label>
        <label style={{ fontSize: "0.8125rem" }}>
          Primary state
          <input
            className="eduos-input eduos-input--field"
            value={form.branches.hqState}
            onChange={(e) =>
              setForm((p) => ({
                ...p,
                branches: { ...p.branches, hqState: e.target.value },
                address: { ...p.address, state: e.target.value },
              }))
            }
            style={{ display: "block", marginTop: "0.2rem", width: "100%" }}
          />
        </label>
      </div>

      <div style={{ marginTop: "0.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ fontSize: "0.8125rem", fontWeight: 600 }}>Branches & roles</div>
          <Button
            type="button"
            variant="secondary"
            onClick={() =>
              setForm((p) => ({
                ...p,
                branches: {
                  ...p.branches,
                  entries: [...branchEntries, EMPTY_BRANCH_ENTRY()],
                },
              }))
            }
          >
            Add branch
          </Button>
        </div>
        <div style={{ marginTop: "0.75rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
          {branchEntries.map((entry, branchIdx) => {
            const superAdminRoleTakenElsewhere = branchEntries.some(
              (other, otherIdx) =>
                otherIdx !== branchIdx &&
                other.assignees.some((a) => a.role === "super_admin"),
            );
            return (
              <div
                key={branchIdx}
                style={{
                  border: "1px solid var(--eduos-border, #e5e7eb)",
                  borderRadius: "8px",
                  padding: "0.75rem",
                }}
              >
                <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                  <input
                    className="eduos-input eduos-input--field"
                    value={entry.name}
                    onChange={(e) =>
                      setForm((p) => ({
                        ...p,
                        branches: {
                          ...p.branches,
                          entries: branchEntries.map((v, i) =>
                            i === branchIdx ? { ...v, name: e.target.value } : v,
                          ),
                        },
                      }))
                    }
                    placeholder={branchIdx === 0 ? "Main campus" : `Branch ${branchIdx + 1}`}
                    style={{ width: "100%" }}
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    disabled={branchEntries.length <= 1}
                    onClick={() =>
                      setForm((p) => ({
                        ...p,
                        branches: {
                          ...p.branches,
                          entries: branchEntries.filter((_, i) => i !== branchIdx),
                        },
                      }))
                    }
                    title={branchEntries.length <= 1 ? "At least one branch is required" : "Remove branch"}
                  >
                    Remove
                  </Button>
                </div>

                <div style={{ marginTop: "0.75rem" }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: "0.5rem",
                    }}
                  >
                    <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--eduos-text-muted)" }}>
                      Role assignments
                    </div>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() =>
                        setForm((p) => ({
                          ...p,
                          branches: {
                            ...p.branches,
                            entries: branchEntries.map((v, i) =>
                              i === branchIdx
                                ? {
                                    ...v,
                                    assignees: [...v.assignees, EMPTY_ASSIGNEE("admin")],
                                  }
                                : v,
                            ),
                          },
                        }))
                      }
                    >
                      Add role
                    </Button>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                    {entry.assignees.map((assignee, assigneeIdx) => (
                      <div
                        key={assigneeIdx}
                        style={{
                          display: "grid",
                          gridTemplateColumns: "minmax(7rem, 9rem) 1fr 1fr auto",
                          gap: "0.5rem",
                          alignItems: "center",
                        }}
                      >
                        <select
                          className="eduos-input eduos-input--field"
                          value={assignee.role}
                          onChange={(e) =>
                            setForm((p) => ({
                              ...p,
                              branches: {
                                ...p.branches,
                                entries: branchEntries.map((v, i) =>
                                  i === branchIdx
                                    ? {
                                        ...v,
                                        assignees: v.assignees.map((a, j) =>
                                          j === assigneeIdx
                                            ? {
                                                ...a,
                                                role: e.target.value as PlatformTenantBranchStaffRole,
                                              }
                                            : a,
                                        ),
                                      }
                                    : v,
                                ),
                              },
                            }))
                          }
                        >
                          <option
                            value="super_admin"
                            disabled={
                              superAdminRoleTakenElsewhere && assignee.role !== "super_admin"
                            }
                          >
                            Super admin
                          </option>
                          <option value="admin">Admin</option>
                        </select>
                        <input
                          className="eduos-input eduos-input--field"
                          value={assignee.name}
                          onChange={(e) =>
                            setForm((p) => ({
                              ...p,
                              branches: {
                                ...p.branches,
                                entries: branchEntries.map((v, i) =>
                                  i === branchIdx
                                    ? {
                                        ...v,
                                        assignees: v.assignees.map((a, j) =>
                                          j === assigneeIdx ? { ...a, name: e.target.value } : a,
                                        ),
                                      }
                                    : v,
                                ),
                              },
                            }))
                          }
                          placeholder="Name"
                        />
                        <input
                          className="eduos-input eduos-input--field"
                          value={assignee.phone}
                          onChange={(e) =>
                            setForm((p) => ({
                              ...p,
                              branches: {
                                ...p.branches,
                                entries: branchEntries.map((v, i) =>
                                  i === branchIdx
                                    ? {
                                        ...v,
                                        assignees: v.assignees.map((a, j) =>
                                          j === assigneeIdx ? { ...a, phone: e.target.value } : a,
                                        ),
                                      }
                                    : v,
                                ),
                              },
                            }))
                          }
                          placeholder="+919876543210"
                        />
                        <Button
                          type="button"
                          variant="secondary"
                          disabled={entry.assignees.length <= 1}
                          onClick={() =>
                            setForm((p) => ({
                              ...p,
                              branches: {
                                ...p.branches,
                                entries: branchEntries.map((v, i) =>
                                  i === branchIdx
                                    ? {
                                        ...v,
                                        assignees: v.assignees.filter((_, j) => j !== assigneeIdx),
                                      }
                                    : v,
                                ),
                              },
                            }))
                          }
                          title={
                            entry.assignees.length <= 1
                              ? "At least one role row is required"
                              : "Remove role"
                          }
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <p className="eduos-section-desc" style={{ marginTop: "0.75rem" }}>
          Assign one super admin for the institution and optional branch admins per campus.
          Branch count is used for plan limits and provisioning.
        </p>
      </div>
    </div>
  );
}
