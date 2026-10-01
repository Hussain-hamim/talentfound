'use client';

import { useMemo, useSyncExternalStore } from 'react';
import { developers } from './developer-profile-data';
import { emptyMessages, messageStorageKey, parseMessages, persistMessages, type MessageState } from './message-data';

const knownIds = developers.map(person => person.id);
const initialRaw = JSON.stringify(emptyMessages());
const changeEvent = 'talentfound:messages-change';
function snapshot() {
  try { return window.localStorage.getItem(messageStorageKey) ?? initialRaw; }
  catch { return initialRaw; }
}
function subscribe(callback: () => void) {
  const onStorage = (event: StorageEvent) => { if (event.key === messageStorageKey || event.key === null) callback(); };
  window.addEventListener('storage', onStorage);
  window.addEventListener(changeEvent, callback);
  return () => { window.removeEventListener('storage', onStorage); window.removeEventListener(changeEvent, callback); };
}
export function useMessageStore() {
  const raw = useSyncExternalStore(subscribe, snapshot, () => null);
  const state = useMemo(() => parseMessages(raw, knownIds), [raw]);
  return { state, ready: raw !== null };
}
export function updateMessageStore(update: (state: MessageState) => MessageState) {
  try {
    const saved = persistMessages(window.localStorage, knownIds, update);
    if (saved) window.dispatchEvent(new Event(changeEvent));
    return saved;
  } catch { return false; }
}
