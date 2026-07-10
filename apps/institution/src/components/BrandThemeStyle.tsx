import type { BrandTheme } from "@eduos/types";

/**
 * Injects the tenant's white-label colors as CSS variable overrides on :root.
 *
 * Rendered server-side (no "use client") so the brand is correct on first paint —
 * no flash of the default theme. The <style> is emitted after the imported
 * tokens.css, so at equal specificity these declarations win the cascade.
 *
 * Values are validated to #RRGGBB before interpolation to prevent any CSS injection
 * via dangerouslySetInnerHTML, and fall back to the built-in design defaults.
 */

const DEFAULT_PRIMARY = "#1a5f4a"; // matches tokens.css --eduos-primary
const DEFAULT_ACCENT = "#004634"; // matches tokens.css --eduos-brand

const HEX = /^#[0-9a-fA-F]{6}$/;

function safeColor(value: string | null | undefined, fallback: string): string {
  return value && HEX.test(value) ? value : fallback;
}

export function BrandThemeStyle({ theme }: { theme?: BrandTheme | null }) {
  const primary = safeColor(theme?.primaryColor, DEFAULT_PRIMARY);
  const accent = safeColor(theme?.accentColor, DEFAULT_ACCENT);

  // Override the primary-family tokens the UI actually consumes.
  const css =
    `:root{` +
    `--eduos-brand:${primary};` +
    `--eduos-primary:${primary};` +
    `--eduos-primary-hover:${primary};` +
    `--eduos-border-focus:${primary};` +
    `--eduos-nav-active-border:${primary};` +
    `--eduos-kpi-value:${primary};` +
    `--eduos-trend:${primary};` +
    `--eduos-accent:${accent};` +
    `}`;

  return <style dangerouslySetInnerHTML={{ __html: css }} />;
}
