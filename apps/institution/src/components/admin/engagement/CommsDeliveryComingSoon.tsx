"use client";

import { EmptyState } from "@eduos/ui";

export function CommsDeliveryComingSoon() {
  return (
    <section className="eduos-panel">
      <EmptyState
        title="SMS & email delivery — coming soon"
        description="Outbound SMS, email, delivery queues, and per-recipient status will appear here once the messaging pipeline is enabled. Use the Notices tab to publish in-app messages today — students and parents see them under Notices in their portal."
      />
    </section>
  );
}
