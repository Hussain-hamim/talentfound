'use client';

import { useMemo, useSyncExternalStore } from 'react';

export type Shortlist = { id: string; name: string; people: string[]; notes: Record<string, string> };
export type Invitation = { id: string; developerId: string; engagement: string; company: string; title: string; goal: string; budget: string; timeline: string; commitment: string; createdAt: string };
export type HiringState = { version: 1; lists: Shortlist[]; invitations: Invitation[] };
const key = 'talentfound:hiring:v1';
const changeEvent = 'talentfound:hiring-change';
const initial: HiringState = { version: 1, lists: [{ id: 'saved', name: 'My shortlist', people: [], notes: {} }], invitations: [] };
const initialRaw = JSON.stringify(initial);
function snapshot() { try { return window.localStorage.getItem(key) ?? initialRaw; } catch { return initialRaw; } }
function subscribe(callback: () => void) {
  window.addEventListener('storage', callback);
  window.addEventListener(changeEvent, callback);
  return () => { window.removeEventListener('storage', callback); window.removeEventListener(changeEvent, callback); };
}
export function parseHiringState(raw: string): HiringState {
  try {
    const value = JSON.parse(raw) as HiringState;
    if (!value || value.version !== 1 || !Array.isArray(value.lists) || !Array.isArray(value.invitations)) return initial;
    const lists = value.lists.filter(list => list && typeof list.id === 'string' && typeof list.name === 'string' && Array.isArray(list.people) && list.people.every(id => typeof id === 'string') && list.notes && typeof list.notes === 'object' && Object.values(list.notes).every(note => typeof note === 'string'));
    const invitations = value.invitations.filter(item => item && ['id', 'developerId', 'engagement', 'company', 'title', 'goal', 'budget', 'timeline', 'commitment', 'createdAt'].every(field => typeof item[field as keyof Invitation] === 'string'));
    return { version: 1, lists: lists.length ? lists : initial.lists, invitations };
  } catch { return initial; }
}
export function useHiringStore() {
  const raw = useSyncExternalStore(subscribe, snapshot, () => initialRaw);
  return useMemo(() => parseHiringState(raw), [raw]);
}
export function updateHiringStore(update: (state: HiringState) => HiringState): boolean {
  try {
    const next = update(parseHiringState(snapshot()));
    window.localStorage.setItem(key, JSON.stringify(next));
    window.dispatchEvent(new Event(changeEvent));
    return true;
  } catch { return false; }
}
export function saveDeveloper(id: string, listId = 'saved') {
  return updateHiringStore(state => ({ ...state, lists: state.lists.map(list => list.id !== listId ? list : { ...list, people: list.people.includes(id) ? list.people.filter(item => item !== id) : [...list.people, id] }) }));
}
export function savedDeveloperIds(state: HiringState) { return [...new Set(state.lists.flatMap(list => list.people))]; }
