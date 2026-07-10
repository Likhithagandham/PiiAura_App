import type { ReactNode } from "react";

export function PortalWelcomeStrip({
  eyebrow,
  title,
  description,
  badge,
}: {
  eyebrow: string;
  title: string;
  description: string;
  badge?: ReactNode;
}) {
  return (
    <section className="portal-welcome">
      <div>
        <p className="portal-welcome__eyebrow">{eyebrow}</p>
        <h2 className="portal-welcome__title">{title}</h2>
        <p className="portal-welcome__desc">{description}</p>
      </div>
      {badge ? <span className="portal-welcome__badge">{badge}</span> : null}
    </section>
  );
}
