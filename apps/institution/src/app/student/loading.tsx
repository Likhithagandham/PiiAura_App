import { SkeletonText } from "@eduos/ui";
import { StudentShell } from "@/components/student/StudentShell";

export default function StudentLoading() {
  return (
    <StudentShell title="">
      <div className="eduos-portal-main">
        <SkeletonText lines={2} />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "1rem", marginTop: "1.5rem" }}>
          <SkeletonText lines={3} />
          <SkeletonText lines={3} />
        </div>
      </div>
    </StudentShell>
  );
}
