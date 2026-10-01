import { notFound } from 'next/navigation';
import { developers } from '@/components/developer-profile-data';
import { HiringMessages } from '@/components/hiring-messages';

export default async function ConversationPage({ params }: { params: Promise<{ developerId: string }> }) {
  const { developerId } = await params;
  if (!developers.some(person => person.id === developerId)) notFound();
  return <HiringMessages developerId={developerId} />;
}
