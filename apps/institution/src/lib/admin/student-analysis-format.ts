import type { StudentAnalysisReport } from "@eduos/types";

function formatCurrency(paise: number): string {
  return `₹${(paise / 100).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function riskLabel(score: string): string {
  if (score === "unknown") return "Insufficient data — no marks or attendance on record yet";
  if (score === "high") return "High — needs immediate attention";
  if (score === "medium") return "Medium — monitor closely";
  return "Low — on track";
}

function formatSubjectList(
  subjects: StudentAnalysisReport["analysis"]["weakSubjects"],
  emptyText: string,
): string {
  if (subjects.length === 0) return emptyText;
  return subjects.map((s) => `• ${s.subjectName}: ${s.averageMarks}% avg`).join("\n");
}

function formatRecentMarks(entries: StudentAnalysisReport["marks"]["entries"]): string {
  const recent = entries.slice(0, 8);
  if (recent.length === 0) return "No published marks on record yet.";
  return recent
    .map((entry) => {
      const score = entry.isAbsent ? "Absent" : entry.marks != null ? `${entry.marks}` : "—";
      const tag = entry.isInternal ? " (internal)" : "";
      return `• ${entry.examName} — ${entry.subjectName}: ${score}${tag}`;
    })
    .join("\n");
}

function formatRecentAttendance(
  records: StudentAnalysisReport["attendance"]["records"],
  average: number,
): string {
  const recent = records.slice(0, 5);
  if (recent.length === 0) return `No attendance sessions recorded. Overall: ${average}%.`;
  const lines = recent.map((r) => `• ${r.date}: ${r.status}${r.lateMark ? " (late)" : ""}`);
  return `${lines.join("\n")}\nOverall attendance: ${average}%`;
}

function formatFees(report: StudentAnalysisReport): string {
  const { fees } = report;
  if (fees.openInvoiceCount === 0) {
    return "No outstanding fee dues.";
  }
  const lines = fees.invoices
    .filter((inv) => inv.balancePaise > 0)
    .slice(0, 5)
    .map(
      (inv) =>
        `• ${inv.label}: ${formatCurrency(inv.balancePaise)} due` +
        (inv.dueDate ? ` (due ${inv.dueDate})` : ""),
    );
  return `Outstanding: ${formatCurrency(fees.totalDuePaise)} across ${fees.openInvoiceCount} invoice(s).\n${lines.join("\n")}`;
}

export function formatStudentAnalysisReply(report: StudentAnalysisReport): string {
  const { student, enrollment, analysis } = report;
  const batch = enrollment?.batchName ?? "Not assigned";
  const year = enrollment?.academicYearName ?? "—";

  return [
    `**${student.name}** (${report.rollNumber})`,
    `Batch: ${batch} · Academic year: ${year}`,
    `Academic status: ${report.profile?.academicStatus ?? "—"}`,
    "",
    "**Performance summary**",
    `• Average marks: ${analysis.averageMarks}%`,
    `• Attendance: ${analysis.averageAttendance}%`,
    `• Backlogs / arrears: ${analysis.totalBacklogs}`,
    `• Risk level: ${riskLabel(analysis.riskScore)}`,
    "",
    "**Strong subjects**",
    formatSubjectList(analysis.strongSubjects, "No subjects above 85% average yet."),
    "",
    "**Needs improvement**",
    formatSubjectList(analysis.weakSubjects, "No subjects below 40% average."),
    "",
    "**Recent marks**",
    formatRecentMarks(report.marks.entries),
    "",
    "**Attendance (recent)**",
    formatRecentAttendance(report.attendance.records, analysis.averageAttendance),
    "",
    "**Fees**",
    formatFees(report),
  ].join("\n");
}
