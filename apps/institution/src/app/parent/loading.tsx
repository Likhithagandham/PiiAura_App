import { SkeletonText } from "@eduos/ui";
import { ParentShell } from "@/components/parent/ParentShell";

export default function ParentLoading() {
  return (
    <ParentShell>
      <div className="eduos-portal-main">
        <SkeletonText lines={2} />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "1rem", marginTop: "1.5rem" }}>
          <SkeletonText lines={3} />
          <SkeletonText lines={3} />
        </div>
      </div>
    </ParentShell>
  );
}
