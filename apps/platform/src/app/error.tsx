"use client";

export default function PlatformError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div style={{ padding: "2rem" }}>
      <p style={{ color: "var(--color-danger, #dc2626)", marginBottom: "1rem" }}>
        {error.message || "Something went wrong."}
      </p>
      <button className="eduos-btn eduos-btn-primary" onClick={reset}>
        Try again
      </button>
    </div>
  );
}
