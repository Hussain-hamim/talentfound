import { Directory } from "@/components/platform/directory";
import { PublicShell } from "@/components/platform/public-shell";
import { searchDevelopers } from "@/lib/platform/data";
import { getSession } from "@/lib/platform/session";
export const metadata = {
  title: "Explore developers",
  description:
    "Discover developers through their projects, skills, and community profiles.",
};
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
        <Directory {...results} signedIn={!!s.user} viewerId={s.user?.id} />
      </PublicShell>
    </div>
  );
}
