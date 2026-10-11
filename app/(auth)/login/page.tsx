import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth-form";
import { getSession } from "@/lib/platform/session";
import { safeNext } from "@/lib/supabase/config";
export const metadata: Metadata = { title: "Log in" };
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const [params, s] = await Promise.all([searchParams, getSession()]);
  if (s.user && !params.error) {
    const next = safeNext(params.next);
    redirect(
      s.member && (s.developer || s.recruiter)
        ? next
        : `/onboarding?next=${encodeURIComponent(next)}`,
    );
  }
  return <AuthForm mode="login" />;
}
