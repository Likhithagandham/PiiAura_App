"use client";

export interface AdminTabItem<T extends string> {
  id: T;
  label: string;
}

interface AdminTabsProps<T extends string> {
  tabs: AdminTabItem<T>[];
  active: T;
  onChange: (id: T) => void;
  className?: string;
}

export function AdminTabs<T extends string>({ tabs, active, onChange, className }: AdminTabsProps<T>) {
  return (
    <div className={`eduos-admin-tabs${className ? ` ${className}` : ""}`} role="tablist">
      {tabs.map((t) => {
        const isActive = active === t.id;
        return (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            className={`eduos-admin-tab${isActive ? " eduos-admin-tab--active" : ""}`}
            onClick={() => onChange(t.id)}
          >
            {t.label}
          </button>
        );
      })}
    </div>
  );
}
