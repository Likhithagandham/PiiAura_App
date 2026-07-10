/** Client-side marks checks (mirrors API validation messages). */
export function parseFacultyMarksInput(
  raw: string,
  maxMarks: number,
): { ok: true; marks: number | null } | { ok: false; error: string } {
  const trimmed = raw.trim();
  if (trimmed === "") return { ok: true, marks: null };
  const n = Number(trimmed);
  if (!Number.isFinite(n)) return { ok: false, error: "Enter a valid number." };
  if (n < 0) return { ok: false, error: `Marks cannot be negative (maximum is ${maxMarks}).` };
  if (n > maxMarks) return { ok: false, error: `Marks cannot exceed ${maxMarks}.` };
  return { ok: true, marks: n };
}
