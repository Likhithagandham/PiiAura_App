"use client";

export function ListSearch({
  value,
  onChange,
  placeholder = "Search by name, email, phone…",
  label = "Search list",
  className = "",
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  className?: string;
}) {
  return (
    <label className={`eduos-list-search ${className}`.trim()}>
      <span className="eduos-visually-hidden">{label}</span>
      <input
        type="search"
        className="eduos-input eduos-list-search__input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={label}
      />
    </label>
  );
}

export function ListSearchBar({
  value,
  onChange,
  placeholder,
  label,
  total,
  filtered,
  className = "",
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  total?: number;
  filtered?: number;
  className?: string;
}) {
  const showMeta = value.trim().length > 0 && total != null && filtered != null;

  return (
    <div className={`eduos-list-search-bar ${className}`.trim()}>
      <ListSearch
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        label={label}
      />
      {showMeta ? (
        <span className="eduos-list-search-bar__meta">
          {filtered} of {total} shown
        </span>
      ) : null}
    </div>
  );
}
