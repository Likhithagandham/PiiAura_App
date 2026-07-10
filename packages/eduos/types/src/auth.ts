export type Role =
  | "platform_owner"
  | "super_admin"
  | "admin"
  | "faculty"
  | "student"
  | "parent";

export type LoginIdentifierType = "phone" | "custom_id";

export type InstitutionType = "school" | "college";

export interface InstitutionLoginLabels {
  student_id_label: string;
  faculty_id_label: string;
}

/** White-label branding tokens resolved by the backend (branch override → tenant default). */
export interface BrandTheme {
  logoUrl: string | null;
  primaryColor: string;
  accentColor: string;
}

export interface TenantLoginConfig extends InstitutionLoginLabels {
  institution_name: string;
  institution_type: InstitutionType;
  logo_url: string | null;
  /** Canonical branding source; `logo_url` is kept as a back-compat alias of `theme.logoUrl`. */
  theme?: BrandTheme;
  subdomain: string;
  website?: string | null;
}

export interface MockUser {
  id: string;
  name: string;
  role: Role;
  phone: string | null;
  custom_login_id: string | null;
  linked_user_group_id?: string;
  branch?: string;
  children?: string[];
  own_phone?: string | null;
  is_active?: boolean;
}

export interface AuthUser {
  id: string;
  name: string;
  role: Role;
  phone: string | null;
  custom_login_id: string | null;
  branch?: string;
  branch_id?: string | null;
  tenant_subdomain: string;
  linked_user_group_id?: string | null;
  /** F-254 — institution type for client feature flags (absent for platform owner). */
  institution_type?: InstitutionType;
  /** Resolved branding for the user's branch (override → tenant fallback). */
  branchTheme?: BrandTheme | null;
}

export interface LinkedAccountOption {
  userId: string;
  role: Role;
  name: string;
  label: string;
}

export interface DeviceSessionRow {
  sessionId: string;
  deviceLabel: string;
  createdAt: string;
  lastActiveAt: string;
  isCurrent: boolean;
}

export interface DisambiguationAccount {
  userId: string;
  role: Role;
  name: string;
  subtitle: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export type LoginResult =
  | { type: "success"; tokens: TokenPair; user: AuthUser }
  | { type: "force_change_password"; tokens: TokenPair; user: AuthUser }
  | { type: "disambiguation"; token: string; accounts: DisambiguationAccount[] }
  | { type: "mfa_required"; mfaSessionToken: string; emailHint: string };

export type ResetRequestResult =
  | { type: "otp_sent"; otpToken: string }
  | { type: "disambiguation"; selectionToken: string; accounts: DisambiguationAccount[] }
  | { type: "generic_sent" };

export interface StudentChild {
  id: string;
  name: string;
  classLabel: string;
  rollNumber: string;
}
