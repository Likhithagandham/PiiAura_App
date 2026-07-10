import type { InstitutionAddress } from "./admin/settings";

export interface TenantInstitutionSettings {
  institutionName: string;
  institutionType: "school" | "college";
  logoUrl: string | null;
  website: string | null;
  address: InstitutionAddress;
  goLiveAt: string | null;
  /** Mirrors admin `parent-portal` toggle; only enforced for college institutions. */
  parentPortalEnabled: boolean;
}

export interface UpdateTenantInstitutionSettingsInput {
  institutionName: string;
  institutionType: "school" | "college";
  logoUrl: string;
  website?: string;
  address: InstitutionAddress;
  parentPortalEnabled?: boolean;
}

