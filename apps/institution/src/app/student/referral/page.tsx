"use client";

import { ComingSoonPanel } from "@/components/shared/ComingSoonPanel";
import { StudentShell } from "@/components/student/StudentShell";

export default function StudentReferralPage() {
  return (
    <StudentShell title="Referral">
      <ComingSoonPanel
        title="Refer a friend"
        description="Invite friends and family to join your institution and earn rewards when they enroll. The referral programme is coming soon — check back in a future release."
      />
    </StudentShell>
  );
}
