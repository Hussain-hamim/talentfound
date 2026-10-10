import { redirect } from "next/navigation";
import { getSession } from "@/lib/platform/session";
import { safeNext } from "@/lib/supabase/config";
import { Onboarding } from "@/components/platform/onboarding";
import "../dashboard/dashboard.css";
export const metadata = {
  title: "Make yourself at home",
  robots: { index: false, follow: false },
};
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ role?: string; next?: string }>;
}) {
  const params = await searchParams;
  const next = safeNext(params.next);
  const s = await getSession();
  if (!s.user)
    redirect(
      `/login?next=${encodeURIComponent(`/onboarding?role=${params.role || "developer"}&next=${encodeURIComponent(next)}`)}`,
    );
  if (!s.user.email_confirmed_at) redirect("/verify-email");
  const role = params.role || "developer";
  if (
    (role === "developer" && s.developer) ||
    (role !== "developer" && s.recruiter)
  )
    redirect(next);
  return (
    <Onboarding
      key={s.user.id + role}
      name={
        s.member?.name ||
        s.user.user_metadata.full_name ||
        s.user.user_metadata.name ||
        ""
      }
      role={role}
      next={next}
    />
  );
}
