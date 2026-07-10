"use client";

import type { CreateStudentGrievanceInput, StudentGrievancesData } from "@eduos/types";
import { Button, EmptyState, SkeletonTable, TruncatedText } from "@eduos/ui";
import { useState } from "react";
import { useApiData } from "@/lib/queries";

const STATUS_LABEL: Record<string, string> = {
  open: "Open",
  in_review: "In review",
  resolved: "Resolved",
  closed: "Closed",
};

export function StudentGrievancesPanel() {
  const { data, error: queryError, refetch } = useApiData<StudentGrievancesData>(
    "/api/student/grievances",
  );
  const load = refetch;
  const [message, setMessage] = useState<string | null>(null);
  const [form, setForm] = useState<CreateStudentGrievanceInput>({
    category: "Academic",
    subject: "",
    description: "",
  });

  const error = queryError ? "Failed to load." : null;

  return (
    <>
      {error ? <p className="eduos-admin-message eduos-admin-message--error">{error}</p> : null}
      {message ? <p className="eduos-admin-message">{message}</p> : null}
      <section className="eduos-panel">
        <h2 className="eduos-section-title">New grievance</h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(9rem, 1fr))",
            gap: "0.5rem",
            marginTop: "0.5rem",
            maxWidth: "28rem",
          }}
        >
          <label style={{ fontSize: "0.8125rem" }}>
            Category
            <select
              className="eduos-input eduos-input--field"
              style={{ display: "block", marginTop: "0.2rem", width: "100%" }}
              value={form.category}
              onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
            >
              <option>Academic</option>
              <option>Examination</option>
              <option>Fees</option>
              <option>Facilities</option>
              <option>Other</option>
            </select>
          </label>
          <label style={{ fontSize: "0.8125rem" }}>
            Subject
            <input
              className="eduos-input eduos-input--field"
              style={{ display: "block", marginTop: "0.2rem", width: "100%" }}
              value={form.subject}
              onChange={(e) => setForm((p) => ({ ...p, subject: e.target.value }))}
              placeholder="Brief title"
            />
          </label>
        </div>
        <textarea
          className="eduos-input"
          rows={3}
          placeholder="Describe your grievance"
          value={form.description}
          onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
          style={{ marginTop: "0.5rem", maxWidth: "28rem" }}
        />
        <div style={{ marginTop: "0.5rem" }}>
          <Button
            type="button"
            className="eduos-admin-btn-sm"
            onClick={async () => {
              setMessage(null);
              const res = await fetch("/api/student/grievances", {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
              });
              const json = await res.json().catch(() => ({}));
              if (!res.ok) {
                setMessage((json as { error?: string }).error ?? "Submit failed");
                return;
              }
              setMessage("Grievance submitted.");
              setForm((p) => ({ ...p, subject: "", description: "" }));
              await load();
            }}
          >
            Submit
          </Button>
        </div>
      </section>
      <section className="eduos-panel">
        <h2 className="eduos-section-title">My grievances</h2>
        <div className="eduos-table-wrap" style={{ marginTop: "0.5rem" }}>
          {!data ? (
            <SkeletonTable columns={4} rows={5} />
          ) : data.grievances.length === 0 ? (
            <EmptyState title="No grievances filed" description="Submit a grievance above and track its status here." />
          ) : (
            <table className="eduos-admin-table">
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Subject</th>
                  <th>Status</th>
                  <th>Filed</th>
                </tr>
              </thead>
              <tbody>
                {data.grievances.map((g) => (
                  <tr key={g.id}>
                    <td>{g.category}</td>
                    <td>
                      <div>
                        <TruncatedText text={g.subject} maxWidth="16rem" />
                      </div>
                      <div className="eduos-admin-table__reason">
                        <TruncatedText text={g.description} maxWidth="16rem" />
                      </div>
                    </td>
                    <td>{STATUS_LABEL[g.status] ?? g.status}</td>
                    <td className="eduos-admin-table__nowrap">{new Date(g.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </>
  );
}
