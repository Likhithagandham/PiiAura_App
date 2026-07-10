import type { AuthUser } from "@eduos/types";

export type WalkthroughKind = "dashboard" | "module";

export function dashboardWalkthroughKey(role: AuthUser["role"]): string {
  return `dashboard:${role}`;
}

export function moduleWalkthroughKey(role: AuthUser["role"], moduleId: string): string {
  return `module:${moduleId}:${role}`;
}

