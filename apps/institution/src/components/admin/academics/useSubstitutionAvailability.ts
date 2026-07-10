"use client";

import { useEffect, useState } from "react";
import type { SubstitutionAvailability } from "@eduos/types";

export function useSubstitutionAvailability(timetableSlotId: string, date: string) {
  const [availability, setAvailability] = useState<SubstitutionAvailability | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!timetableSlotId || !date) {
      setAvailability(null);
      setError(null);
      return;
    }

    let cancelled = false;
    const timer = window.setTimeout(() => {
      void (async () => {
        setLoading(true);
        setError(null);
        try {
          const params = new URLSearchParams({ timetableSlotId, date });
          const res = await fetch(
            `/api/admin/academics/substitutions/available-faculty?${params}`,
            { credentials: "include" },
          );
          const json = await res.json();
          if (cancelled) return;
          if (!res.ok) {
            setError(json.error ?? "Failed to load available faculty");
            setAvailability(null);
            return;
          }
          setAvailability(json as SubstitutionAvailability);
        } catch {
          if (!cancelled) {
            setError("Failed to load available faculty");
            setAvailability(null);
          }
        } finally {
          if (!cancelled) setLoading(false);
        }
      })();
    }, 200);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [timetableSlotId, date]);

  return { availability, loading, error };
}
