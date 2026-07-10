"use client";

import type { Step } from "react-joyride";
import type { AuthUser } from "@eduos/types";

const baseDashboardSteps: Step[] = [
  {
    target: '[data-tour="sidebar"]',
    title: "Navigation sidebar",
    content: "Use this sidebar to move between modules. On mobile, open it using the menu button in the header.",
    disableBeacon: true,
    placement: "right",
  },
  {
    target: '[data-tour="header-title-row"]',
    title: "Header",
    content: "This header shows where you are. Some roles may also see notifications or scope toggles here.",
    disableBeacon: true,
    placement: "bottom",
  },
  {
    target: '[data-tour="profile-menu"]',
    title: "Profile & help",
    content: "Open this menu to logout and replay the Product Tour anytime.",
    disableBeacon: true,
    placement: "right",
  },
  {
    target: '[data-tour="dashboard-kpis"]',
    title: "Dashboard cards",
    content: "These cards summarize what matters most for you today.",
    disableBeacon: true,
    placement: "top",
  },
  {
    target: '[data-tour="quick-actions"]',
    title: "Quick actions",
    content: "Shortcuts for common tasks you do often.",
    disableBeacon: true,
    placement: "top",
  },
];

export function getDashboardSteps(role: AuthUser["role"]): Step[] {
  // Role-specific tweaks can be added here over time; defaults are safe and shared.
  if (role === "super_admin") {
    return [
      ...baseDashboardSteps,
      {
        target: '[data-tour="dashboard-main"]',
        title: "Branch overview",
        content: "Super Admin dashboards consolidate stats across branches and highlight alerts that need attention.",
        disableBeacon: true,
        placement: "top",
      },
    ];
  }
  return baseDashboardSteps;
}

export function getModuleSteps(role: AuthUser["role"], moduleId: string): Step[] {
  // Keep module tours short; generic default that still satisfies “first time in module”.
  return [
    {
      target: '[data-tour="sidebar"]',
      title: "Module navigation",
      content: "You can always switch modules from the sidebar.",
      disableBeacon: true,
      placement: "right",
    },
    {
      target: '[data-tour="module-root"]',
      title: "This module",
      content: `You're in the ${moduleId} module. Use the panels and filters here to complete tasks.`,
      disableBeacon: true,
      placement: "top",
    },
  ];
}

