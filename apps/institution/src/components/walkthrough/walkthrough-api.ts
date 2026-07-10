export async function fetchCompletedWalkthroughs(): Promise<string[]> {
  const res = await fetch("/api/auth/walkthroughs", { credentials: "include" });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    return [];
  }
  return (json as { completed?: string[] }).completed ?? [];
}

export async function markWalkthroughCompleted(key: string): Promise<string[]> {
  const res = await fetch("/api/auth/walkthroughs", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ key }),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    return [];
  }
  return (json as { completed?: string[] }).completed ?? [];
}

