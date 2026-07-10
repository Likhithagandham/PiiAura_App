"use client";

import Link from "next/link";
import type { PlatformPlanLimitBlockedResponse } from "@eduos/types";
import { PLATFORM_OWNER_ROUTES } from "@eduos/constants";
import { Button } from "@eduos/ui";

interface PlatformPlanLimitModalProps {
  blocked: PlatformPlanLimitBlockedResponse;
  onClose: () => void;
}

export function PlatformPlanLimitModal({ blocked, onClose }: PlatformPlanLimitModalProps) {
  const { violation } = blocked;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="plan-limit-title"
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.45)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1.5rem",
        zIndex: 50,
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "440px",
          background: "var(--eduos-card)",
          borderRadius: "var(--eduos-radius-lg)",
          padding: "1.75rem",
          boxShadow: "var(--eduos-shadow)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2
          id="plan-limit-title"
          style={{
            fontSize: "1.25rem",
            fontWeight: 700,
            marginBottom: "0.5rem",
            color: "var(--eduos-text)",
          }}
        >
          {blocked.title}
        </h2>
        <p
          style={{
            fontSize: "0.875rem",
            color: "var(--eduos-text-muted)",
            marginBottom: "1rem",
            lineHeight: 1.5,
          }}
        >
          {blocked.detail}
        </p>

        <div
          style={{
            fontSize: "0.8125rem",
            padding: "0.75rem 1rem",
            background: "var(--eduos-surface-muted)",
            borderRadius: "var(--eduos-radius)",
            marginBottom: "1.25rem",
          }}
        >
          <div>
            <strong>Plan:</strong> {violation.planLabel}
          </div>
          {violation.disallowedFeatures && violation.disallowedFeatures.length > 0 ? (
            <div style={{ marginTop: "0.35rem" }}>
              <strong>Not included:</strong> {violation.disallowedFeatures.join(", ")}
            </div>
          ) : null}
          {violation.branchCount != null && violation.maxBranches != null ? (
            <div style={{ marginTop: "0.35rem" }}>
              <strong>Branches:</strong> {violation.branchCount} / {violation.maxBranches} max
            </div>
          ) : null}
          {violation.studentCount != null && violation.maxStudents != null ? (
            <div style={{ marginTop: "0.35rem" }}>
              <strong>Students:</strong> {violation.studentCount.toLocaleString("en-IN")} /{" "}
              {violation.maxStudents.toLocaleString("en-IN")} max
            </div>
          ) : null}
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem" }}>
          <Button type="button" onClick={onClose}>
            OK
          </Button>
          <Link href={PLATFORM_OWNER_ROUTES.plans} className="eduos-link" style={{ alignSelf: "center" }}>
            View plans
          </Link>
        </div>
      </div>
    </div>
  );
}
