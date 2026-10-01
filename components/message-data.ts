import type { Invitation } from './hiring-store';

export const MESSAGE_LIMIT = 4000;
export const messageStorageKey = 'talentfound:messages:v1';
type MessageBase = { id: string; createdAt: string };
export type ChatMessage = MessageBase & (
  | { kind: 'text'; author: 'you' | 'demo'; text: string }
  | { kind: 'brief'; author: 'you'; brief: Invitation }
);
export type Conversation = { id: string; developerId: string; messages: ChatMessage[] };
export type MessageState = { version: 1; conversations: Conversation[]; drafts: Record<string, string> };
export function emptyMessages(): MessageState { return { version: 1, conversations: [], drafts: {} }; }
const record = (value: unknown): value is Record<string, unknown> => !!value && typeof value === 'object' && !Array.isArray(value);
const validDate = (value: unknown): value is string => typeof value === 'string' && Number.isFinite(Date.parse(value));
const briefFields = ['id', 'developerId', 'engagement', 'company', 'title', 'goal', 'budget', 'timeline', 'commitment', 'createdAt'] as const;
function isMessage(value: unknown, developerId: string): value is ChatMessage {
  if (!record(value) || typeof value.id !== 'string' || !value.id || !validDate(value.createdAt)) return false;
  if (value.kind === 'text') return (value.author === 'you' || value.author === 'demo') && typeof value.text === 'string' && !!value.text.trim() && value.text.length <= MESSAGE_LIMIT;
  if (value.kind !== 'brief' || value.author !== 'you' || !record(value.brief)) return false;
  const brief = value.brief;
  return brief.developerId === developerId && briefFields.every(field => typeof brief[field] === 'string') && validDate(brief.createdAt);
}
export function orderedMessages(messages: ChatMessage[]) {
  return [...messages].sort((a, b) => Date.parse(a.createdAt) - Date.parse(b.createdAt) || a.id.localeCompare(b.id));
}
export function parseMessages(raw: string | null, knownIds: readonly string[]): MessageState {
  try {
    const value: unknown = JSON.parse(raw ?? 'null');
    if (!record(value) || value.version !== 1 || !Array.isArray(value.conversations) || !record(value.drafts)) return emptyMessages();
    const conversations = new Map<string, Conversation>();
    for (const item of value.conversations) {
      if (!record(item) || typeof item.developerId !== 'string' || !knownIds.includes(item.developerId) || !Array.isArray(item.messages)) continue;
      const id = item.developerId;
      const messages = new Map((conversations.get(id)?.messages ?? []).map(message => [message.id, message]));
      for (const message of item.messages) if (isMessage(message, id)) messages.set(message.id, message);
      if (messages.size) conversations.set(id, { id, developerId: id, messages: orderedMessages([...messages.values()]) });
    }
    const drafts = Object.fromEntries(Object.entries(value.drafts).filter(([id, text]) => knownIds.includes(id) && typeof text === 'string' && text.length <= MESSAGE_LIMIT));
    return { version: 1, conversations: [...conversations.values()], drafts: drafts as Record<string, string> };
  } catch { return emptyMessages(); }
}
export function appendMessage(state: MessageState, developerId: string, message: ChatMessage): MessageState {
  if (!isMessage(message, developerId)) throw new Error('Invalid message');
  const existing = state.conversations.find(item => item.developerId === developerId);
  const messages = existing?.messages ?? [];
  if (messages.some(item => item.id === message.id)) return state;
  const next = { id: developerId, developerId, messages: orderedMessages([...messages, structuredClone(message)]) };
  return { ...state, conversations: [...state.conversations.filter(item => item.developerId !== developerId), next] };
}
export function inboxConversations(state: MessageState) {
  return [...state.conversations].sort((a, b) => Date.parse(b.messages.at(-1)!.createdAt) - Date.parse(a.messages.at(-1)!.createdAt) || a.id.localeCompare(b.id));
}
export function messagePreview(message: ChatMessage) {
  return message.kind === 'brief' ? `Project brief: ${message.brief.title}` : message.text;
}
export function canAddDemoReply(conversation?: Conversation) { return conversation?.messages.at(-1)?.author === 'you'; }
export function nextMessageTime(conversation?: Conversation) {
  return new Date(Math.max(Date.now(), Date.parse(conversation?.messages.at(-1)?.createdAt ?? '') + 1 || 0)).toISOString();
}
export function persistMessages(storage: Pick<Storage, 'getItem' | 'setItem'>, knownIds: readonly string[], update: (state: MessageState) => MessageState): boolean {
  try {
    const state = parseMessages(storage.getItem(messageStorageKey), knownIds);
    storage.setItem(messageStorageKey, JSON.stringify(update(state)));
    return true;
  } catch { return false; }
}
