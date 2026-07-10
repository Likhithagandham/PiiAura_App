"use client";

import { NotificationChannelPreferencesPanel } from "@/components/shared/NotificationChannelPreferencesPanel";
import { DashboardShell } from "@/components/DashboardShell";

export default function NotificationPreferencesPage() {
  return (
    <DashboardShell title="Notification preferences">
      <NotificationChannelPreferencesPanel apiUrl="/api/user/notifications" />
    </DashboardShell>
  );
}
