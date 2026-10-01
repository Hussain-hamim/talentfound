import assert from 'node:assert/strict';
import test from 'node:test';
import { appendMessage, canAddDemoReply, emptyMessages, inboxConversations, messageStorageKey, nextMessageTime, parseMessages, persistMessages } from '../components/message-data.ts';

const ids = ['sam-rivera', 'alex-morgan'];
const text = (id, createdAt = '2026-10-01T10:00:00Z') => ({ id, createdAt, kind: 'text', author: 'you', text: 'A sample introduction' });
const brief = { id: 'brief-1', developerId: ids[0], company: 'Sample studio', title: 'Sample prototype', engagement: 'Freelance', goal: 'Build an accessible prototype.', budget: 'USD 80 / hour', timeline: 'Next month', commitment: '', createdAt: '2026-10-01T09:00:00Z' };

test('opening a chat or saving a draft creates no inbox conversation', () => {
  const state = { ...emptyMessages(), drafts: { [ids[0]]: 'An unfinished message\nwith a new line' } };
  assert.equal(inboxConversations(state).length, 0);
  assert.deepEqual(parseMessages(JSON.stringify(state), ids), state);
});
test('one stable conversation per developer, duplicate message IDs ignored', () => {
  let state = appendMessage(emptyMessages(), ids[0], text('1'));
  state = appendMessage(state, ids[0], text('2'));
  state = appendMessage(state, ids[0], text('2'));
  assert.equal(state.conversations.length, 1);
  assert.equal(state.conversations[0].id, ids[0]);
  assert.deepEqual(state.conversations[0].messages.map(item => item.id), ['1', '2']);
});
test('messages are ordered by time then ID, inbox by latest message', () => {
  let state = appendMessage(emptyMessages(), ids[0], text('2', '2026-10-01T12:00:00Z'));
  state = appendMessage(state, ids[0], text('1'));
  state = appendMessage(state, ids[1], text('3', '2026-10-01T13:00:00Z'));
  assert.deepEqual(state.conversations.find(item => item.id === ids[0]).messages.map(item => item.id), ['1', '2']);
  assert.deepEqual(inboxConversations(state).map(item => item.developerId), [ids[1], ids[0]]);
  const future = { messages: [text('future', '2099-10-01T13:00:00Z')] };
  assert.ok(Date.parse(nextMessageTime(future)) > Date.parse(future.messages[0].createdAt));
});
test('blank, oversized, invalid-author and invalid-date messages are rejected', () => {
  for (const change of [{ text: '  \n' }, { text: 'x'.repeat(4001) }, { author: 'developer' }, { createdAt: 'invalid' }]) {
    assert.throws(() => appendMessage(emptyMessages(), ids[0], { ...text('1'), ...change }));
  }
  assert.equal(appendMessage(emptyMessages(), ids[0], { ...text('1'), text: 'x'.repeat(4000) }).conversations.length, 1);
});
test('briefs are immutable snapshots, limited to their recipient', () => {
  const editableBrief = { ...brief };
  const message = { id: 'snapshot', createdAt: '2026-10-01T12:00:00Z', author: 'you', kind: 'brief', brief: editableBrief };
  const state = appendMessage(emptyMessages(), ids[0], message);
  editableBrief.goal = 'Changed after adding to chat';
  assert.equal(state.conversations[0].messages[0].brief.goal, brief.goal);
  assert.throws(() => appendMessage(state, ids[1], message));
  assert.deepEqual(parseMessages(JSON.stringify(state), ids), state);
});
test('demo replies require an outgoing message and cannot follow themselves', () => {
  assert.equal(canAddDemoReply(), false);
  let state = appendMessage(emptyMessages(), ids[0], text('1'));
  assert.equal(canAddDemoReply(state.conversations[0]), true);
  state = appendMessage(state, ids[0], { ...text('2', '2026-10-01T12:00:00Z'), author: 'demo' });
  assert.equal(canAddDemoReply(state.conversations[0]), false);
});
test('malformed storage and unknown versions are safe; invalid records are isolated', () => {
  for (const raw of ['broken', 'null', '{}', '{"version":2,"conversations":[],"drafts":{}}']) assert.deepEqual(parseMessages(raw, ids), emptyMessages());
  const raw = JSON.stringify({ version: 1, conversations: [null, { developerId: 'unknown', messages: [text('1')] }, { developerId: ids[0], messages: [text('1'), null, { ...text('bad'), text: '' }] }, { developerId: ids[0], messages: [text('1'), text('2')] }], drafts: { [ids[0]]: 'saved text', [ids[1]]: 7, unknown: 'private' } });
  const parsed = parseMessages(raw, ids);
  assert.equal(parsed.conversations.length, 1);
  assert.equal(parsed.conversations[0].messages.length, 2);
  assert.deepEqual(parsed.drafts, { [ids[0]]: 'saved text' });
});
test('writes use current storage, preserve unrelated data and expose failures', () => {
  const values = new Map([['talentfound:hiring:v1', 'untouched']]);
  const storage = { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) };
  assert.equal(persistMessages(storage, ids, state => appendMessage(state, ids[0], text('1'))), true);
  assert.equal(persistMessages(storage, ids, state => appendMessage(state, ids[1], text('2'))), true);
  assert.equal(parseMessages(values.get(messageStorageKey), ids).conversations.length, 2);
  assert.equal(values.get('talentfound:hiring:v1'), 'untouched');
  const before = values.get(messageStorageKey);
  assert.equal(persistMessages({ ...storage, setItem: () => { throw new Error('Quota exceeded'); } }, ids, state => appendMessage(state, ids[0], text('3'))), false);
  assert.equal(values.get(messageStorageKey), before);
  assert.equal(persistMessages({ getItem: () => { throw new Error('Storage disabled'); }, setItem: () => assert.fail('Must not write after failed read') }, ids, state => state), false);
});
