export function filterBySearch<T>(
  items: readonly T[],
  query: string,
  getSearchText: (item: T) => string | Array<string | number | null | undefined>,
): T[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return [...items];

  return items.filter((item) => {
    const parts = getSearchText(item);
    const haystack = (Array.isArray(parts) ? parts : [parts])
      .filter((part) => part != null && String(part).trim() !== "")
      .join(" ")
      .toLowerCase();
    return haystack.includes(normalized);
  });
}
