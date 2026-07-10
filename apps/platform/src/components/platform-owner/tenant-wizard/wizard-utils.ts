import type {
  CreatePlatformTenantInput,
  PlatformTenantBranchStaffRole,
  PlatformTenantWizardBranchEntry,
  PlatformTenantWizardBranchRoleAssignee,
} from "@eduos/types";

export const EMPTY_ASSIGNEE = (
  role: PlatformTenantBranchStaffRole = "admin",
): PlatformTenantWizardBranchRoleAssignee => ({
  role,
  name: "",
  phone: "",
});

export const EMPTY_BRANCH_ENTRY = (): PlatformTenantWizardBranchEntry => ({
  name: "",
  assignees: [EMPTY_ASSIGNEE("super_admin")],
});

export const EMPTY: CreatePlatformTenantInput = {
  overview: {
    institutionName: "",
    subdomain: "",
    institutionType: "school",
    plan: "standard",
  },
  address: {
    addressLine1: "",
    city: "",
    state: "",
    pincode: "",
  },
  invite: {
    superAdminName: "",
    superAdminPhone: "",
  },
  branches: {
    hqCity: "",
    hqState: "",
    entries: [EMPTY_BRANCH_ENTRY()],
  },
  features: {
    parentPortal: true,
    onlineFees: false,
    admissions: true,
    hrPayroll: false,
    examinations: true,
  },
  integrations: {
    razorpay: false,
    smsGateway: false,
    emailSmtp: true,
    googleWorkspace: false,
  },
};

export function assigneeFilled(a: PlatformTenantWizardBranchRoleAssignee): boolean {
  return a.name.trim().length > 0 && a.phone.trim().length > 0;
}

export function assigneePartial(a: PlatformTenantWizardBranchRoleAssignee): boolean {
  const hasName = a.name.trim().length > 0;
  const hasPhone = a.phone.trim().length > 0;
  return hasName !== hasPhone;
}
