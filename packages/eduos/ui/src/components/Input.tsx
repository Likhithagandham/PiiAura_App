import type { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, id, className = "", ...props }: InputProps) {
  const inputId = id ?? props.name;

  return (
    <div>
      {label ? (
        <label htmlFor={inputId} className="eduos-label">
          {label}
        </label>
      ) : null}
      <input
        id={inputId}
        className={`eduos-input ${error ? "eduos-input-error" : ""} ${className}`.trim()}
        {...props}
      />
      {error ? <p className="eduos-field-error">{error}</p> : null}
    </div>
  );
}
