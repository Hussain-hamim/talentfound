"use client";
export async function mutate<T = unknown>(
  action: string,
  input: unknown = {},
): Promise<T> {
  const response = await fetch("/api/platform", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, input }),
  });
  const result = await response.json();
  if (!response.ok)
    throw new Error(result.error || "Could not save your changes.");
  return result.data as T;
}
export async function load<T>(query: string): Promise<T> {
  const response = await fetch(`/api/platform?${query}`, { cache: "no-store" });
  const result = await response.json();
  if (!response.ok)
    throw new Error(result.error || "Could not load your data.");
  return result.data as T;
}
