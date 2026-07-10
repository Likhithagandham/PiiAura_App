import type { LicenseInvoiceRecord } from "@eduos/types";
import { formatDate, formatInr } from "./licensing-format";

export function InvoicesSection({ invoices }: { invoices: LicenseInvoiceRecord[] }) {
  return (
    <section className="eduos-panel">
      <h2 className="eduos-section-title">Invoices</h2>
      {invoices.length === 0 ? (
        <p className="eduos-body-sm">No invoices yet.</p>
      ) : (
        <div className="eduos-table-wrap">
          <table className="eduos-admin-table">
            <thead>
              <tr>
                <th className="eduos-admin-table__nowrap">Issued</th>
                <th className="eduos-admin-table__nowrap">Type</th>
                <th className="eduos-admin-table__nowrap">Licenses</th>
                <th className="eduos-admin-table__nowrap">Amount</th>
                <th className="eduos-admin-table__nowrap">Status</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => (
                <tr key={inv.id}>
                  <td className="eduos-admin-table__nowrap">{formatDate(inv.issuedAt)}</td>
                  <td className="eduos-admin-table__nowrap" style={{ textTransform: "capitalize" }}>
                    {inv.invoiceType.replace("_", " ")}
                  </td>
                  <td className="eduos-admin-table__nowrap">{inv.licensesCount}</td>
                  <td className="eduos-admin-table__nowrap">{formatInr(inv.amountInr)}</td>
                  <td className="eduos-admin-table__nowrap" style={{ textTransform: "capitalize" }}>
                    {inv.status}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
