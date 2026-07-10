interface ComingSoonPanelProps {
  title: string;
  description: string;
  badge?: string;
}

export function ComingSoonPanel({ title, description, badge }: ComingSoonPanelProps) {
  return (
    <section className="eduos-panel" style={{ maxWidth: "640px" }}>
      {badge ? (
        <p
          className="eduos-panel__desc"
          style={{
            marginBottom: "0.5rem",
            display: "inline-block",
            padding: "0.15rem 0.5rem",
            borderRadius: "999px",
            background: "var(--eduos-primary-light, #e8f5f0)",
            color: "var(--eduos-primary)",
            fontSize: "0.75rem",
            fontWeight: 600,
          }}
        >
          {badge}
        </p>
      ) : (
        <p className="eduos-panel__desc" style={{ marginBottom: "0.5rem" }}>
          Coming soon
        </p>
      )}
      <h2 className="eduos-panel__title">{title}</h2>
      <p className="eduos-panel__desc" style={{ marginTop: "0.75rem" }}>
        {description}
      </p>
    </section>
  );
}
