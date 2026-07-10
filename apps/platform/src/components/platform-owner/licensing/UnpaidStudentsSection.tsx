import type { LicenseBranchBillingRow, StudentLicenseRow } from "@eduos/types";
import { formatDate, formatInr } from "./licensing-format";

export function UnpaidStudentsSection({
  queue,
  branches,
  branchFilter,
  schoolUnlicensedCount,
  onBranchFilterChange,
}: {
  queue: StudentLicenseRow[];
  branches: LicenseBranchBillingRow[];
  branchFilter: string;
  schoolUnlicensedCount: number;
  onBranchFilterChange: (branchId: string) => void;
}) {
  return (
    <section className="eduos-panel">
      <div className="eduos-panel__header">
        <div>
          <h2 className="eduos-section-title">
            Unpaid students ({queue.length}
            {branchFilter ? " in branch" : ""})
          </h2>
          <p className="eduos-section-desc">
            Oldest first — payments convert this queue from the top automatically.
            {branchFilter
              ? " Branch-scoped payments license only students in the selected branch."
              : " Leave branch as “All branches” for school-wide FIFO."}
          </p>
        </div>
        {branches.length > 0 ? (
          <div>
            <label className="eduos-label" htmlFor="branch-filter">
              Branch
            </label>
            <select
              id="branch-filter"
              className="eduos-input"
              value={branchFilter}
              onChange={(e) => onBranchFilterChange(e.target.value)}
            >
              <option value="">
                All branches ({schoolUnlicensedCount} unpaid)
              </option>
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} ({b.unlicensedCount} unpaid · {formatInr(b.pendingAmountInr)})
                </option>
              ))}
            </select>
          </div>
        ) : null}
      </div>
      {queue.length === 0 ? (
        <p className="eduos-body-sm">No unpaid students in this view.</p>
      ) : (
        <div className="eduos-table-wrap">
          <table className="eduos-admin-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Student</th>
                <th className="eduos-admin-table__nowrap">Roll no.</th>
                <th className="eduos-admin-table__nowrap">Branch</th>
                <th className="eduos-admin-table__nowrap">Enrolled</th>
              </tr>
            </thead>
            <tbody>
              {queue.map((s, i) => (
                <tr key={s.id}>
                  <td>{i + 1}</td>
                  <td style={{ fontWeight: 600 }}>{s.studentName || "—"}</td>
                  <td className="eduos-admin-table__nowrap">{s.admissionNumber ?? "—"}</td>
                  <td className="eduos-admin-table__nowrap">{s.branchName ?? "—"}</td>
                  <td className="eduos-admin-table__nowrap">{formatDate(s.enrolledAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
