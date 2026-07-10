export interface InstitutionAddress {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
}

export interface InstitutionInfoSettings {
  institutionName: string;
  logoUrl: string | null;
  institutionAddress: InstitutionAddress;
  branchName: string;
  branchAddress: InstitutionAddress;
}

export interface IntegrationSettings {
  razorpayKeyId: string;
  razorpayKeySecretMasked: string;
  msg91AuthKeyMasked: string;
  msg91SenderId: string;
  configured: {
    razorpay: boolean;
    msg91: boolean;
  };
}

export interface AcademicYear {
  id: string;
  label: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
}

export interface FeatureToggle {
  id: string;
  label: string;
  description: string;
  enabled: boolean;
  appliesTo: "school" | "college" | "all";
}

export interface AttendanceRulesSettings {
  thresholdPercent: number;
  examDayCountsTowardThreshold: boolean;
}

export interface AdminSettings {
  institution: InstitutionInfoSettings;
  integrations: IntegrationSettings;
  academicYears: AcademicYear[];
  featureToggles: FeatureToggle[];
  attendanceRules: AttendanceRulesSettings;
  institutionType: "school" | "college";
}
