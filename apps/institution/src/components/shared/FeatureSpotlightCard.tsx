interface FeatureSpotlightCardProps {
  badge: string;
  title: string;
  description: string;
  tip: string;
}

export function FeatureSpotlightCard({ badge, title, description, tip }: FeatureSpotlightCardProps) {
  return (
    <section
      style={{
        background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
        borderRadius: "var(--eduos-radius, 12px)",
        padding: "1.25rem 1.5rem",
        color: "#f8fafc",
        marginBottom: "1.25rem",
        maxWidth: "720px",
      }}
    >
      <span
        style={{
          display: "inline-block",
          fontSize: "0.6875rem",
          fontWeight: 600,
          letterSpacing: "0.04em",
          textTransform: "uppercase",
          padding: "0.2rem 0.55rem",
          borderRadius: "6px",
          background: "rgba(59, 130, 246, 0.25)",
          color: "#93c5fd",
          marginBottom: "0.75rem",
        }}
      >
        {badge}
      </span>
      <h3 style={{ margin: "0 0 0.5rem", fontSize: "1.125rem", fontWeight: 700, lineHeight: 1.3 }}>
        {title}
        <span
          style={{
            marginLeft: "0.5rem",
            fontSize: "0.6875rem",
            fontWeight: 600,
            letterSpacing: "0.04em",
            textTransform: "uppercase",
            padding: "0.1rem 0.45rem",
            borderRadius: "999px",
            background: "rgba(251, 191, 36, 0.2)",
            color: "#fcd34d",
            verticalAlign: "middle",
          }}
        >
          Coming soon
        </span>
      </h3>
      <p style={{ margin: 0, fontSize: "0.875rem", lineHeight: 1.55, color: "#94a3b8" }}>
        {description}
      </p>
      <p
        style={{
          margin: "0.85rem 0 0",
          fontSize: "0.8125rem",
          lineHeight: 1.45,
          color: "#cbd5e1",
          padding: "0.55rem 0.75rem",
          borderRadius: "8px",
          background: "rgba(148, 163, 184, 0.12)",
        }}
      >
        <span aria-hidden style={{ marginRight: "0.35rem" }}>
          💡
        </span>
        {tip}
      </p>
    </section>
  );
}
