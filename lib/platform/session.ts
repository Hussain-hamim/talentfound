import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
export const getSession = cache(async () => {
  const db = await createClient();
  const {
    data: { user },
  } = await db.auth.getUser();
  if (!user)
    return {
      db,
      user: null,
      member: null,
      account: null,
      developer: null,
      recruiter: null,
    };
  const [member, account, developer, recruiter] = await Promise.all([
    db.from("members").select("*").eq("id", user.id).maybeSingle(),
    db.from("accounts").select("*").eq("id", user.id).maybeSingle(),
    db.from("developer_profiles").select("*").eq("id", user.id).maybeSingle(),
    db.from("recruiter_profiles").select("*").eq("id", user.id).maybeSingle(),
  ]);
  for (const result of [member, account, developer, recruiter])
    if (result.error) throw result.error;
  return {
    db,
    user,
    member: member.data,
    account: account.data,
    developer: developer.data,
    recruiter: recruiter.data,
  };
});
export async function requireMember(next = "/dashboard") {
  const session = await getSession();
  if (!session.user) redirect(`/login?next=${encodeURIComponent(next)}`);
  if (!session.member || (!session.developer && !session.recruiter))
    redirect(`/onboarding?next=${encodeURIComponent(next)}`);
  return { ...session, user: session.user, member: session.member };
}
