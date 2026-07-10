interface PasswordStrengthProps {
  password: string;
}

function getStrength(password: string): { score: number; label: string } {
  if (password.length < 10) {
    return { score: 0, label: "Too short (min 10 characters)" };
  }
  let score = 1;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  const labels = ["Weak", "Fair", "Good", "Strong"];
  return { score, label: labels[Math.min(score - 1, 3)] ?? "Weak" };
}

export function PasswordStrength({ password }: PasswordStrengthProps) {
  if (!password) return null;
  const { score, label } = getStrength(password);
  const colors = ["#c53030", "#dd6b20", "#d69e2e", "#1a5f4a"];

  return (
    <div style={{ marginTop: "0.5rem" }}>
      <div
        style={{
          display: "flex",
          gap: "4px",
          marginBottom: "0.25rem",
        }}
      >
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            style={{
              flex: 1,
              height: "4px",
              borderRadius: "2px",
              background: i <= score ? colors[score - 1] : "var(--eduos-border)",
            }}
          />
        ))}
      </div>
      <p style={{ fontSize: "0.75rem", color: "var(--eduos-text-muted)" }}>{label}</p>
    </div>
  );
}
