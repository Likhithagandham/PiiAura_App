import type { FeesData } from "@eduos/types";

export function feesSetupStatus(data: FeesData) {
  const hasStructure = data.structures.length > 0;
  const hasInvoices = data.ledger.some((r) => r.totalDue > 0);
  return { hasStructure, hasInvoices, isReady: hasStructure && hasInvoices };
}

export function daysOverdue(nextDueDate: string | null): number | null {
  if (!nextDueDate) return null;
  const due = new Date(`${nextDueDate}T12:00:00`);
  const now = new Date();
  const diff = Math.floor((now.getTime() - due.getTime()) / 86400000);
  return diff > 0 ? diff : null;
}

export const ESCALATION_LEGEND = [
  { level: 0, label: "None", detail: "Not escalated" },
  { level: 1, label: "L1", detail: "Overdue — first follow-up" },
  { level: 2, label: "L2", detail: "Reminder sent to parent" },
  { level: 3, label: "L3", detail: "Final notice before further action" },
] as const;
