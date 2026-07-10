"use client";

import type { ReactNode } from "react";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { AuthUser } from "@eduos/types";
import { useAuth } from "@eduos/hooks";
import { fetchCompletedWalkthroughs, markWalkthroughCompleted } from "./walkthrough-api";

export type TourId =
  | { kind: "dashboard"; role: AuthUser["role"] }
  | { kind: "module"; role: AuthUser["role"]; moduleId: string };

type WalkthroughContextValue = {
  ready: boolean;
  completed: Set<string>;
  refresh: () => Promise<void>;
  markCompleted: (key: string) => Promise<void>;
  // replay-only: does not modify completion keys
  startTour: (tour: TourId) => void;
  stopTour: () => void;
  activeTour: TourId | null;
};

const WalkthroughContext = createContext<WalkthroughContextValue | null>(null);

export function WalkthroughProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [ready, setReady] = useState(false);
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [activeTour, setActiveTour] = useState<TourId | null>(null);
  const loadInFlight = useRef<Promise<void> | null>(null);

  const refresh = useCallback(async () => {
    if (!user) {
      setCompleted(new Set());
      setReady(true);
      return;
    }
    if (loadInFlight.current) return loadInFlight.current;
    const p = fetchCompletedWalkthroughs()
      .then((keys) => setCompleted(new Set(keys)))
      .finally(() => {
        loadInFlight.current = null;
        setReady(true);
      });
    loadInFlight.current = p.then(() => undefined);
    return loadInFlight.current;
  }, [user]);

  useEffect(() => {
    setReady(false);
    void refresh();
  }, [refresh, user?.id]);

  const markCompleted = useCallback(async (key: string) => {
    if (!user) return;
    // optimistic local set to avoid re-triggering mid-session
    setCompleted((prev) => new Set(prev).add(key));
    const keys = await markWalkthroughCompleted(key).catch(() => null);
    if (keys) setCompleted(new Set(keys));
  }, [user]);

  const startTour = useCallback((tour: TourId) => setActiveTour(tour), []);
  const stopTour = useCallback(() => setActiveTour(null), []);

  const value = useMemo<WalkthroughContextValue>(() => ({
    ready,
    completed,
    refresh,
    markCompleted,
    startTour,
    stopTour,
    activeTour,
  }), [ready, completed, refresh, markCompleted, startTour, stopTour, activeTour]);

  return <WalkthroughContext.Provider value={value}>{children}</WalkthroughContext.Provider>;
}

export function useWalkthroughs(): WalkthroughContextValue {
  const ctx = useContext(WalkthroughContext);
  if (!ctx) throw new Error("useWalkthroughs must be used within WalkthroughProvider");
  return ctx;
}

