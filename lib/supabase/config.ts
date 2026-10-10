export const projectRef = "zgpqyctyxozsvbjayhaf";
export function supabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key)
    throw new Error("TalentFound database configuration is missing.");
  if (new URL(url).hostname !== `${projectRef}.supabase.co`)
    throw new Error("Incorrect Supabase project.");
  return { url, key };
}
export function appUrl() {
  return (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000").replace(
    /\/$/,
    "",
  );
}
export function validRequestOrigin(origin: string | null) {
  if (!origin) return false;
  if (origin === new URL(appUrl()).origin) return true;
  return (
    process.env.NODE_ENV === "development" &&
    ["http://localhost:3000", "http://127.0.0.1:3000"].includes(origin)
  );
}
export function safeNext(
  value: string | null | undefined,
  fallback = "/dashboard",
) {
  if (
    !value ||
    !value.startsWith("/") ||
    value.startsWith("//") ||
    value.includes("\\") ||
    /[\r\n]/.test(value)
  )
    return fallback;
  try {
    const url = new URL(value, "https://talentfound.invalid");
    return url.origin === "https://talentfound.invalid" &&
      !/^\/(?:login|signup|auth)(?:\/|$)/.test(url.pathname)
      ? url.pathname + url.search
      : fallback;
  } catch {
    return fallback;
  }
}
