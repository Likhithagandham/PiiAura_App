import type { AdminNavItem } from "@eduos/constants";

interface ModulePlaceholderProps {
  module: AdminNavItem;
}

export function ModulePlaceholder({ module }: ModulePlaceholderProps) {
  return (
    <section className="eduos-panel" style={{ maxWidth: "640px" }}>
      <p className="eduos-panel__desc" style={{ marginBottom: "0.5rem" }}>
        Coming soon
      </p>
      <h2 className="eduos-panel__title">{module.label}</h2>
      <p className="eduos-panel__desc" style={{ marginTop: "0.75rem" }}>
        This module is under development. Check back in a future release.
      </p>
    </section>
  );
}
