/**
 * Central query hooks + key registry for the institution portal.
 *
 * Keep every query key in `queryKeys` so cache invalidation from mutations stays
 * discoverable and collision-free. Each `useXxx` hook wraps a BFF `/api/*` call
 * with the shared defaults from `query-client.ts`.
 */

import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import type {
  AdminDashboardData,
  FacultyDashboardData,
  GuardianManagementData,
  LiveAttendanceSnapshot,
  StudentDashboardData,
  SuperAdminBranchesData,
  SuperAdminDashboardData,
  SuperAdminOperationsOverviewData,
  TenantBranding,
  UserManagementData,
} from "@eduos/types";
import { apiGet } from "./api-client";

export const queryKeys = {
  tenantBranding: ["tenant-branding"] as const,
  superAdminDashboard: ["super-admin", "dashboard"] as const,
  superAdminBranches: ["super-admin", "branches"] as const,
  superAdminOperationsOverview: ["super-admin", "operations-overview"] as const,
  studentDashboard: ["student", "dashboard"] as const,
  /** Keyed by the fully-resolved URL so each branch/role filter caches separately. */
  userManagement: (url: string) => ["people", "users", url] as const,
  guardians: (url: string) => ["people", "guardians", url] as const,
} as const;

/**
 * Generic cached GET for any BFF `/api/*` route — the workhorse for converting
 * `useEffect`+`fetch` reads. The query key is the full path (including query
 * string), so each distinct URL caches independently and revisiting a page is
 * instant. Pass a null/undefined path (or `enabled: false`) to defer the fetch
 * until inputs are ready. Use the returned `refetch` after a related mutation.
 */
export function useApiData<T>(
  path: string | null | undefined,
  options?: Partial<Pick<UseQueryOptions<T>, "staleTime" | "gcTime" | "refetchInterval" | "enabled">>,
) {
  const { enabled, ...rest } = options ?? {};
  return useQuery({
    queryKey: ["api", path] as const,
    queryFn: () => apiGet<T>(path as string),
    enabled: path != null && (enabled ?? true),
    ...rest,
  });
}

/**
 * Alert banners shown in every portal shell. Cached with a 30s staleTime so navigating
 * between pages doesn't refetch (the shell remounts on every route) — this endpoint is
 * relatively expensive server-side and its data tolerates brief staleness.
 */
export function useAlertsBanner(apiUrl: string | null) {
  const query = useApiData<{ alerts?: import("@eduos/types").PortalAlert[] }>(apiUrl, {
    staleTime: 30_000,
  });
  return query.data?.alerts ?? [];
}

/** Tenant branding — changes almost never, so cache it hard. */
export function useTenantBrandingQuery() {
  return useQuery({
    queryKey: queryKeys.tenantBranding,
    queryFn: () => apiGet<TenantBranding>("/api/tenant-branding"),
    // Branding is effectively static for a session.
    staleTime: 10 * 60_000,
    gcTime: 30 * 60_000,
  });
}

export function useSuperAdminDashboardQuery() {
  return useQuery({
    queryKey: queryKeys.superAdminDashboard,
    queryFn: () => apiGet<SuperAdminDashboardData>("/api/super-admin/dashboard"),
  });
}

/**
 * Tenant branches — shared by the Branches tab and the People view's branch
 * filter, so one key means switching between them is a cache hit.
 */
export function useSuperAdminBranchesQuery() {
  return useQuery({
    queryKey: queryKeys.superAdminBranches,
    queryFn: () => apiGet<SuperAdminBranchesData>("/api/super-admin/branches"),
    // Branch list changes rarely; keep it fresh for a few minutes.
    staleTime: 3 * 60_000,
  });
}

/** Live attendance poll interval (ms) — keep in sync with the dashboard views. */
export const LIVE_ATTENDANCE_POLL_MS = 12_000;

export function useAdminDashboardQuery() {
  return useQuery({
    queryKey: ["admin", "dashboard"] as const,
    queryFn: () => apiGet<AdminDashboardData>("/api/admin/dashboard"),
    staleTime: 60_000,
  });
}

/**
 * Live attendance snapshot — polled on an interval. TanStack Query pauses the
 * interval while the tab is unfocused (refetchIntervalInBackground defaults to
 * false), replacing the old manual `document.hidden` + setInterval plumbing.
 */
export function useAdminLiveAttendanceQuery() {
  return useQuery({
    queryKey: ["admin", "live-attendance"] as const,
    queryFn: () => apiGet<LiveAttendanceSnapshot>("/api/admin/dashboard/live-attendance"),
    refetchInterval: LIVE_ATTENDANCE_POLL_MS,
    staleTime: 0,
  });
}

export function useFacultyDashboardQuery() {
  return useQuery({
    queryKey: ["faculty", "dashboard"] as const,
    queryFn: () => apiGet<FacultyDashboardData>("/api/faculty/dashboard"),
  });
}

/** Faculty live board polls at 15s (distinct from the admin board's 12s). */
export const FACULTY_LIVE_ATTENDANCE_POLL_MS = 15_000;

export function useFacultyLiveAttendanceQuery() {
  return useQuery({
    queryKey: ["faculty", "live-attendance"] as const,
    queryFn: () => apiGet<LiveAttendanceSnapshot>("/api/faculty/dashboard/live-attendance"),
    refetchInterval: FACULTY_LIVE_ATTENDANCE_POLL_MS,
    staleTime: 0,
  });
}

export function useStudentDashboardQuery() {
  return useQuery({
    queryKey: queryKeys.studentDashboard,
    queryFn: () => apiGet<StudentDashboardData>("/api/student/dashboard"),
  });
}

export function useSuperAdminOperationsOverviewQuery() {
  return useQuery({
    queryKey: queryKeys.superAdminOperationsOverview,
    queryFn: () =>
      apiGet<SuperAdminOperationsOverviewData>("/api/super-admin/operations/overview"),
  });
}

/** User accounts list for the People panel, keyed by the resolved (branch-filtered) URL. */
export function useUserManagementQuery(usersUrl: string) {
  return useQuery({
    queryKey: queryKeys.userManagement(usersUrl),
    queryFn: () => apiGet<UserManagementData>(usersUrl),
  });
}

/** Guardian links for the Guardians panel, keyed by the resolved (branch/class-filtered) URL. */
export function useGuardiansQuery(url: string) {
  return useQuery({
    queryKey: queryKeys.guardians(url),
    queryFn: () => apiGet<GuardianManagementData>(url),
  });
}

export {
  galleryQueryKeys,
  adminGalleryAlbumsPath,
  useAdminGalleryClassSectionsQuery,
  useAdminGalleryAlbumsQuery,
  useAdminGalleryAlbumQuery,
  useStudentGalleryAlbumsQuery,
  useStudentGalleryAlbumQuery,
  useCreateGalleryAlbumMutation,
  useDeleteGalleryAlbumMutation,
  useBulkDeleteGalleryImagesMutation,
  useSetGalleryCoverMutation,
  useReorderGalleryImagesMutation,
  useUploadGalleryFilesMutation,
  useInvalidateGallery,
} from "./gallery-queries";
