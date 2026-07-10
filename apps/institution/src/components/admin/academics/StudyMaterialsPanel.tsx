"use client";

import { useMemo, useState } from "react";
import type { AcademicsData, StudyMaterial } from "@eduos/types";
import { Button, Input } from "@eduos/ui";
import { useClassSectionFilters } from "../attendance/useClassSectionFilters";

function MaterialsTable({
  materials,
  classLabel,
  onDelete,
}: {
  materials: StudyMaterial[];
  classLabel: (id: string) => string;
  onDelete: (id: string) => Promise<void>;
}) {
  if (materials.length === 0) return null;
  return (
    <table className="eduos-admin-table" style={{ width: "100%" }}>
      <thead>
        <tr style={{ borderBottom: "1px solid var(--eduos-border)", textAlign: "left" }}>
          <th style={{ padding: "0.4rem" }}>Class</th>
          <th style={{ padding: "0.4rem" }}>File</th>
          <th />
        </tr>
      </thead>
      <tbody>
        {materials.map((m) => (
          <tr key={m.id} style={{ borderBottom: "1px solid var(--eduos-border)" }}>
            <td style={{ padding: "0.4rem" }}>{m.classLabel || classLabel(m.classSectionId)}</td>
            <td style={{ padding: "0.4rem" }}>
              <a href={m.url} target="_blank" rel="noreferrer" style={{ color: "var(--eduos-primary)" }}>
                {m.fileName}
              </a>
            </td>
            <td style={{ padding: "0.4rem" }}>
              <button
                type="button"
                style={{ fontSize: "0.75rem", color: "var(--eduos-danger)", background: "none", border: "none", cursor: "pointer" }}
                onClick={() => onDelete(m.id)}
              >
                Remove
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function StudyMaterialsPanel({
  data,
  onAction,
  onMessage,
}: {
  data: AcademicsData;
  onAction: (b: Record<string, unknown>) => Promise<unknown>;
  onMessage: (m: string | null) => void;
}) {
  const gradeLabel = data.institutionType === "college" ? "Program" : "Grade";
  const {
    gradeKey,
    setGradeKey,
    sectionId,
    setSectionId,
    gradeOptions,
    sectionsForGrade,
  } = useClassSectionFilters(data.classSections ?? []);

  const resetFolderSelection = () => {
    setSelectedFolderId("general");
    setRenamingFolderId(null);
  };

  const [selectedFolderId, setSelectedFolderId] = useState<string | "general">("general");
  const [newFolderName, setNewFolderName] = useState("");
  const [creatingFolder, setCreatingFolder] = useState(false);
  const [renamingFolderId, setRenamingFolderId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [fileName, setFileName] = useState("");
  const [uploading, setUploading] = useState(false);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const classLabel = (id: string) =>
    data.classSections.find((c) => c.id === id)?.label ?? id;

  const classFolders = useMemo(
    () => (data.studyMaterialFolders ?? [])
      .filter((f) => f.classSectionId === sectionId)
      .sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name)),
    [data.studyMaterialFolders, sectionId],
  );

  const classMaterials = useMemo(
    () => data.studyMaterials.filter((m) => m.classSectionId === sectionId),
    [data.studyMaterials, sectionId],
  );

  const grouped = useMemo(() => {
    const byFolder = classFolders.map((folder) => ({
      key: folder.id,
      title: folder.name,
      folder,
      materials: classMaterials.filter((m) => m.folderId === folder.id),
    }));
    const general = classMaterials.filter((m) => !m.folderId);
    return { byFolder, general };
  }, [classFolders, classMaterials]);

  const toggleSection = (key: string) => {
    setCollapsed((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const deleteMaterial = async (materialId: string) => {
    await onAction({ action: "delete_study_material", materialId });
    onMessage("Material removed.");
  };

  return (
    <div className="eduos-panel">
      <h3 style={{ margin: "0 0 0.35rem", fontSize: "1rem" }}>Study materials</h3>
      <p style={{ fontSize: "0.8125rem", color: "var(--eduos-text-muted)", margin: "0 0 1rem" }}>
        Organize uploads into folders per class. Students and faculty see materials grouped by folder.
      </p>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "0.75rem",
          alignItems: "center",
          marginBottom: "1rem",
        }}
      >
        {data.classSections.length > 0 ? (
          <>
            <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.8125rem" }}>
              <span style={{ fontWeight: 600, color: "var(--eduos-text-muted)" }}>{gradeLabel}</span>
              <select
                value={gradeKey}
                onChange={(e) => {
                  setGradeKey(e.target.value);
                  resetFolderSelection();
                }}
                className="eduos-input"
                style={{ minWidth: "8rem" }}
              >
                {gradeOptions.map((g) => (
                  <option key={g.key} value={g.key}>
                    {g.label}
                  </option>
                ))}
              </select>
            </label>
            {sectionsForGrade.length > 0 ? (
              <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.8125rem" }}>
                <span style={{ fontWeight: 600, color: "var(--eduos-text-muted)" }}>Section</span>
                <select
                  value={sectionId}
                  onChange={(e) => {
                    setSectionId(e.target.value);
                    resetFolderSelection();
                  }}
                  className="eduos-input"
                  style={{ minWidth: "5rem" }}
                >
                  {sectionsForGrade.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.section ?? c.label.split(" - ").pop() ?? c.label}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}
          </>
        ) : (
          <p style={{ fontSize: "0.8125rem", color: "var(--eduos-text-muted)", margin: 0 }}>
            Add class sections under Structure to upload materials.
          </p>
        )}
      </div>

      <section style={{ marginBottom: "1.25rem" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.5rem", marginBottom: "0.5rem" }}>
          <h4 style={{ margin: 0, fontSize: "0.875rem" }}>Folders</h4>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem", marginBottom: "0.75rem" }}>
          <button
            type="button"
            className="eduos-input"
            style={{
              cursor: "pointer",
              fontSize: "0.8125rem",
              padding: "0.35rem 0.65rem",
              borderColor: selectedFolderId === "general" ? "var(--eduos-primary)" : undefined,
              background: selectedFolderId === "general" ? "var(--eduos-primary-muted, rgba(0,0,0,0.04))" : undefined,
            }}
            onClick={() => setSelectedFolderId("general")}
          >
            General ({grouped.general.length})
          </button>
          {classFolders.map((folder) => (
            <div key={folder.id} style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
              {renamingFolderId === folder.id ? (
                <>
                  <Input
                    value={renameValue}
                    onChange={(e) => setRenameValue(e.target.value)}
                    placeholder="Folder name"
                    className="eduos-input--compact"
                  />
                  <Button
                    type="button"
                    disabled={!renameValue.trim()}
                    onClick={async () => {
                      await onAction({
                        action: "rename_study_folder",
                        payload: { folderId: folder.id, name: renameValue.trim() },
                      });
                      setRenamingFolderId(null);
                      onMessage("Folder renamed.");
                    }}
                  >
                    Save
                  </Button>
                  <button
                    type="button"
                    style={{ fontSize: "0.75rem", background: "none", border: "none", cursor: "pointer" }}
                    onClick={() => setRenamingFolderId(null)}
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    className="eduos-input"
                    style={{
                      cursor: "pointer",
                      fontSize: "0.8125rem",
                      padding: "0.35rem 0.65rem",
                      borderColor: selectedFolderId === folder.id ? "var(--eduos-primary)" : undefined,
                      background: selectedFolderId === folder.id ? "var(--eduos-primary-muted, rgba(0,0,0,0.04))" : undefined,
                    }}
                    onClick={() => setSelectedFolderId(folder.id)}
                  >
                    {folder.name} ({folder.materialCount})
                  </button>
                  <button
                    type="button"
                    title="Rename folder"
                    style={{ fontSize: "0.7rem", background: "none", border: "none", cursor: "pointer", color: "var(--eduos-text-muted)" }}
                    onClick={() => {
                      setRenamingFolderId(folder.id);
                      setRenameValue(folder.name);
                    }}
                  >
                    ✎
                  </button>
                  <button
                    type="button"
                    title="Delete folder"
                    style={{ fontSize: "0.7rem", background: "none", border: "none", cursor: "pointer", color: "var(--eduos-danger)" }}
                    onClick={async () => {
                      const ok = await onAction({ action: "delete_study_folder", folderId: folder.id });
                      if (ok) {
                        if (selectedFolderId === folder.id) setSelectedFolderId("general");
                        onMessage("Folder deleted.");
                      }
                    }}
                  >
                    ×
                  </button>
                </>
              )}
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", alignItems: "flex-end" }}>
          <Input
            label="New folder"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            placeholder="Unit 1"
          />
          <Button
            type="button"
            disabled={creatingFolder || !newFolderName.trim() || !sectionId}
            onClick={async () => {
              setCreatingFolder(true);
              try {
                await onAction({
                  action: "create_study_folder",
                  payload: { classSectionId: sectionId, name: newFolderName.trim() },
                });
                setNewFolderName("");
                onMessage("Folder created.");
              } finally {
                setCreatingFolder(false);
              }
            }}
          >
            {creatingFolder ? "Creating…" : "Add folder"}
          </Button>
        </div>
      </section>

      <section style={{ marginBottom: "1.25rem" }}>
        <h4 style={{ margin: "0 0 0.5rem", fontSize: "0.875rem" }}>
          Upload to {selectedFolderId === "general" ? "General" : classFolders.find((f) => f.id === selectedFolderId)?.name ?? "folder"}
        </h4>
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", alignItems: "flex-end" }}>
          <Input
            label="File name"
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
            placeholder="notes-ch3.pdf"
          />
          <Button
            type="button"
            disabled={uploading || !fileName.trim() || !sectionId}
            onClick={async () => {
              setUploading(true);
              await onAction({
                action: "upload_study_material",
                payload: {
                  classSectionId: sectionId,
                  fileName: fileName.trim(),
                  ...(selectedFolderId !== "general" ? { folderId: selectedFolderId } : {}),
                },
              });
              setUploading(false);
              onMessage("Material uploaded.");
              setFileName("");
            }}
          >
            {uploading ? "Uploading…" : "Upload"}
          </Button>
        </div>
      </section>

      {classMaterials.length > 0 ? (
        <section>
          <h4 style={{ margin: "0 0 0.75rem", fontSize: "0.875rem" }}>Files by folder</h4>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {grouped.byFolder.map(({ key, title, materials }) => (
              <div key={key} style={{ border: "1px solid var(--eduos-border)", borderRadius: "6px", overflow: "hidden" }}>
                <button
                  type="button"
                  onClick={() => toggleSection(key)}
                  style={{
                    width: "100%",
                    textAlign: "left",
                    padding: "0.5rem 0.75rem",
                    background: "var(--eduos-surface-muted, rgba(0,0,0,0.02))",
                    border: "none",
                    cursor: "pointer",
                    fontWeight: 600,
                    fontSize: "0.8125rem",
                  }}
                >
                  {collapsed[key] ? "▸" : "▾"} {title} ({materials.length})
                </button>
                {!collapsed[key] ? (
                  <div style={{ padding: "0.5rem 0.75rem" }}>
                    <MaterialsTable materials={materials} classLabel={classLabel} onDelete={deleteMaterial} />
                    {materials.length === 0 ? (
                      <p style={{ margin: 0, fontSize: "0.75rem", color: "var(--eduos-text-muted)" }}>No files in this folder.</p>
                    ) : null}
                  </div>
                ) : null}
              </div>
            ))}
            <div style={{ border: "1px solid var(--eduos-border)", borderRadius: "6px", overflow: "hidden" }}>
              <button
                type="button"
                onClick={() => toggleSection("general")}
                style={{
                  width: "100%",
                  textAlign: "left",
                  padding: "0.5rem 0.75rem",
                  background: "var(--eduos-surface-muted, rgba(0,0,0,0.02))",
                  border: "none",
                  cursor: "pointer",
                  fontWeight: 600,
                  fontSize: "0.8125rem",
                }}
              >
                {collapsed.general ? "▸" : "▾"} General ({grouped.general.length})
              </button>
              {!collapsed.general ? (
                <div style={{ padding: "0.5rem 0.75rem" }}>
                  <MaterialsTable materials={grouped.general} classLabel={classLabel} onDelete={deleteMaterial} />
                  {grouped.general.length === 0 ? (
                    <p style={{ margin: 0, fontSize: "0.75rem", color: "var(--eduos-text-muted)" }}>No files outside folders.</p>
                  ) : null}
                </div>
              ) : null}
            </div>
          </div>
        </section>
      ) : (
        <p style={{ fontSize: "0.8125rem", color: "var(--eduos-text-muted)", margin: 0 }}>
          No study materials for this class yet.
        </p>
      )}
    </div>
  );
}
