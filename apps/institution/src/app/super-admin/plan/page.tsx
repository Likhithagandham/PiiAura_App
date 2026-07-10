"use client";

import { useEffect } from "react";

export default function SuperAdminPlanPage() {
  useEffect(() => {
    window.location.replace("/super-admin/billing");
  }, []);
  return <p className="eduos-empty">Redirecting…</p>;
}
