"use client";

import type { FacultyOption } from "@eduos/types";

export function FacultySelect({
  faculty,
  value,
  onChange,
  placeholder = "Select teacher",
  id,
}: {
  faculty: FacultyOption[];
  value: string;
  onChange: (userId: string) => void;
  placeholder?: string;
  id?: string;
}) {
  return (
    <select
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{ width: "100%", padding: "0.5rem" }}
    >
      <option value="">{placeholder}</option>
      {faculty.map((f) => (
        <option key={f.userId} value={f.userId}>
          {f.name}
        </option>
      ))}
    </select>
  );
}
