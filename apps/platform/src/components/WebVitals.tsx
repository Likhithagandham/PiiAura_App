"use client";

import { useReportWebVitals } from "next/web-vitals";

export function WebVitals() {
  useReportWebVitals((metric) => {
    if (process.env.NODE_ENV === "production") {
      void fetch("/api/vitals", {
        method: "POST",
        body: JSON.stringify(metric),
        headers: { "Content-Type": "application/json" },
        keepalive: true,
      });
    }
  });
  return null;
}
