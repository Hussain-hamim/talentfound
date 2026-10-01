import type { Metadata } from 'next';
import { HiringShell } from '@/components/hiring-shell';
import { engagements, type Engagement } from '@/components/developer-hiring-data';
import { DeveloperProfiles } from '@/components/developer-profiles';
export const metadata: Metadata = { title: 'Explore developers', description: 'Find developers through their work, working preferences, and project experience.', robots: { index: false, follow: false } };
export default async function DevelopersPage({ searchParams }: { searchParams: Promise<{ engagement?: string }> }) {
  const query = await searchParams;
  const engagement = engagements.includes(query.engagement as Engagement) ? query.engagement as Engagement : '';
  return <HiringShell><h1 className="sr-only">Explore developers</h1><DeveloperProfiles key={engagement} directory initialEngagement={engagement} /></HiringShell>;
}
