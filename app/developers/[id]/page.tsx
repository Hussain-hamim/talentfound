import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ArrowUpRight, Clock3, MapPin } from 'lucide-react';
import { developers, developerCategoryThemes } from '@/components/developer-profile-data';
import { SkillList, ProjectCover } from '@/components/developer-card-parts';
import { DeveloperReviews } from '@/components/developer-reviews';
import { reviewSummary } from '@/components/developer-ranking';
import { hiringDetails, compensation, projectSlug } from '@/components/developer-hiring-data';
import { ProjectEvidenceDetail } from '@/components/project-evidence-detail';
import { HiringShell } from '@/components/hiring-shell';
import { SaveDeveloper, CopyLink, InviteLink, MessageLink } from '@/components/hiring-ui';
import Image from 'next/image';

type Props = { params: Promise<{ id: string }> };
export function generateStaticParams() { return developers.map(person => ({ id: person.id })); }
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const person = developers.find(item => item.id === id);
  return { title: person ? `${person.name} · ${person.role}` : 'Developer not found', description: person?.bio, robots: { index: false, follow: false } };
}
export default async function DeveloperPage({ params }: Props) {
  const { id } = await params;
  const person = developers.find(item => item.id === id);
  if (!person) notFound();
  const details = hiringDetails[id];
  const summary = reviewSummary(person.reviews);
  return <HiringShell><article className={`hiring-profile theme-${developerCategoryThemes[person.category]}`}>
    <div className="hiring-profile-top"><Link className="hiring-text-link" href="/developers"><ArrowLeft size={14} /> Explore talent</Link><CopyLink /></div>
    <header className="hiring-profile-hero"><div><p className="hiring-eyebrow">THE PERSON BEHIND THE WORK · SAMPLE PROFILE</p><div className="hiring-profile-identity"><Image className={`developer-avatar theme-${person.theme}`} src={person.avatar} alt="" width={88} height={88} /><div><h1>{person.name}</h1><p>{person.role}</p></div></div><p className="hiring-profile-bio">{person.bio}</p><div className="hiring-profile-meta"><span><MapPin size={14} />{person.location}</span><span>{person.experience} experience</span><span><Clock3 size={14} />{details.utcHours[0]}:00–{details.utcHours[1]}:00 UTC</span></div><SkillList person={person} /></div><aside className="hiring-contact-card"><span className="hiring-eyebrow">LET’S WORK TOGETHER</span><h2>{person.start}</h2><p>{details.hoursPerWeek} hours/week · {person.workStyle.split(' · ')[0]}</p><ul>{details.engagements.map(type => <li key={type}><span>{type}</span><strong>{compensation(person, type)}</strong></li>)}</ul><div className="hiring-contact-actions"><MessageLink id={id} /><InviteLink id={id} /><SaveDeveloper id={id} name={person.name} /></div><small>Illustrative preferences. Invitations are local drafts; nothing is sent.</small></aside></header>
    <nav className="hiring-profile-nav" aria-label="Profile sections"><a href="#work">Selected work <span>{person.projects.length}</span></a><a href="#working-together">Working together</a><a href="#reviews">Reviews <span>{summary.count}</span></a><a href="#profile-context">Profile context</a></nav>
    <section className="hiring-profile-section" id="work"><div className="hiring-section-heading"><div><span className="hiring-eyebrow">01 / SELECTED WORK</span><h2>What I’ve been building.</h2></div><p>My role, the problem, and the decisions behind the interface.</p></div><div className="hiring-case-grid">{person.projects.map(project => <article id={`project-${projectSlug(project)}`} className="hiring-case" key={project.name}><ProjectCover project={project} /><ProjectEvidenceDetail person={person} project={project} showProfileLink={false} /></article>)}</div></section>
    <section className="hiring-profile-section" id="working-together"><span className="hiring-eyebrow">02 / WORKING TOGETHER</span><h2>A little about how I work.</h2><p className="hiring-approach">{details.approach}</p><div className="hiring-working-grid"><div><h3>Where I can help</h3><p>{person.specialty}</p><ul>{[...details.domains, ...person.strengths].map(item => <li key={item}>{item}</li>)}</ul></div><div><h3>Before we start</h3><p>Share the outcome you need, your timeline, and who I’ll work with. We can use a small, agreed scope to check how we collaborate.</p><div className="hiring-conversation-actions"><MessageLink id={id} /><InviteLink id={id} /></div></div>{details.founder && <div><h3>Building as a co-founder</h3><dl><div><dt>Stage</dt><dd>{details.founder.stage}</dd></div><div><dt>Commitment</dt><dd>{details.founder.commitment}</dd></div><div><dt>Equity</dt><dd>{details.founder.equity}</dd></div></dl><p>{details.founder.lookingFor}</p></div>}</div></section>
    <section className="hiring-profile-section" id="reviews"><span className="hiring-eyebrow">03 / CLIENT FEEDBACK</span><DeveloperReviews person={person} /></section>
    <section className="hiring-profile-section hiring-context-section" id="profile-context"><div><span className="hiring-eyebrow">04 / PROFILE CONTEXT</span><h2>Know what you’re looking at.</h2><p>This is a fictional profile. Project descriptions and reviews illustrate the experience; no identity, employment, client engagement, or technical assessment has been verified.</p></div><div><h3>Elsewhere online</h3><p>Portfolio, GitHub, and LinkedIn links will appear here when a developer adds their own addresses. Sample handles are not linked to real people.</p><CopyLink label="Share this sample profile" /><Link className="hiring-text-link" href="/developers">Find another developer <ArrowUpRight size={14} /></Link></div></section>
  </article></HiringShell>;
}
