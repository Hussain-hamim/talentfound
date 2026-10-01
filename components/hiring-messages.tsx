'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, ArrowUpRight, FileText, MessageSquare, Plus, Send, X } from 'lucide-react';
import { developers, developerCategoryThemes, type Developer } from './developer-profile-data';
import { useHiringStore, type Invitation } from './hiring-store';
import { InviteLink } from './hiring-ui';
import { useMessageStore, updateMessageStore } from './message-store';
import { appendMessage, canAddDemoReply, inboxConversations, MESSAGE_LIMIT, messagePreview, nextMessageTime, type ChatMessage, type Conversation } from './message-data';

function Timestamp({ value }: { value: string }) {
  return <time dateTime={value} title={new Date(value).toLocaleString()}>{new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} · {new Date(value).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}</time>;
}
function BriefContents({ brief }: { brief: Invitation }) {
  return <div className="chat-brief-content"><span className="chat-caption"><FileText size={13} /> PROJECT BRIEF · LOCAL SNAPSHOT</span><h3>{brief.title}</h3><dl>{[
    ['Company / project', brief.company], ['Engagement', brief.engagement], ['Goal & scope', brief.goal],
    [brief.engagement === 'Co-founder' ? 'Equity expectations' : brief.engagement === 'Full-time' ? 'Salary range' : 'Budget', brief.budget],
    ['Timeline', brief.timeline], ...(brief.commitment ? [['Commitment', brief.commitment]] : []),
  ].map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl></div>;
}

export function HiringMessages({ developerId }: { developerId?: string }) {
  const { state, ready } = useMessageStore();
  const person = developers.find(item => item.id === developerId);
  const conversations = inboxConversations(state);
  return <div className="chat-page">
    <div className="chat-page-heading"><div><span className="hiring-eyebrow">GOOD WORK STARTS WITH A CONVERSATION</span><h1>Messages<span>.</span></h1></div><Link className="hiring-text-link" href="/developers">Find your people <ArrowUpRight size={15} /></Link></div>
    <p className="chat-local-notice">Local demo · Messages stay in this browser and are not delivered.</p>
    <div className={`chat-workspace ${person ? 'chat-has-selection' : ''}`}>
      <aside className="chat-sidebar" aria-label="Conversations"><div className="chat-sidebar-heading"><h2>Your conversations</h2><span>{conversations.length}</span></div>
        {!ready ? <p className="chat-sidebar-empty" role="status">Loading conversations…</p> : conversations.length ? <nav aria-label="Message conversations">{conversations.map(conversation => {
          const developer = developers.find(item => item.id === conversation.developerId)!;
          const latest = conversation.messages.at(-1)!;
          return <Link className={`chat-conversation theme-${developerCategoryThemes[developer.category]}`} href={`/messages/${developer.id}`} aria-current={developer.id === developerId ? 'page' : undefined} key={conversation.id}><Image className="developer-avatar" src={developer.avatar} alt="" width={42} height={42} /><div><strong>{developer.name}</strong><p>{latest.author === 'demo' ? 'Demo: ' : 'You: '}{messagePreview(latest)}</p><Timestamp value={latest.createdAt} />{state.drafts[developer.id]?.trim() && <span className="chat-draft-label">Draft</span>}</div></Link>;
        })}</nav> : <div className="chat-sidebar-empty"><MessageSquare size={22} /><p>No conversations yet.</p><span>Find someone you’d like to work with and say hello.</span><Link className="hiring-text-link" href="/developers">Explore talent <ArrowUpRight size={14} /></Link></div>}
      </aside>
      {person ? ready ? <ConversationPanel key={person.id} person={person} conversation={state.conversations.find(item => item.developerId === person.id)} draft={state.drafts[person.id] ?? ''} /> : <div className="chat-welcome" role="status">Loading conversation…</div> : <section className="chat-welcome"><span className="chat-welcome-icon"><MessageSquare size={32} strokeWidth={1.2} /></span><h2>A simple hello.<br /><span>A possible beginning.</span></h2><p>Ask about their work, talk through an idea, or find out if you’re a good fit.</p><Link href={conversations.length ? `/messages/${conversations[0].developerId}` : '/developers'} className="button button-red">{conversations.length ? 'Open latest conversation' : 'Explore developers'} <ArrowUpRight size={16} /></Link></section>}
    </div>
  </div>;
}

function ConversationPanel({ person, conversation, draft }: { person: Developer; conversation?: Conversation; draft: string }) {
  const { invitations } = useHiringStore();
  const [unsavedText, setUnsavedText] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [briefOpen, setBriefOpen] = useState(false);
  const [briefId, setBriefId] = useState('');
  const composer = useRef<HTMLTextAreaElement>(null);
  const briefTrigger = useRef<HTMLButtonElement>(null);
  const briefHeading = useRef<HTMLHeadingElement>(null);
  const scrollArea = useRef<HTMLDivElement>(null);
  const forceBottom = useRef(false);
  const nearBottom = useRef(true);
  const previousLast = useRef<string | undefined>(undefined);
  const announcement = useRef<HTMLParagraphElement>(null);
  const text = unsavedText ?? draft;
  const last = conversation?.messages.at(-1);
  const personDrafts = invitations.filter(item => item.developerId === person.id);
  const selectedBrief = personDrafts.find(item => item.id === briefId);

  useEffect(() => { if (briefOpen) briefHeading.current?.focus(); }, [briefOpen]);

  useEffect(() => {
    const region = scrollArea.current;
    if (region && (!previousLast.current || forceBottom.current || nearBottom.current)) region.scrollTop = region.scrollHeight;
    if (last && last.id !== previousLast.current && (previousLast.current || forceBottom.current) && announcement.current) {
      announcement.current.textContent = last.author === 'demo' ? `A simulated reply from ${person.name} was added.` : 'Your message was saved in this browser.';
    }
    previousLast.current = last?.id;
    forceBottom.current = false;
  }, [last, person.name]);

  function saveDraft(value: string) {
    const saved = updateMessageStore(state => ({ ...state, drafts: { ...state.drafts, [person.id]: value } }));
    setUnsavedText(saved ? null : value);
    setError(saved ? '' : 'Your draft could not be saved. Your text is still here; keep this page open and retry.');
  }
  function addMessage(kind: 'text' | 'brief' | 'demo') {
    if (kind === 'text' && (!text.trim() || text.length > MESSAGE_LIMIT)) return;
    if (kind === 'brief' && !selectedBrief) return;
    forceBottom.current = true;
    const saved = updateMessageStore(state => {
      const current = state.conversations.find(item => item.developerId === person.id);
      if (kind === 'demo' && !canAddDemoReply(current)) throw new Error('No outgoing message to reply to');
      const base = { id: crypto.randomUUID(), createdAt: nextMessageTime(current) };
      const message: ChatMessage = kind === 'brief' ? { ...base, kind: 'brief', author: 'you', brief: selectedBrief! } : {
        ...base, kind: 'text', author: kind === 'demo' ? 'demo' : 'you',
        text: kind !== 'demo' ? text.trim() : current?.messages.at(-1)?.kind === 'brief'
          ? 'For a project like this, I’d start by discussing the first milestone and how we would work together. What would you want to achieve first?'
          : 'Happy to explore the idea. What are you hoping to build, and where would you like a collaborator to help?',
      };
      const next = appendMessage(state, person.id, message);
      return kind === 'text' ? { ...next, drafts: { ...next.drafts, [person.id]: '' } } : next;
    });
    if (!saved) { forceBottom.current = false; setError('The message could not be saved. Nothing was added. Your text and brief are still available to retry.'); return; }
    setError('');
    if (kind === 'text') setUnsavedText(null);
    if (kind === 'brief') { setBriefOpen(false); setBriefId(''); }
    composer.current?.focus();
  }
  function submit(event: FormEvent) { event.preventDefault(); addMessage('text'); }
  function closeBrief() { setBriefOpen(false); briefTrigger.current?.focus(); }
  return <section className={`chat-panel theme-${developerCategoryThemes[person.category]}`} aria-label={`Conversation with ${person.name}`}>
    <header className="chat-header"><Link href="/messages" className="chat-back hiring-icon-button" aria-label="Back to inbox"><ArrowLeft size={19} /></Link><Image className="developer-avatar" src={person.avatar} alt="" width={44} height={44} /><div className="chat-person"><Link href={`/developers/${person.id}`}>{person.name} <ArrowUpRight size={13} /></Link><p>{person.role}</p></div><Link className="chat-profile-link hiring-text-link" href={`/developers/${person.id}`}>View profile <ArrowUpRight size={14} /></Link></header>
    <div className="chat-history" ref={scrollArea} tabIndex={0} aria-label="Message history" onScroll={event => { const el = event.currentTarget; nearBottom.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80; }}>
      {!conversation?.messages.length ? <div className="chat-start"><span className="chat-caption">YOUR FIRST CONVERSATION</span><h2>Say hello to {person.name.split(' ')[0]}.</h2><p>No formal brief needed. Start with what caught your eye or an idea you’d like to explore.</p></div> : <ol>{conversation.messages.map(message => <li className={`chat-message chat-message-${message.author}`} key={message.id}><span className="chat-message-author">{message.author === 'you' ? 'You' : `${person.name.split(' ')[0]} · Simulated reply`}</span><div className="chat-bubble">{message.kind === 'brief' ? <BriefContents brief={message.brief} /> : <p>{message.text}</p>}</div><Timestamp value={message.createdAt} /></li>)}</ol>}
    </div>
    <div className="chat-compose-area">
      {briefOpen && <section className="chat-brief-picker" aria-labelledby="brief-picker-title" onKeyDown={event => { if (event.key === 'Escape') closeBrief(); }}><div className="chat-brief-picker-heading"><h3 id="brief-picker-title" tabIndex={-1} ref={briefHeading}>Add a saved brief</h3><button className="hiring-icon-button" type="button" aria-label="Close brief preview" onClick={closeBrief}><X size={17} /></button></div>{personDrafts.length ? <><label htmlFor="chat-brief-select">Invitation draft for {person.name.split(' ')[0]}</label><select id="chat-brief-select" value={briefId} onChange={event => setBriefId(event.target.value)}><option value="">Choose a draft…</option>{personDrafts.map(item => <option value={item.id} key={item.id}>{item.title}</option>)}</select>{selectedBrief && <><BriefContents brief={selectedBrief} /><p className="chat-help">A copy is added to this local chat. Editing the original draft will not change it.</p><button className="button button-red" type="button" onClick={() => addMessage('brief')}>Add brief to chat <Plus size={15} /></button></>}</> : <><p className="chat-help">No saved briefs for {person.name.split(' ')[0]} yet. Prepare an invitation, then return here to add it.</p><InviteLink id={person.id} /></>}</section>}
      <div className="chat-tools"><button className="hiring-text-link" type="button" ref={briefTrigger} aria-expanded={briefOpen} onClick={() => setBriefOpen(open => !open)}><FileText size={15} />Add saved brief</button><Link className="hiring-text-link" href={`/developers/${person.id}/invite`}>Invite to project <ArrowUpRight size={14} /></Link></div>
      <form onSubmit={submit} className="chat-composer"><label className="sr-only" htmlFor="chat-message-input">Message to {person.name}</label><textarea ref={composer} id="chat-message-input" placeholder={`Write a message to ${person.name.split(' ')[0]}…`} rows={3} maxLength={MESSAGE_LIMIT} value={text} onChange={event => saveDraft(event.target.value)} onKeyDown={event => {
        if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing && event.nativeEvent.keyCode !== 229) { event.preventDefault(); addMessage('text'); }
      }} /><div className="chat-composer-bottom"><span className="chat-help"><span className="chat-keyboard-hint">Enter to send · Shift + Enter for a new line</span><span>{text.length}/{MESSAGE_LIMIT}</span></span><button type="submit" className="button button-red" disabled={!text.trim() || text.length > MESSAGE_LIMIT}>Send <Send size={15} /></button></div></form>
      {error && <p className="chat-error" role="alert">{error}{unsavedText !== null && <button type="button" className="hiring-text-link" onClick={() => saveDraft(text)}>Retry saving draft</button>}</p>}
      <div className="chat-demo-tools"><span>Try the other side of the conversation</span><button type="button" className="hiring-text-link" disabled={!canAddDemoReply(conversation)} onClick={() => addMessage('demo')}><Plus size={13} /> Add demo reply</button></div>
      <p className="sr-only" role="status" aria-live="polite" ref={announcement} />
    </div>
  </section>;
}
