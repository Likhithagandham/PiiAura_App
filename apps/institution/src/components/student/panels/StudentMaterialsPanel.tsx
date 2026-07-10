"use client";

import type { StudentMaterialsData } from "@eduos/types";
import type { StudyMaterial } from "@eduos/types";
import { EmptyState, InlineLoading } from "@eduos/ui";
import { useApiData } from "@/lib/queries";

function MaterialCard({ material }: { material: StudyMaterial & { unitTitles?: string[] } }) {
  return (
    <section className="eduos-panel" style={{ padding: "0.75rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: "0.75rem", flexWrap: "wrap" }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: "0.875rem" }}>{material.fileName}</div>
          <div style={{ fontSize: "0.75rem", color: "var(--eduos-text-muted)" }}>
            {material.classLabel}
          </div>
        </div>
        <a href={material.url} className="eduos-link" style={{ fontSize: "0.8125rem" }} target="_blank" rel="noreferrer">
          Open / download
        </a>
      </div>
    </section>
  );
}

export function StudentMaterialsPanel() {
  const { data, error: queryError } = useApiData<StudentMaterialsData>("/api/student/materials");
  const error = queryError ? (queryError instanceof Error ? queryError.message : "Failed to load") : null;

  if (error) return <p className="eduos-admin-message eduos-admin-message--error">{error}</p>;
  if (!data) return <InlineLoading />;

  const totalCount = data.folders.reduce((n, f) => n + f.materials.length, 0) + data.general.length;
  if (totalCount === 0) {
    return <EmptyState title="No study materials" description="Materials uploaded by faculty will appear here." />;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      {data.folders.map((folder) => (
        <section key={folder.id}>
          <h3 style={{ margin: "0 0 0.5rem", fontSize: "0.9375rem" }}>{folder.name}</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {folder.materials.map((m) => (
              <MaterialCard key={m.id} material={m} />
            ))}
          </div>
        </section>
      ))}
      {data.general.length > 0 ? (
        <section>
          <h3 style={{ margin: "0 0 0.5rem", fontSize: "0.9375rem" }}>General</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {data.general.map((m) => (
              <MaterialCard key={m.id} material={m} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
