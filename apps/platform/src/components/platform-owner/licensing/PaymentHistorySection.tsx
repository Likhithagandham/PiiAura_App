import type { LicensePaymentRecord } from "@eduos/types";
import { formatDate, formatInr } from "./licensing-format";

export function PaymentHistorySection({ payments }: { payments: LicensePaymentRecord[] }) {
  return (
    <section className="eduos-panel">
      <h2 className="eduos-section-title">Payment history</h2>
      {payments.length === 0 ? (
        <p className="eduos-body-sm">No payments recorded yet.</p>
      ) : (
        <div className="eduos-table-wrap">
          <table className="eduos-admin-table">
            <thead>
              <tr>
                <th className="eduos-admin-table__nowrap">Date</th>
                <th className="eduos-admin-table__nowrap">Branch</th>
                <th className="eduos-admin-table__nowrap">Licenses</th>
                <th className="eduos-admin-table__nowrap">Amount</th>
                <th className="eduos-admin-table__nowrap">Mode</th>
                <th className="eduos-admin-table__nowrap">Reference</th>
                <th>Notes</th>
                <th className="eduos-admin-table__nowrap">Recorded by</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p.id}>
                  <td className="eduos-admin-table__nowrap">{formatDate(p.paidAt)}</td>
                  <td className="eduos-admin-table__nowrap">{p.branchName ?? "All branches"}</td>
                  <td className="eduos-admin-table__nowrap">+{p.licensesGranted}</td>
                  <td className="eduos-admin-table__nowrap">{formatInr(p.amountInr)}</td>
                  <td className="eduos-admin-table__nowrap" style={{ textTransform: "capitalize" }}>
                    {p.paymentMode.replace("_", " ")}
                  </td>
                  <td className="eduos-admin-table__nowrap">{p.referenceNumber || "—"}</td>
                  <td>{p.notes || "—"}</td>
                  <td className="eduos-admin-table__nowrap">{p.recordedBy}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
