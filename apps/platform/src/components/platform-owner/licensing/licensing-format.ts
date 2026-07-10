import type { PlatformLicensingTenantDetail } from "@eduos/types";

export function formatInr(n: number | undefined | null): string {
  if (n == null || !Number.isFinite(n)) return "—";
  return `₹${n.toLocaleString("en-IN")}`;
}

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export function unlicensedForBranch(
  data: PlatformLicensingTenantDetail,
  branchId: string,
): number {
  if (!branchId) return data.summary.unlicensedStudents;
  return data.branches.find((b) => b.id === branchId)?.unlicensedCount ?? 0;
}
