import { StructuredData } from "@/components/seo/structured-data";
import { publicMetadata, siteUrl } from "@/lib/seo/metadata";
import { Directory } from "@/components/platform/directory";
import { PublicShell } from "@/components/platform/public-shell";
import { searchDevelopers } from "@/lib/platform/data";
import { getSession } from "@/lib/platform/session";
export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const filtered = Object.keys(params).some(
    (key) => !key.startsWith("utm_") && !["gclid", "fbclid"].includes(key),
  );
  return publicMetadata({
    title: "Explore Developers & Portfolios",
    description:
      "Find frontend, backend, and full-stack developers. Explore their projects, skills, and availability for freelance work, full-time roles, and collaboration.",
    path: "/developers",
    index: !filtered,
  });
}
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [results, s] = await Promise.all([
    searchParams.then(searchDevelopers),
    getSession(),
  ]);
  return (
    <div className="directory-atmosphere">
      <PublicShell>
        <StructuredData
          data={{
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: "Explore Developers & Portfolios",
            url: `${siteUrl()}/developers`,
            description:
              "Discover developers through their projects, skills, and availability.",
            isPartOf: { "@id": `${siteUrl()}/#website` },
          }}
        />
        <Directory {...results} signedIn={!!s.user} viewerId={s.user?.id} />
      </PublicShell>
    </div>
  );
}
