import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { developers } from '@/components/developer-profile-data';
import { HiringInvitation } from '@/components/hiring-invitation';
import { HiringShell } from '@/components/hiring-shell';
export const metadata: Metadata = { title: 'Prepare an invitation', robots: { index: false, follow: false } };
export default async function InvitePage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ draft?: string | string[] }> }) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const person = developers.find(item => item.id === id);
  if (!person) notFound();
  return <HiringShell><HiringInvitation person={person} draftId={typeof query.draft === 'string' ? query.draft : undefined} /></HiringShell>;
}
