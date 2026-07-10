"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { CreateAlbumInput, GalleryVisibility } from "@eduos/types";
import { Button, Input, Spinner } from "@eduos/ui";
import { useEffect, useState } from "react";
import { AdminShell } from "../AdminShell";
import { AdminMessage } from "../ui";
import { GradeSectionFilters } from "../shared/staffing/GradeSectionFilters";
import { useClassSectionFilters } from "../attendance/useClassSectionFilters";
import { useTenantBranding } from "@/components/shared/portal-polish/useTenantBranding";
import { useAdminScope } from "../AdminScopeContext";
import { useCreateGalleryAlbumMutation, useAdminGalleryClassSectionsQuery } from "@/lib/queries";

const VISIBILITY: GalleryVisibility[] = ["students", "parents", "faculty", "staff_only", "private"];

export function CreateAlbumForm() {
  const router = useRouter();
  const branding = useTenantBranding();
  const { institutionType } = useAdminScope();
  const createAlbum = useCreateGalleryAlbumMutation();
  const { data: classSections = [], isLoading: loadingClasses, error: classesError } =
    useAdminGalleryClassSectionsQuery();

  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<CreateAlbumInput>({
    title: "",
    description: "",
    visibility: "students",
    eventTag: "",
    batchId: null,
  });
  const [albumType, setAlbumType] = useState<"school" | "class">("school");

  const {
    gradeKey,
    setGradeKey,
    sectionId,
    setSectionId,
    gradeOptions,
    sectionsForGrade,
  } = useClassSectionFilters(classSections);

  useEffect(() => {
    if (albumType !== "class") {
      setForm((f) => ({ ...f, batchId: null }));
      return;
    }
    setForm((f) => ({ ...f, batchId: sectionId || null }));
  }, [albumType, sectionId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (albumType === "class" && !sectionId) {
      setError("Select a class and section for this album.");
      return;
    }

    const payload: CreateAlbumInput = {
      ...form,
      batchId: albumType === "class" ? sectionId : null,
    };

    try {
      const album = await createAlbum.mutateAsync(payload);
      router.push(`/admin/gallery/${album.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Create failed");
    }
  }

  const branchLabel = branding?.institutionName ?? "Your branch";

  return (
    <AdminShell title="Create album">
      <p className="eduos-section-desc">
        School albums are campus-wide. Class albums are scoped to one batch at your branch.
      </p>
      {error ? <AdminMessage variant="error">{error}</AdminMessage> : null}
      {classesError ? (
        <AdminMessage variant="error">Could not load classes. Try refreshing the page.</AdminMessage>
      ) : null}

      <form
        onSubmit={handleSubmit}
        className="eduos-panel"
        style={{ display: "flex", flexDirection: "column", gap: "0.75rem", maxWidth: "36rem" }}
      >
        <Input
          label="Title"
          value={form.title}
          onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          required
        />
        <Input
          label="Description"
          value={form.description ?? ""}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
        />
        <Input
          label="Event tag"
          value={form.eventTag ?? ""}
          onChange={(e) => setForm((f) => ({ ...f, eventTag: e.target.value }))}
          placeholder="e.g. annual-day-2026"
        />

        <fieldset style={{ border: "none", padding: 0, margin: 0 }}>
          <legend style={{ fontSize: "0.875rem", marginBottom: "0.35rem" }}>Album type</legend>
          <label style={{ marginRight: "1rem" }}>
            <input
              type="radio"
              checked={albumType === "school"}
              onChange={() => setAlbumType("school")}
            />{" "}
            School
          </label>
          <label>
            <input
              type="radio"
              checked={albumType === "class"}
              onChange={() => setAlbumType("class")}
            />{" "}
            Class
          </label>
        </fieldset>

        {albumType === "class" ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <div>
              <span className="eduos-label">Branch</span>
              <p
                className="eduos-input"
                style={{
                  margin: "0.25rem 0 0",
                  background: "var(--eduos-surface-muted, #f8fafc)",
                  color: "var(--eduos-text-muted)",
                }}
              >
                {branchLabel}
              </p>
            </div>

            {loadingClasses ? (
              <div className="portal-live-loading">
                <Spinner size="sm" label="Loading classes" />
              </div>
            ) : classSections.length === 0 ? (
              <AdminMessage variant="error">
                No classes found for this branch. Add classes in Academics first.
              </AdminMessage>
            ) : (
              <div>
                <span className="eduos-label">Class & section *</span>
                <GradeSectionFilters
                  className="portal-filter-bar--stacked"
                  gradeKey={gradeKey}
                  onGradeChange={setGradeKey}
                  sectionId={sectionId}
                  onSectionChange={setSectionId}
                  gradeOptions={gradeOptions.map((g) => ({
                    ...g,
                    label: institutionType === "college" && g.label.startsWith("Class ")
                      ? g.label.replace(/^Class /, "")
                      : g.label,
                  }))}
                  sectionsForGrade={sectionsForGrade}
                />
                {sectionId ? (
                  <p style={{ fontSize: "0.8125rem", color: "var(--eduos-text-muted)", margin: "0.35rem 0 0" }}>
                    Album will be visible for{" "}
                    {classSections.find((c) => c.id === sectionId)?.label ?? "the selected class"}.
                  </p>
                ) : null}
              </div>
            )}
          </div>
        ) : null}

        <label style={{ fontSize: "0.875rem" }}>
          Visibility
          <select
            value={form.visibility ?? "students"}
            onChange={(e) => setForm((f) => ({ ...f, visibility: e.target.value as GalleryVisibility }))}
            style={{ display: "block", width: "100%", marginTop: "0.25rem" }}
          >
            {VISIBILITY.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        </label>

        <div style={{ display: "flex", gap: "0.5rem" }}>
          <Button
            type="submit"
            disabled={
              createAlbum.isPending ||
              (albumType === "class" && (loadingClasses || !sectionId || classSections.length === 0))
            }
          >
            {createAlbum.isPending ? "Creating…" : "Create album"}
          </Button>
          <Link href="/admin/gallery">
            <Button type="button" variant="secondary">
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </AdminShell>
  );
}
