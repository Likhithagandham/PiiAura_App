import type { ReactNode } from "react";

export function PortalHeaderTitles({
  title,
  subtitle,
  meta,
}: {
  title: string;
  subtitle?: string | null;
  meta?: ReactNode;
}) {
  return (
    <div className="portal-header__titles">
      <h1 className="eduos-headline-md portal-header__title">{title}</h1>
      {subtitle ? <p className="portal-header__subtitle">{subtitle}</p> : null}
      {meta ? <div className="portal-header__meta">{meta}</div> : null}
    </div>
  );
}
