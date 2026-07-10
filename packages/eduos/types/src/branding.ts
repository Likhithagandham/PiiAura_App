export interface TenantBranding {
  institutionName: string;
  logoUrl: string | null;
  brandColor: string | null;
  websiteUrl?: string | null;
}

export interface UpdateTenantBrandingInput {
  logoUrl: string;
  brandColor: string;
}

