import type { Metadata } from "next";
import { getDeveloper } from "@/lib/platform/data";
import { publicMetadata, siteUrl } from "@/lib/seo/metadata";
import { StructuredData } from "@/components/seo/structured-data";
import { demoProfile } from "@/lib/platform/demo-profiles";
import { PublicShell } from "@/components/platform/public-shell";
import { DeveloperDetail } from "@/components/platform/developer-detail";

type Props = { params: Promise<{ id: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const person = await getDeveloper((await params).id);
  if (!person)
    return {
      title: "Developer not found",
      robots: { index: false, follow: false },
    };
  return publicMetadata({
    title: `${person.member.name} · ${person.profile.headline}`,
    description: (
      person.profile.bio ||
      `${person.member.name}, ${person.profile.headline}. Explore their projects, skills, and availability on TalentFound.`
    )
      .replace(/\s+/g, " ")
      .slice(0, 160),
    path: `/developers/${person.profile.handle}`,
    image: `/developers/${person.profile.handle}/opengraph-image`,
    index: !demoProfile(person.profile.handle),
  });
}

export default async function Page({ params }: Props) {
  const person = await getDeveloper((await params).id);
  const url = person ? `${siteUrl()}/developers/${person.profile.handle}` : "";
  return (
    <PublicShell>
      {person && !demoProfile(person.profile.handle) && (
        <StructuredData
          data={{
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "ProfilePage",
                "@id": url,
                url,
                dateCreated: person.profile.created_at,
                mainEntity: {
                  "@type": "Person",
                  name: person.member.name,
                  description: person.profile.bio || person.profile.headline,
                  jobTitle: person.profile.headline,
                  url,
                  ...(person.avatarUrl ? { image: person.avatarUrl } : {}),
                  knowsAbout: person.profile.skills,
                  sameAs: [
                    person.profile.website,
                    person.profile.github,
                    person.profile.linkedin,
                  ].filter((value) => /^https?:\/\//.test(value)),
                },
              },
              {
                "@type": "BreadcrumbList",
                itemListElement: [
                  {
                    "@type": "ListItem",
                    position: 1,
                    name: "Home",
                    item: siteUrl(),
                  },
                  {
                    "@type": "ListItem",
                    position: 2,
                    name: "Developers",
                    item: `${siteUrl()}/developers`,
                  },
                  {
                    "@type": "ListItem",
                    position: 3,
                    name: person.member.name,
                    item: url,
                  },
                ],
              },
            ],
          }}
        />
      )}
      <DeveloperDetail params={params} />
    </PublicShell>
  );
}
