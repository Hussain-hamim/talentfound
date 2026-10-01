'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Bookmark, ArrowUpRight, Link as LinkIcon, MessageSquare } from 'lucide-react';
import { savedDeveloperIds, saveDeveloper, updateHiringStore, useHiringStore } from './hiring-store';

export function SaveDeveloper({ id, name }: { id: string; name: string }) {
  const store = useHiringStore();
  const saved = savedDeveloperIds(store).includes(id);
  const [error, setError] = useState('');
  function toggle() {
    const success = saved ? updateHiringStore(state => ({ ...state, lists: state.lists.map(list => ({ ...list, people: list.people.filter(person => person !== id) })) })) : saveDeveloper(id);
    setError(success ? '' : 'Browser storage is unavailable. Saving did not complete.');
  }
  return <span className="hiring-save-wrap"><button className="developer-save" type="button" aria-label={`${saved ? 'Unsave' : 'Save'} ${name}`} aria-pressed={saved} title={saved ? 'Remove from saved lists' : 'Save to My shortlist'} onClick={toggle}><Bookmark size={17} fill={saved ? 'currentColor' : 'none'} /></button>{error && <small role="alert">{error}</small>}</span>;
}
export function ShortlistLink() {
  const count = savedDeveloperIds(useHiringStore()).length;
  return <Link className="hiring-text-link" href="/shortlist"><Bookmark size={15} />Shortlist{count > 0 ? ` (${count})` : ''}</Link>;
}
export function CopyLink({ path, label = 'Copy link' }: { path?: string; label?: string }) {
  const [message, setMessage] = useState('');
  const [fallback, setFallback] = useState('');
  async function copy() {
    const url = path ? new URL(path, window.location.origin).href : window.location.href;
    try { await navigator.clipboard.writeText(url); setMessage('Link copied'); setFallback(''); }
    catch { setMessage('Copy this link:'); setFallback(url); }
  }
  return <div className="hiring-copy"><button type="button" className="hiring-text-link" onClick={copy}><LinkIcon size={14} />{label}</button><span role="status">{message}</span>{fallback && <input aria-label="Share link" readOnly value={fallback} onFocus={event => event.currentTarget.select()} />}</div>;
}
export function InviteLink({ id }: { id: string }) { return <Link className="button button-red" href={`/developers/${id}/invite`}>Invite to project <ArrowUpRight size={17} /></Link>; }
export function MessageLink({ id }: { id: string }) { return <Link className="button hiring-message-link" href={`/messages/${id}`}><MessageSquare size={16} />Message</Link>; }
