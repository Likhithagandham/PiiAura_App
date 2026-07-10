/** Platform API fetch — callers handle 401/403 (avoid hard reload loops on auth pages). */
export async function platformFetch(
  input: string,
  init?: RequestInit,
): Promise<Response> {
  return fetch(input, {
    ...init,
    credentials: "include",
  });
}
