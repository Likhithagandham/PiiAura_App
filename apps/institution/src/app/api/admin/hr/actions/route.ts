import type {
  ApplyLeaveInput,
  CreatePayrollAdjustmentInput,
  ReviewLeaveInputHr,
  RunPayrollInput,
  SaveSalaryTemplateInput,
  SaveEmployeeInput,
} from "@eduos/types";
import { NextResponse } from "next/server";
import { auditDiffLine, logSensitiveMutation } from "@/lib/admin/audit-log";
import { requireAdmin } from "@/lib/admin/api";
import { withIdempotency } from "@/lib/admin/idempotency";
import { isHrPayrollEnabled } from "@/lib/config";
import {
  applyLeave,
  createPayrollAdjustment,
  HR_BACKED_ACTIONS,
  reviewLeave,
  runPayroll,
  saveEmployee,
  saveSalaryTemplate,
} from "@/lib/services/hr.service";

const PAYROLL_ACTIONS = new Set([
  "run_payroll",
  "save_salary_template",
  "create_payroll_adjustment",
  "payslip_pdf",
  "export_form16",
  "export_pf",
]);

function payrollComingSoonResponse() {
  return NextResponse.json(
    { error: "Payroll is coming soon. Leave and employee management remain available." },
    { status: 503 },
  );
}

export async function PATCH(request: Request) {
  return withIdempotency(request, async () => {
    const auth = await requireAdmin(request);
    if (!auth.ok) return auth.response;

    const body = (await request.json()) as { action?: string; payload?: unknown; [k: string]: unknown };
    const action = String(body.action ?? "");

    if (!isHrPayrollEnabled() && PAYROLL_ACTIONS.has(action)) {
      return payrollComingSoonResponse();
    }

    try {
      if (HR_BACKED_ACTIONS.has(action)) {
        const p = body.payload as never;
        let result: unknown;
        switch (action) {
          case "apply_leave": result = await applyLeave(request, p); break;
          case "review_leave": result = await reviewLeave(request, p); break;
          case "run_payroll": result = await runPayroll(request, p); break;
          case "save_salary_template": result = await saveSalaryTemplate(request, p); break;
          case "create_payroll_adjustment": result = await createPayrollAdjustment(request, p); break;
          case "save_employee": {
            const payload = body.payload as SaveEmployeeInput;
            result = await saveEmployee(request, payload);
            logSensitiveMutation(request, auth.subdomain, auth.user, {
              action: "hr.employee.create",
              entityType: "employee",
              entityId: String((result as { id?: string }).id ?? ""),
              diff: [auditDiffLine("name", null, payload.name)],
            });
            return NextResponse.json(result);
          }
        }
        if (action === "review_leave" || action === "run_payroll") {
          logSensitiveMutation(request, auth.subdomain, auth.user, {
            action: action === "run_payroll" ? "hr.payroll.run" : "hr.leave.review",
            entityType: action === "run_payroll" ? "payroll_run" : "leave_request",
            entityId: "",
            diff: [auditDiffLine("action", null, action)],
          });
        }
        return NextResponse.json(result);
      }

      return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    } catch (err) {
      return NextResponse.json(
        { error: err instanceof Error ? err.message : "Request failed" },
        { status: 400 },
      );
    }
  });
}
