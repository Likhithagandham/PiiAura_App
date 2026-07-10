import type { AttendanceStatus, FacultyMarkAttendanceGeo } from "@eduos/types";

const STORAGE_KEY = "eduos-faculty-attendance-queue";

export interface FacultyAttendanceQueueItem {
  id: string;
  recordId: string;
  newStatus: AttendanceStatus;
  geo?: FacultyMarkAttendanceGeo;
  queuedAt: string;
}

function readRaw(): FacultyAttendanceQueueItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as FacultyAttendanceQueueItem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeRaw(items: FacultyAttendanceQueueItem[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function getAttendanceQueue(): FacultyAttendanceQueueItem[] {
  return readRaw();
}

export function getAttendanceQueueLength(): number {
  return readRaw().length;
}

export function enqueueAttendanceMark(
  item: Omit<FacultyAttendanceQueueItem, "id" | "queuedAt">,
): FacultyAttendanceQueueItem {
  const entry: FacultyAttendanceQueueItem = {
    ...item,
    id: `q-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    queuedAt: new Date().toISOString(),
  };
  const next = [...readRaw(), entry];
  writeRaw(next);
  return entry;
}

export function dequeueAttendanceMark(): FacultyAttendanceQueueItem | null {
  const items = readRaw();
  if (items.length === 0) return null;
  const [head, ...rest] = items;
  writeRaw(rest);
  return head ?? null;
}

/** Put a failed sync item back at the front (FIFO). */
export function requeueAttendanceMarkAtFront(item: FacultyAttendanceQueueItem): void {
  writeRaw([item, ...readRaw()]);
}

export function clearAttendanceQueue(): void {
  writeRaw([]);
}
