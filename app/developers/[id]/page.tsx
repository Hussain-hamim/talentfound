import type { Metadata } from "next";
import { getDeveloper } from "@/lib/platform/data";
import { appUrl } from "@/lib/supabase/config";
import { demoProfile } from "@/lib/platform/demo-profiles";
import { PublicShell } from "@/components/platform/public-shell";
import { DeveloperDetail } from "@/components/platform/developer-detail";

type Props = { params: Promise<{ id: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const person = await getDeveloper((await params).id);
  return person
    ? {
        title: `${person.member.name} · ${person.profile.headline}`,
        description: person.profile.bio || person.profile.headline,
        alternates: {
          canonical: `${appUrl()}/developers/${person.profile.handle}`,
        },
        openGraph: {
          title: person.member.name,
          description: person.profile.headline,
        },
        robots: { index: !demoProfile(person.profile.handle), follow: true },
      }
    : { title: "Developer not found", robots: { index: false } };
}

export default function Page({ params }: Props) {
  return (
    <PublicShell>
      <DeveloperDetail params={params} />
    </PublicShell>
  );
}
