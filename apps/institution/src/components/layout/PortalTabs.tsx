"use client";

export interface PortalTabItem<T extends string> {
  id: T;
  label: string;
  badge?: string;
  badgeTone?: "danger" | "neutral";
}

interface PortalTabsProps<T extends string> {
  tabs: PortalTabItem<T>[];
  active: T;
  onChange: (id: T) => void;
  className?: string;
}

export function PortalTabs<T extends string>({ tabs, active, onChange, className }: PortalTabsProps<T>) {
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
            <span className="eduos-admin-tab__label">
              {t.label}
              {t.badge ? (
                <span
                  className={`eduos-admin-badge${
                    t.badgeTone === "danger" ? " eduos-admin-badge--danger" : ""
                  }`}
                >
                  {t.badge}
                </span>
              ) : null}
            </span>
          </button>
        );
      })}
    </div>
  );
}
