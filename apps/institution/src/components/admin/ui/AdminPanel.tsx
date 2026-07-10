import type { ReactNode } from "react";
import { adminPanel } from "./admin-classes";

interface AdminPanelProps {
  title?: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function AdminPanel({ title, description, actions, children, className }: AdminPanelProps) {
  const hasHeader = title || description || actions;
  return (
    <section className={`${adminPanel}${className ? ` ${className}` : ""}`}>
      {hasHeader ? (
        <div className="eduos-panel__header">
          <div>
            {title ? <h2 className="eduos-panel__title">{title}</h2> : null}
            {description ? <p className="eduos-panel__desc">{description}</p> : null}
          </div>
          {actions ? <div className="eduos-panel__actions">{actions}</div> : null}
        </div>
      ) : null}
      {children}
    </section>
  );
}
