/**
 * TanStack Query hooks for the platform licensing module (school-side, read-only).
 */

import { useQuery } from "@tanstack/react-query";
import type { SchoolLicenseSummary, StudentLicenseRow } from "@eduos/types";
import { apiGet } from "./api-client";

const LICENSING_STALE_MS = 60_000;

export const licensingQueryKeys = {
  all: ["licensing"] as const,
  summary: (scope: "admin" | "super-admin") => ["licensing", scope, "summary"] as const,
  students: (scope: "admin" | "super-admin", status: string) =>
    ["licensing", scope, "students", status] as const,
} as const;

export function useLicensingSummaryQuery(scope: "admin" | "super-admin") {
  return useQuery({
    queryKey: licensingQueryKeys.summary(scope),
    queryFn: () => apiGet<SchoolLicenseSummary>(`/api/${scope}/licensing/summary`),
    staleTime: LICENSING_STALE_MS,
  });
}

export function useLicensingStudentsQuery(
  scope: "admin" | "super-admin",
  status: "all" | "licensed" | "unlicensed" = "all",
) {
  const qs = status === "all" ? "" : `?status=${status}`;
  return useQuery({
    queryKey: licensingQueryKeys.students(scope, status),
    queryFn: () =>
      apiGet<{ students: StudentLicenseRow[] }>(`/api/${scope}/licensing/students${qs}`).then(
        (res) => res.students ?? [],
      ),
    staleTime: LICENSING_STALE_MS,
  });
}
