import AsyncStorage from '@react-native-async-storage/async-storage';
import type { WalkthroughProgressRecord } from '@piiaura/types';
import { WALKTHROUGH_STORAGE_KEY } from '@piiaura/constants';

type ProgressStore = Record<string, WalkthroughProgressRecord>;

const SIMULATED_LATENCY_MS = 120;

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function readStore(): Promise<ProgressStore> {
  const raw = await AsyncStorage.getItem(WALKTHROUGH_STORAGE_KEY);
  if (!raw) return {};
  try {
    return JSON.parse(raw) as ProgressStore;
  } catch {
    return {};
  }
}

async function writeStore(store: ProgressStore) {
  await AsyncStorage.setItem(WALKTHROUGH_STORAGE_KEY, JSON.stringify(store));
}

function createDefaultRecord(userId: string): WalkthroughProgressRecord {
  return {
    userId,
    hasCompletedWalkthrough: false,
    moduleCompletions: {},
    updatedAt: new Date().toISOString(),
  };
}

export async function fetchWalkthroughProgress(userId: string): Promise<WalkthroughProgressRecord> {
  await delay(SIMULATED_LATENCY_MS);
  const store = await readStore();
  return store[userId] ?? createDefaultRecord(userId);
}

export async function saveWalkthroughProgress(
  record: WalkthroughProgressRecord,
): Promise<WalkthroughProgressRecord> {
  await delay(SIMULATED_LATENCY_MS);
  const store = await readStore();
  const next: WalkthroughProgressRecord = {
    ...record,
    updatedAt: new Date().toISOString(),
  };
  store[record.userId] = next;
  await writeStore(store);
  return next;
}

export async function markDashboardWalkthroughComplete(
  userId: string,
): Promise<WalkthroughProgressRecord> {
  const current = await fetchWalkthroughProgress(userId);
  return saveWalkthroughProgress({
    ...current,
    hasCompletedWalkthrough: true,
  });
}

export async function markModuleWalkthroughComplete(
  userId: string,
  moduleId: string,
): Promise<WalkthroughProgressRecord> {
  const current = await fetchWalkthroughProgress(userId);
  return saveWalkthroughProgress({
    ...current,
    moduleCompletions: {
      ...current.moduleCompletions,
      [moduleId]: true,
    },
  });
}

export function isModuleWalkthroughComplete(
  record: WalkthroughProgressRecord | null | undefined,
  moduleId: string,
): boolean {
  return Boolean(record?.moduleCompletions[moduleId]);
}
