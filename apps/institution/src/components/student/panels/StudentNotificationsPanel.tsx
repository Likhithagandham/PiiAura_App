"use client";

import { NotificationChannelPreferencesPanel } from "@/components/shared/NotificationChannelPreferencesPanel";

export function StudentNotificationsPanel() {
  return (
    <NotificationChannelPreferencesPanel
      apiUrl="/api/student/notifications"
      title="Alerts"
      description="Choose how you receive school announcements, fee reminders, and other alerts."
    />
  );
}
