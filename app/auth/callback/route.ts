import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { appUrl, safeNext } from "@/lib/supabase/config";
export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const next = safeNext(request.nextUrl.searchParams.get("next"));
  function failed(
    reason: "oauth_cancelled" | "sign_in_failed" | "link_expired",
  ) {
    const login = new URL("/login", appUrl());
    login.searchParams.set("error", reason);
    login.searchParams.set("next", next);
    return NextResponse.redirect(login);
  }
  const providerError = request.nextUrl.searchParams.get("error");
  if (providerError)
    return failed(
      providerError === "access_denied" ? "oauth_cancelled" : "sign_in_failed",
    );
  if (code) {
    try {
      const db = await createClient();
      const { error } = await db.auth.exchangeCodeForSession(code);
      if (!error) return NextResponse.redirect(new URL(next, appUrl()));
    } catch {
      // Keep the return path available when a temporary Auth failure is retried.
    }
    return failed("sign_in_failed");
  }
  return failed("link_expired");
}
