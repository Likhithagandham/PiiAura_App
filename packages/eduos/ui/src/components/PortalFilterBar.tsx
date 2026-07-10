"use client";

import type { ReactNode } from "react";
import { ListSearchBar } from "./ListSearch";

export interface PortalFilterSelectOption {
  value: string;
  label: string;
}

export interface PortalFilterSelect {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: PortalFilterSelectOption[];
}

export function PortalFilterBar({
  search,
  onSearchChange,
  searchPlaceholder = "Search…",
  searchLabel = "Filter list",
  total,
  filtered,
  selects = [],
  children,
  className = "",
}: {
  search?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  searchLabel?: string;
  total?: number;
  filtered?: number;
  selects?: PortalFilterSelect[];
  children?: ReactNode;
  className?: string;
}) {
  const showSearch = search != null && onSearchChange != null;

  return (
    <div className={`portal-filter-bar ${className}`.trim()}>
      {showSearch ? (
        <ListSearchBar
          value={search}
          onChange={onSearchChange}
          placeholder={searchPlaceholder}
          label={searchLabel}
          total={total}
          filtered={filtered}
          className="portal-filter-bar__search"
        />
      ) : null}
      {selects.length > 0 || children ? (
        <div className="portal-filter-bar__controls">
          {selects.map((select) => (
            <label key={select.id} className="portal-filter-bar__select">
              <span className="portal-filter-bar__select-label">{select.label}</span>
              <select
                className="eduos-input portal-filter-bar__select-input"
                value={select.value}
                onChange={(e) => select.onChange(e.target.value)}
                aria-label={select.label}
              >
                {select.options.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </label>
          ))}
          {children}
        </div>
      ) : null}
    </div>
  );
}
