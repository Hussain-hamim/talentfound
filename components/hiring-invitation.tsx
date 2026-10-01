'use client';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowUpRight, Check } from 'lucide-react';
import type { Developer } from './developer-profile-data';
import { hiringDetails, type Engagement } from './developer-hiring-data';
import { useHiringStore, updateHiringStore, type Invitation } from './hiring-store';

export function HiringInvitation({ person, draftId }: { person: Developer; draftId?: string }) {
  const store = useHiringStore();
  const draft = store.invitations.find(item => item.id === draftId && item.developerId === person.id);
  return <InvitationEditor key={draft?.id ?? 'new'} person={person} draft={draft} />;
}
function InvitationEditor({ person, draft }: { person: Developer; draft?: Invitation }) {
  const details = hiringDetails[person.id];
  const [engagement, setEngagement] = useState<Engagement>(draft && details.engagements.includes(draft.engagement as Engagement) ? draft.engagement as Engagement : details.engagements[0]);
  const [fields, setFields] = useState({ company: draft?.company ?? '', title: draft?.title ?? '', goal: draft?.goal ?? '', budget: draft?.budget ?? '', timeline: draft?.timeline ?? '', commitment: draft?.commitment ?? '' });
  const [stage, setStage] = useState<'edit' | 'review' | 'saved'>('edit');
  const [error, setError] = useState('');
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => { if (stage !== 'edit') heading.current?.focus(); }, [stage]);
  const [id] = useState(draft?.id);
  function update(key: keyof typeof fields, value: string) { setFields(previous => ({ ...previous, [key]: value })); }
  function review(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (Object.entries(fields).some(([key, value]) => key !== 'commitment' && !value.trim()) || (engagement === 'Co-founder' && !fields.commitment.trim())) { setError('Please complete each required field with a little detail.'); return; }
    setError(''); setStage('review'); window.scrollTo({ top: 0, behavior: 'instant' });
  }
  function save() {
    const item: Invitation = { ...Object.fromEntries(Object.entries(fields).map(([key, value]) => [key, value.trim()])) as typeof fields, engagement, developerId: person.id, id: id ?? crypto.randomUUID(), createdAt: draft?.createdAt ?? new Date().toISOString() };
    const success = updateHiringStore(state => ({ ...state, invitations: [...state.invitations.filter(invitation => invitation.id !== item.id), item] }));
    if (success) { setStage('saved'); window.scrollTo({ top: 0, behavior: 'instant' }); } else setError('Browser storage is unavailable. Your draft was not saved. Keep this page open to preserve your text.');
  }
  return <div className="hiring-invitation"><Link className="hiring-text-link" href={`/developers/${person.id}`}><ArrowLeft size={14} /> Back to {person.name.split(' ')[0]}’s profile</Link><div className="hiring-page-heading"><span className="hiring-eyebrow">A GOOD CONVERSATION STARTS HERE</span><h1 ref={heading} tabIndex={-1}>{stage === 'saved' ? 'Your brief is ready.' : stage === 'review' ? 'One last look.' : `Build something with ${person.name.split(' ')[0]}.`}</h1><p>{stage === 'saved' ? 'Your invitation is saved in this browser. Nothing has been sent to the developer.' : 'A little context helps both sides decide if the work feels right.'}</p></div>
    <div className="hiring-local-notice">Local prototype · No account required to prepare a draft. Sending will require live accounts and messaging.</div>
    {stage === 'saved' ? <div className="hiring-invitation-complete"><Check size={24} /><h2>Saved as a private draft</h2><p>{fields.title} · {person.name}</p><Link className="button button-red" href="/shortlist">Go to your drafts <ArrowUpRight size={16} /></Link><Link className="hiring-text-link" href="/developers">Keep exploring</Link></div> : stage === 'review' ? <div className="hiring-invitation-review"><h2>Invitation for {person.name}</h2><dl>{[['Type of work', engagement], ['Company / project', fields.company], ['Title', fields.title], [engagement === 'Co-founder' ? 'Problem & stage' : 'Goal & scope', fields.goal], [engagement === 'Co-founder' ? 'Equity expectations' : engagement === 'Full-time' ? 'Salary range' : 'Budget', fields.budget], ['Timeline', fields.timeline], ...(engagement === 'Co-founder' ? [['Commitment', fields.commitment]] : [])].map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl><div className="hiring-form-actions"><button type="button" className="button button-red" onClick={save}>Save invitation draft <ArrowUpRight size={16} /></button><button type="button" className="hiring-text-link" onClick={() => setStage('edit')}>Edit brief</button></div></div> : <form className="hiring-brief-form" onSubmit={review}>
      <label>Type of work<select value={engagement} onChange={event => { setEngagement(event.target.value as Engagement); update('budget', ''); }}>{details.engagements.map(type => <option key={type}>{type}</option>)}</select></label>
      <label>Your company or project<input required maxLength={100} autoComplete="organization" value={fields.company} onChange={event => update('company', event.target.value)} placeholder="Who would they be working with?" /></label>
      <label>{engagement === 'Full-time' ? 'Role title' : 'Project title'}<input required minLength={3} maxLength={120} value={fields.title} onChange={event => update('title', event.target.value)} placeholder={engagement === 'Full-time' ? 'Frontend engineer, product team' : 'An accessible customer dashboard'} /></label>
      <label>{engagement === 'Co-founder' ? 'What problem are you solving, and what stage are you at?' : 'What would you like to accomplish?'}<textarea required minLength={20} maxLength={2500} rows={6} value={fields.goal} onChange={event => update('goal', event.target.value)} placeholder={engagement === 'Co-founder' ? 'The customer, what you have validated, and the strengths you bring…' : 'The outcome, scope, team, and what success would look like…'} /><small>At least 20 characters. Include enough context for a useful conversation.</small></label>
      <label>{engagement === 'Co-founder' ? 'Equity expectations' : engagement === 'Full-time' ? 'Salary range · include currency and annual amount' : 'Budget · include currency and hourly or project basis'}<input required maxLength={120} value={fields.budget} onChange={event => update('budget', event.target.value)} placeholder={engagement === 'Co-founder' ? 'Your starting expectations, or open to discussing together' : engagement === 'Full-time' ? 'e.g. USD 110,000–130,000 / year' : 'e.g. USD 80–95 / hour, 20 hours per week'} /></label>
      <label>Timeline<input required maxLength={160} value={fields.timeline} onChange={event => update('timeline', event.target.value)} placeholder="When would you like to start? Any important milestones?" /></label>
      {engagement === 'Co-founder' && <label>Your time commitment<input required maxLength={160} value={fields.commitment} onChange={event => update('commitment', event.target.value)} placeholder="Hours per week, and when you could commit full-time" /></label>}
      <button className="button button-red" type="submit">Review your brief <ArrowUpRight size={16} /></button>
    </form>}{error && <p className="hiring-error" role="alert">{error}</p>}
  </div>;
}
