interface AdminMessageProps {
  children: React.ReactNode;
  variant?: "success" | "error";
}

export function AdminMessage({ children, variant = "success" }: AdminMessageProps) {
  if (!children) return null;
  return (
    <p
      className={`eduos-admin-message${variant === "error" ? " eduos-admin-message--error" : ""}`}
      role="status"
    >
      {children}
    </p>
  );
}
