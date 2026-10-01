import type { Metadata } from 'next';
import { HiringShell } from '@/components/hiring-shell';
import { HiringShortlist } from '@/components/hiring-shortlist';
import { developers } from '@/components/developer-profile-data';
export const metadata: Metadata = { title: 'Your shortlist', robots: { index: false, follow: false } };
export default async function ShortlistPage({ searchParams }: { searchParams: Promise<{ profiles?: string | string[]; title?: string | string[] }> }) {
  const query = await searchParams;
  const ids = typeof query.profiles === 'string' ? [...new Set(query.profiles.split(','))].filter(id => developers.some(person => person.id === id)).slice(0, 20) : [];
  const title = typeof query.title === 'string' ? query.title.slice(0, 60).trim() || 'Shared shortlist' : 'Shared shortlist';
  return <HiringShell><HiringShortlist sharedIds={ids} sharedTitle={title} isShared={query.profiles !== undefined} /></HiringShell>;
}
