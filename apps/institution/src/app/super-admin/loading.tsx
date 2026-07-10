import { SkeletonText } from "@eduos/ui";
import { SuperAdminShell } from "@/components/super-admin/SuperAdminShell";

export default function SuperAdminLoading() {
  return (
    <SuperAdminShell title="">
      <div className="eduos-portal-main">
        <SkeletonText lines={2} />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "1rem", marginTop: "1.5rem" }}>
          <SkeletonText lines={3} />
          <SkeletonText lines={3} />
        </div>
      </div>
    </SuperAdminShell>
  );
}
