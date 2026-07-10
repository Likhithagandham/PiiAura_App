/**
 * HR service — real Django backend.
 *
 * The admin HR screen consumes the full HrData aggregate (9 lists). The backend
 * endpoint GET /api/v1/hr/admin-overview/ returns that exact camelCase shape, so
 * the real path is a typed passthrough — no field remapping needed.
 */

import type {
  ApplyLeaveInput,
  CreatePayrollAdjustmentInput,
  HrData,
  ReviewLeaveInputHr,
  RunPayrollInput,
  SaveSalaryTemplateInput,
  SaveEmployeeInput,
} from "@eduos/types";
import { djangoGet, djangoSend } from "./django-client";

export async function getHrData(
  request: Request,
  subdomain: string,
  branchId?: string | null,
): Promise<HrData> {
  return djangoGet<HrData>(request, "/api/v1/hr/admin-overview/");
}

const paise = (rupees: number) => Math.round((rupees || 0) * 100);

// Payroll mutations require step-up verification (EC-CEL header).
const STEP_UP = { "X-Step-Up-Verified": "true" };

/** HR actions that map cleanly to a backend endpoint. */
export const HR_BACKED_ACTIONS = new Set([
  "apply_leave",
  "review_leave",
  "run_payroll",
  "save_salary_template",
  "create_payroll_adjustment",
  "save_employee",
]);

export function applyLeave(request: Request, input: ApplyLeaveInput) {
  return djangoSend(request, "/api/v1/hr/leave/", "POST", {
    employeeId: input.employeeId,
    leaveType: input.leaveType,
    fromDate: input.fromDate,
    toDate: input.toDate,
    reason: input.reason,
  });
}

export function reviewLeave(request: Request, input: ReviewLeaveInputHr) {
  return djangoSend(request, `/api/v1/hr/leave/${input.requestId}/decide/`, "PATCH", {
    action: input.approve ? "approve" : "reject",
    note: input.note ?? "",
  });
}

export function runPayroll(request: Request, input: RunPayrollInput) {
  return djangoSend(
    request,
    "/api/v1/hr/payroll/runs/",
    "POST",
    { periodMonth: `${input.month}-01` },
    STEP_UP,
  );
}

export function saveSalaryTemplate(request: Request, input: SaveSalaryTemplateInput) {
  return djangoSend(request, "/api/v1/hr/salary-components/", "POST", {
    name: input.name,
    kind: input.kind,
    calc: "fixed",
    amountPaise: paise(input.amount),
  });
}

export function createPayrollAdjustment(request: Request, input: CreatePayrollAdjustmentInput) {
  // amount_paise is signed on the backend; deductions are negative (recovery).
  const signed = input.kind === "deduction" ? -paise(input.amount) : paise(input.amount);
  return djangoSend(
    request,
    "/api/v1/hr/payroll/adjustments/",
    "POST",
    {
      employeeId: input.employeeId,
      originalRunId: input.payrollRunId,
      amountPaise: signed,
      reason: input.note?.trim() || input.label,
    },
    STEP_UP,
  );
}

export async function saveEmployee(request: Request, input: SaveEmployeeInput) {
  const joinedAt = input.joinedAt ?? new Date().toISOString().slice(0, 10);
  const res = await djangoSend<{
    employee: {
      id: string;
      name: string;
      employmentType: string;
      branchId: string;
      joinedAt: string;
    };
  }>(request, "/api/v1/hr/employees/", "POST", {
    userId: input.userId,
    employeeCode: input.employeeCode,
    employmentType: input.employmentType,
    designation: input.roleLabel,
    joinedAt,
  });
  const e = res.employee;
  return {
    id: e.id,
    name: e.name,
    roleLabel: input.roleLabel,
    employmentType: e.employmentType as SaveEmployeeInput["employmentType"],
    primaryBranchId: e.branchId,
    primaryBranchName: "",
    active: true,
    joinedAt: e.joinedAt,
    exitedAt: null,
    presentDays: 0,
    absentDays: 0,
    leaveDays: 0,
  };
}
