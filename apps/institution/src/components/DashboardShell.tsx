"use client";

import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { AUTH_ROUTES } from "@eduos/constants";
import { useAuth } from "@eduos/hooks";

interface DashboardShellProps {
  title: string;
  children: ReactNode;
  headerExtra?: ReactNode;
}

export function DashboardShell({
  title,
  children,
  headerExtra,
}: DashboardShellProps) {
  const { user, logout } = useAuth();
  const router = useRouter();

  async function handleLogout() {
    await logout();
    router.push(AUTH_ROUTES.login);
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f7fafc",
        color: "#1a202c",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <header
        style={{
          background: "#fff",
          borderBottom: "1px solid #e2e8f0",
          padding: "0.75rem 1.5rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "1rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <span style={{ fontSize: "1.125rem" }}>🏫</span>
          <h1 style={{ fontSize: "1rem", fontWeight: 600, color: "#1a202c" }}>{title}</h1>
          {headerExtra}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <span style={{ fontSize: "0.875rem", color: "#718096" }}>{user?.name}</span>
          <button
            type="button"
            onClick={handleLogout}
            style={{
              fontSize: "0.875rem",
              color: "#1a5f4a",
              background: "none",
              border: "1px solid #e2e8f0",
              borderRadius: "6px",
              padding: "0.375rem 0.75rem",
              cursor: "pointer",
            }}
          >
            Logout
          </button>
        </div>
      </header>
      <main style={{ padding: "1.5rem", maxWidth: "960px", margin: "0 auto" }}>
        {children}
      </main>
    </div>
  );
}
