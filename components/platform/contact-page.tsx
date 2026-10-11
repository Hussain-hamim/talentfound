import { notFound, redirect } from "next/navigation";
import { PublicShell } from "./public-shell";
import { Compose } from "./compose";
import { getSession } from "@/lib/platform/session";
import { getDeveloper } from "@/lib/platform/data";
import { isDemoProfile } from "@/lib/platform/demo-profiles";
export async function ContactPage({
  handle,
  invite = false,
}: {
  handle: string;
  invite?: boolean;
}) {
  const [person, s] = await Promise.all([getDeveloper(handle), getSession()]);
  if (!person) notFound();
  if (s.user) {
    const next = encodeURIComponent(
      `/developers/${handle}/${invite ? "invite" : "message"}`,
    );
    if (!s.member || (!s.developer && !s.recruiter))
      redirect(`/onboarding?next=${next}`);
  }
  if (s.user?.id === person.profile.id)
    return (
      <PublicShell>
        <p>
          This is your profile. Explore the community to start a conversation.
        </p>
      </PublicShell>
    );
  const result = s.user
    ? await s.db
        .from("opportunities")
        .select("*")
        .eq("owner_id", s.user.id)
        .eq("status", "active")
    : null;
  if (result?.error) throw result.error;
  return (
    <PublicShell>
      <Compose
        recipient={person.profile.id}
        name={person.member.name}
        handle={handle}
        invite={invite}
        demo={isDemoProfile(person.profile.handle)}
        signedIn={!!s.user && !!s.member && (!!s.developer || !!s.recruiter)}
        opportunities={result?.data || []}
      />
    </PublicShell>
  );
}
