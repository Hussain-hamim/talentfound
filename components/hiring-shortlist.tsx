'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowUpRight, Plus, Trash2, X } from 'lucide-react';
import { developers, developerCategoryThemes } from './developer-profile-data';
import { hiringDetails, compensation } from './developer-hiring-data';
import { Identity } from './developer-card-parts';
import { reviewSummary } from './developer-ranking';
import { CopyLink, InviteLink } from './hiring-ui';
import { updateHiringStore, useHiringStore, type Shortlist } from './hiring-store';

type Props = { sharedIds: string[]; sharedTitle: string; isShared: boolean };
export function HiringShortlist({ sharedIds, sharedTitle, isShared }: Props) {
  const router = useRouter();
  const store = useHiringStore();
  const [listId, setListId] = useState('saved');
  const [compare, setCompare] = useState<string[]>([]);
  const [message, setMessage] = useState('');
  const [listName, setListName] = useState('');
  const [viewShared, setViewShared] = useState(isShared);
  const active = store.lists.find(list => list.id === listId) ?? store.lists[0];
  const list: Shortlist = viewShared ? { id: 'shared', name: sharedTitle, people: sharedIds, notes: {} } : active;
  const people = list.people.flatMap(id => { const person = developers.find(item => item.id === id); return person ? [person] : []; });
  const selected = people.filter(person => compare.includes(person.id));
  const sharePath = `/shortlist?profiles=${encodeURIComponent(people.map(person => person.id).join(','))}&title=${encodeURIComponent(list.name)}`;
  function persist(update: Parameters<typeof updateHiringStore>[0], success: string) { const ok = updateHiringStore(update); setMessage(ok ? success : 'Browser storage is unavailable. Your change was not saved.'); return ok; }
  function createList(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = listName.trim();
    if (!name) return;
    const id = crypto.randomUUID();
    if (persist(state => ({ ...state, lists: [...state.lists, { id, name, people: [], notes: {} }] }), 'List created.')) { setListId(id); setCompare([]); setListName(''); }
  }
  function importShared() {
    const id = crypto.randomUUID();
    if (persist(state => ({ ...state, lists: [...state.lists, { id, name: sharedTitle, people: sharedIds, notes: {} }] }), 'A separate copy was saved in this browser.')) { setViewShared(false); setListId(id); router.replace('/shortlist', { scroll: false }); }
  }
  return <div className="hiring-shortlist">
    <div className="hiring-page-heading"><span className="hiring-eyebrow">A FEW GOOD PEOPLE</span><h1>{viewShared ? list.name : 'Your shortlist.'}</h1><p>{viewShared ? 'A shared selection of sample developers. Private notes and invitation drafts are never included.' : 'Keep the people worth a second look. Compare the fit, then start with a clear brief.'}</p></div>
    {viewShared ? <div className="hiring-list-toolbar"><button className="button button-red" onClick={importShared}>Save a copy <Plus size={16} /></button><button className="hiring-text-link" onClick={() => { setViewShared(false); setCompare([]); router.replace('/shortlist', { scroll: false }); }}>Go to my lists</button></div> : <div className="hiring-list-toolbar"><label>List<select value={active.id} onChange={event => { setListId(event.target.value); setCompare([]); }} >{store.lists.map(item => <option key={item.id} value={item.id}>{item.name} ({item.people.length})</option>)}</select></label><form onSubmit={createList}><label className="sr-only" htmlFor="new-list">New list name</label><input id="new-list" required maxLength={60} placeholder="Name a new list…" value={listName} onChange={event => setListName(event.target.value)} /><button type="submit" className="hiring-small-button"><Plus size={15} /> Create list</button></form><Link href="/developers" className="hiring-text-link">Explore talent <ArrowUpRight size={14} /></Link>{active.id !== 'saved' && active.people.length === 0 && <button type="button" className="hiring-text-link" onClick={() => { if (persist(state => ({ ...state, lists: state.lists.filter(item => item.id !== active.id) }), 'Empty list deleted.')) setListId('saved'); }}>Delete empty list</button>}</div>}
    <p className="hiring-help">{viewShared ? 'Shared links show profiles and the list name only.' : 'Lists, notes, and drafts are saved on this browser only. Clearing browser data removes them.'}</p>
    <p className="hiring-status" role="status">{message}</p>
    {people.length ? <><div className="hiring-list-heading"><h2>{list.name} <span>{people.length}</span></h2><CopyLink path={sharePath} label="Share profiles" /></div><p className="hiring-help">Select up to three people to compare. Sharing creates a link to this selection, not a live collaborative list.</p><div className="hiring-shortlist-grid">{people.map(person => <article className={`hiring-saved-card theme-${developerCategoryThemes[person.category]}`} key={person.id}>
      <Identity person={person} /><p>{person.specialty}</p><div className="hiring-saved-facts"><span>{compensation(person)}</span><span>{person.start}</span></div>
      <label className="hiring-compare-check"><input type="checkbox" checked={compare.includes(person.id)} disabled={!compare.includes(person.id) && selected.length >= 3} onChange={() => setCompare(ids => ids.includes(person.id) ? ids.filter(id => id !== person.id) : [...ids, person.id])} />Compare {person.name.split(' ')[0]}</label>
      {!viewShared && <><label className="hiring-note">Private note<textarea key={`${active.id}-${person.id}`} defaultValue={active.notes[person.id] ?? ''} maxLength={1000} placeholder="What stands out for this project?" onChange={event => { const note = event.target.value; persist(state => ({ ...state, lists: state.lists.map(item => item.id === active.id ? { ...item, notes: { ...item.notes, [person.id]: note } } : item) }), 'Note saved privately.'); }} /></label><label className="hiring-add-to-list">Also add to<select value="" onChange={event => { const target = event.target.value; if (target) persist(state => ({ ...state, lists: state.lists.map(item => item.id === target ? { ...item, people: [...new Set([...item.people, person.id])] } : item) }), 'Added to list.'); }}><option value="">Choose a list</option>{store.lists.filter(item => item.id !== active.id).map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label></>}
      <div className="hiring-saved-actions"><Link className="hiring-text-link" href={`/developers/${person.id}`}>View profile <ArrowUpRight size={14} /></Link>{!viewShared && <button className="hiring-icon-button" type="button" aria-label={`Remove ${person.name} from ${active.name}`} onClick={() => { persist(state => ({ ...state, lists: state.lists.map(item => item.id === active.id ? { ...item, people: item.people.filter(id => id !== person.id) } : item) }), 'Removed from this list.'); setCompare(ids => ids.filter(id => id !== person.id)); }}><X size={16} /></button>}</div>
    </article>)}</div></> : <div className="hiring-empty"><h2>{viewShared ? 'No available profiles in this link.' : 'Make room for your next collaborator.'}</h2><p>{viewShared ? 'The link may be incomplete or contain profiles that are no longer available.' : 'Save a developer from the directory to My shortlist, then organize them into a project list.'}</p><Link className="button button-red" href="/developers">Explore developers <ArrowUpRight size={16} /></Link></div>}
    {selected.length > 0 && <section className="hiring-comparison" aria-labelledby="comparison-title"><div className="hiring-list-heading"><h2 id="comparison-title">Compare the fit <span>{selected.length}/3</span></h2><button type="button" className="hiring-text-link" onClick={() => setCompare([])}>Clear comparison</button></div>{selected.length === 1 && <p className="hiring-help">Choose one or two more people for a side-by-side comparison.</p>}<div className="hiring-table-scroll" tabIndex={0} role="region" aria-label="Developer comparison, scroll horizontally on small screens"><table><caption className="sr-only">Compare selected sample developers. No overall ranking is assigned.</caption><thead><tr><th scope="col">What matters</th>{selected.map(person => <th scope="col" key={person.id}><Link href={`/developers/${person.id}`}>{person.name} ↗</Link></th>)}</tr></thead><tbody>{[
      ['Specialty', (id: string) => developers.find(person => person.id === id)!.specialty],
      ['Tech stack', (id: string) => developers.find(person => person.id === id)!.skills.join(' · ')],
      ['Product experience', (id: string) => hiringDetails[id].domains.join(' · ')],
      ['Type of work', (id: string) => hiringDetails[id].engagements.join(' · ')],
      ['Starting expectations', (id: string) => hiringDetails[id].engagements.map(type => `${type}: ${compensation(developers.find(person => person.id === id)!, type)}`).join(' / ')],
      ['Capacity & start', (id: string) => `${hiringDetails[id].hoursPerWeek}h/week · ${developers.find(person => person.id === id)!.start}`],
      ['Working hours', (id: string) => `${hiringDetails[id].utcHours[0]}:00–${hiringDetails[id].utcHours[1]}:00 UTC`],
      ['Client feedback', (id: string) => { const summary = reviewSummary(developers.find(person => person.id === id)!.reviews); return summary.average === null ? 'New talent · no reviews yet' : `${summary.average.toFixed(1)}/5 · ${summary.count} sample reviews`; }],
      ['Co-founder fit', (id: string) => { const founder = hiringDetails[id].founder; return founder ? `${founder.stage}. ${founder.commitment}. ${founder.lookingFor}` : 'Not seeking a co-founder role'; }],
    ].map(([label, render]) => <tr key={String(label)}><th scope="row">{String(label)}</th>{selected.map(person => <td key={person.id}>{(render as (id: string) => string)(person.id)}</td>)}</tr>)}<tr><th scope="row">Project evidence</th>{selected.map(person => <td key={person.id}>{person.projects.slice(0, 2).map(project => <p key={project.name}><strong>{project.name}</strong> — {project.contribution}</p>)}<Link className="hiring-text-link" href={`/developers/${person.id}#work`}>All case studies ↗</Link></td>)}</tr><tr><th scope="row">Next step</th>{selected.map(person => <td key={person.id}><InviteLink id={person.id} /></td>)}</tr></tbody></table></div></section>}
    {!viewShared && <section className="hiring-drafts"><div className="hiring-list-heading"><h2>Invitation drafts <span>{store.invitations.length}</span></h2></div><p className="hiring-help">Private to this browser. No invitations have been sent.</p>{store.invitations.length === 0 ? <p className="hiring-help">Open a developer’s profile and choose “Invite to project” to prepare a brief.</p> : <ul>{store.invitations.map(draft => <li key={draft.id}><div><strong>{draft.title}</strong><span>For {developers.find(person => person.id === draft.developerId)?.name ?? 'a developer'} · {draft.engagement} · Draft</span></div><Link className="hiring-text-link" href={`/developers/${draft.developerId}/invite?draft=${encodeURIComponent(draft.id)}`}>Edit <ArrowUpRight size={14} /></Link><button className="hiring-icon-button" aria-label={`Delete draft ${draft.title}`} onClick={() => persist(state => ({ ...state, invitations: state.invitations.filter(item => item.id !== draft.id) }), 'Draft deleted.')}><Trash2 size={15} /></button></li>)}</ul>}</section>}
  </div>;
}
