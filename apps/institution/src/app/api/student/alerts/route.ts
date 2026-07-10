import { getDashboard } from "@/lib/services/student-server";
import { studentJson, requireStudent } from "@/lib/student/api";
import type { PortalAlert } from "@eduos/types";

function stamp(
  alert: Omit<PortalAlert, "createdAt">,
  hoursAgo = 1,
): PortalAlert {
  return {
    ...alert,
    createdAt: new Date(Date.now() - hoursAgo * 3600000).toISOString(),
  };
}

export async function GET(request: Request) {
  const auth = await requireStudent(request);
  if (!auth.ok) return auth.response;

  const dash = await getDashboard(request, {
    subdomain: auth.subdomain,
    userId: auth.studentUserId,
    rollNumber: auth.rollNumber,
    studentName: auth.studentName,
  });

  const alerts: PortalAlert[] = [];

  if (dash.attendanceAlert) {
    alerts.push(
      stamp(
        {
          id: "attendance",
          title: `Attendance ${dash.attendanceAlert.level === "critical" ? "alert" : "warning"}`,
          message: dash.attendanceAlert.message,
          severity: dash.attendanceAlert.level === "critical" ? "critical" : "warning",
          href: "/student/dashboard",
        },
        1,
      ),
    );
  }

  if (dash.feeAlert) {
    alerts.push(
      stamp(
        {
          id: "fee-due",
          title: "Fee balance due",
          message: dash.feeAlert.message,
          severity: "warning",
          href: "/student/fees",
        },
        3,
      ),
    );
  }

  if (dash.upcomingExamsCount > 0 && dash.nextExamLabel) {
    alerts.push(
      stamp(
        {
          id: "upcoming-exam",
          title: "Upcoming exam",
          message: `Next: ${dash.nextExamLabel}`,
          severity: "info",
          href: "/student/exams",
          count: dash.upcomingExamsCount,
        },
        6,
      ),
    );
  }

  if (!dash.hallTicketAvailable && dash.institutionType === "college") {
    alerts.push(
      stamp(
        {
          id: "hall-ticket",
          title: "Hall ticket unavailable",
          message: "Clear outstanding fees to download your hall ticket.",
          severity: "critical",
          href: "/student/fees",
        },
        12,
      ),
    );
  }

  return studentJson(auth, { alerts });
}
