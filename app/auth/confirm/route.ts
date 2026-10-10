import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { appUrl, safeNext } from "@/lib/supabase/config";
export async function GET(request: NextRequest) {
  const token_hash = request.nextUrl.searchParams.get("token_hash");
  const type = request.nextUrl.searchParams.get("type");
  if (
    token_hash &&
    ["signup", "email", "recovery", "email_change"].includes(type || "")
  ) {
    const db = await createClient();
    const { error } = await db.auth.verifyOtp({
      token_hash,
      type: type as EmailOtpType,
    });
    if (!error)
      return NextResponse.redirect(
        new URL(
          type === "recovery"
            ? "/reset-password"
            : safeNext(request.nextUrl.searchParams.get("next")),
          appUrl(),
        ),
      );
  }
  return NextResponse.redirect(new URL("/login?error=link_expired", appUrl()));
}
