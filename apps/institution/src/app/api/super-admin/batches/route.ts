import { requireSuperAdmin, superAdminJson } from "@/lib/super-admin/api";
import { djangoGet } from "@/lib/services/django-client";
import { mapSuperAdminError } from "../errors";

export async function GET(request: Request) {
  const auth = await requireSuperAdmin(request);
  if (!auth.ok) return auth.response;

  const url = new URL(request.url);
  const branchId = url.searchParams.get("branchId") ?? url.searchParams.get("branch");
  if (!branchId) {
    return superAdminJson(auth, { error: "branchId is required." }, { status: 400 });
  }

  try {
    const data = await djangoGet<{ batches: { id: string; name: string; displayLabel?: string }[] }>(
      request,
      `/api/v1/academics/batches/?branchId=${encodeURIComponent(branchId)}`,
    );
    const batches = (data.batches ?? []).map((b) => ({
      id: String(b.id),
      label: b.displayLabel ?? b.name,
    }));
    return superAdminJson(auth, { batches });
  } catch (err) {
    const { message, status } = mapSuperAdminError(err);
    return superAdminJson(auth, { error: message }, { status });
  }
}
