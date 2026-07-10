"use client";

import { useEffect, useState } from "react";

/** Returns `value`, but only updates after `delayMs` of no further changes —
 * use for search inputs so every keystroke doesn't trigger a request. */
export function useDebouncedValue<T>(value: T, delayMs = 300): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return debounced;
}
