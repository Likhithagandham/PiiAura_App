import { SkeletonText } from "@eduos/ui";

export default function PlatformLoading() {
  return (
    <div style={{ padding: "2rem" }}>
      <SkeletonText lines={2} />
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "1rem",
          marginTop: "1.5rem",
        }}
      >
        <SkeletonText lines={3} />
        <SkeletonText lines={3} />
        <SkeletonText lines={3} />
      </div>
    </div>
  );
}
