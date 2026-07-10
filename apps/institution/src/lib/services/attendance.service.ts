/**
 * Back-compat shim. The canonical attendance service is attendance-server.ts
 * (mock vs Django twin). Re-exported here so either import path resolves.
 */
export {
  getAttendanceData,
  getLiveAttendance,
  correctRecord,
  reviewLeave,
  createLeave,
  updateRules,
  exportMonthlyCsv,
  exportDetentionCsv,
} from "./attendance-server";
