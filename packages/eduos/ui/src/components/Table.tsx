"use client";

import type { ReactNode } from "react";
import { Button } from "./Button";
import { EmptyState } from "./EmptyState";
import { ListSearch } from "./ListSearch";
import { SkeletonTable } from "./Skeleton";

export interface DataTableColumn<T> {
  key: string;
  label: string;
  /** Custom cell renderer; defaults to `String(row[key])`. */
  render?: (row: T) => ReactNode;
  align?: "left" | "right" | "center";
  className?: string;
}

export interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  loading?: boolean;
  emptyTitle?: string;
  emptyDescription?: ReactNode;
  emptyAction?: ReactNode;

  /** Server-side pagination — the caller owns the page/search state and refetch. */
  page: number;
  pageSize: number;
  totalCount: number;
  onPageChange: (page: number) => void;

  /** Server-side search — omit `onSearchChange` to hide the search box entirely. */
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;

  /** Extra toolbar content (role/status filters, action buttons) next to search. */
  toolbarExtra?: ReactNode;
}

/**
 * Server-paginated data table. Each page is expected to hold at most a few dozen
 * rows (the backend's `StandardPagination` caps `page_size` at 100), so this
 * renders every row of the *current page* directly — no client-side windowing is
 * needed here. For a genuinely unbounded single-page view (e.g. a live scrolling
 * feed), use `@tanstack/react-virtual` directly instead of this component.
 */
export function DataTable<T>({
  columns,
  rows,
  rowKey,
  loading,
  emptyTitle = "No results",
  emptyDescription,
  emptyAction,
  page,
  pageSize,
  totalCount,
  onPageChange,
  searchValue,
  onSearchChange,
  searchPlaceholder,
  toolbarExtra,
}: DataTableProps<T>) {
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const from = totalCount === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, totalCount);

  return (
    <div className="eduos-data-table">
      {onSearchChange || toolbarExtra ? (
        <div
          className="eduos-data-table__toolbar"
          style={{ display: "flex", gap: "0.75rem", alignItems: "center", flexWrap: "wrap", marginBottom: "0.75rem" }}
        >
          {onSearchChange ? (
            <ListSearch value={searchValue ?? ""} onChange={onSearchChange} placeholder={searchPlaceholder} />
          ) : null}
          {toolbarExtra}
        </div>
      ) : null}

      {loading ? (
        <SkeletonTable rows={Math.min(pageSize, 8)} columns={columns.length} />
      ) : rows.length === 0 ? (
        <EmptyState compact title={emptyTitle} description={emptyDescription} action={emptyAction} />
      ) : (
        <>
          <div className="eduos-table-wrap">
            <table className="eduos-admin-table">
              <thead>
                <tr>
                  {columns.map((c) => (
                    <th key={c.key} className={c.className} style={c.align ? { textAlign: c.align } : undefined}>
                      {c.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={rowKey(row)}>
                    {columns.map((c) => (
                      <td key={c.key} className={c.className} style={c.align ? { textAlign: c.align } : undefined}>
                        {c.render ? c.render(row) : String((row as Record<string, unknown>)[c.key] ?? "")}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div
            className="eduos-data-table__pagination"
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: "0.75rem",
              flexWrap: "wrap",
              gap: "0.5rem",
            }}
          >
            <span style={{ fontSize: "0.8125rem", color: "var(--eduos-text-muted)" }}>
              {totalCount === 0 ? "0 results" : `${from}–${to} of ${totalCount}`}
            </span>
            <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
              <Button
                variant="secondary"
                disabled={page <= 1}
                onClick={() => onPageChange(page - 1)}
                style={{ width: "auto", padding: "0.35rem 0.75rem", fontSize: "0.8125rem" }}
              >
                Previous
              </Button>
              <span style={{ fontSize: "0.8125rem" }}>
                Page {page} of {totalPages}
              </span>
              <Button
                variant="secondary"
                disabled={page >= totalPages}
                onClick={() => onPageChange(page + 1)}
                style={{ width: "auto", padding: "0.35rem 0.75rem", fontSize: "0.8125rem" }}
              >
                Next
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
