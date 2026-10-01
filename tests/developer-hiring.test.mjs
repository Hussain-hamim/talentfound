import assert from 'node:assert/strict';
import test from 'node:test';
import { developerFit, emptyFit, hiringDetails, overlapHours, compensation, projectEvidence, projectSlug } from '../components/developer-hiring-data.ts';
import { parseHiringState } from '../components/hiring-store.ts';

const alex = { id: 'alex-morgan', name: 'Alex Morgan', role: 'Frontend developer', specialty: 'Design systems', skills: ['React', 'TypeScript'], projects: [{ name: 'Orbit', kind: 'Workspace', stack: 'React', contribution: 'Accessible components' }] };
const maya = { ...alex, id: 'maya-patel', name: 'Maya Patel' };
const fit = overrides => ({ ...emptyFit, ...overrides });

test('search requires every term and checks both skills and work evidence', () => {
  assert.equal(developerFit(alex, fit({ query: 'react accessible' })).matches, true);
  assert.equal(developerFit(alex, fit({ query: 'react python' })).matches, false);
  assert.equal(developerFit(alex, fit({ query: '  REACT  ' })).matches, true);
  assert.equal(developerFit(alex, fit({ query: '   ' })).matches, true);
});
test('engagement, domain, capacity, budget, start date, and overlap compose', () => {
  const requirements = fit({ engagement: 'Freelance', domain: 'SaaS', maxBudget: '85', minHours: '40', startWeeks: '2', overlap: 'Europe' });
  assert.equal(developerFit(alex, requirements).matches, true);
  for (const change of [{ maxBudget: '84' }, { minHours: '41' }, { startWeeks: '0' }, { domain: 'Infrastructure' }, { overlap: 'Asia' }, { engagement: 'Co-founder' }]) {
    assert.equal(developerFit(alex, { ...requirements, ...change }).matches, false, JSON.stringify(change));
  }
});
test('salary comparisons use annual USD; co-founder fit ignores monetary filters', () => {
  assert.equal(developerFit(alex, fit({ engagement: 'Full-time', maxBudget: '115000' })).matches, true);
  assert.equal(developerFit(alex, fit({ engagement: 'Full-time', maxBudget: '110000' })).matches, false);
  assert.equal(developerFit(maya, fit({ engagement: 'Co-founder', maxBudget: '1' })).matches, true);
  assert.equal(compensation(alex, 'Full-time'), 'From $115k USD/year');
  assert.equal(compensation(maya, 'Co-founder'), 'Equity discussed together');
});
test('overlap boundaries and fit do not depend on ratings or presence', () => {
  assert.equal(overlapHours([9, 17], [13, 21]), 4);
  assert.equal(overlapHours([9, 17], [17, 23]), 0);
  assert.deepEqual(developerFit(alex, emptyFit), developerFit({ ...alex, isOnline: false, reviews: [], saved: true }, emptyFit));
});
test('sample hiring data covers six developers with valid work windows and evidence', () => {
  assert.equal(Object.keys(hiringDetails).length, 6);
  for (const details of Object.values(hiringDetails)) {
    assert.ok(details.utcHours[0] < details.utcHours[1]);
    assert.ok(details.hourlyUsd > 0 && details.salaryUsd > 0);
    if (details.engagements.includes('Co-founder')) assert.ok(details.founder?.commitment);
  }
  assert.equal(projectSlug({ name: 'Forma UI' }), 'forma-ui');
  assert.ok(projectEvidence({ name: 'Relay' }).artifacts.includes('Retry policy'));
});
test('persisted state rejects malformed content and unknown schemas', () => {
  for (const raw of ['broken', 'null', '{}', '{"version":2,"lists":[],"invitations":[]}']) {
    assert.equal(parseHiringState(raw).lists[0].id, 'saved');
  }
  const parsed = parseHiringState(JSON.stringify({ version: 1, lists: [null, { id: 'bad', name: 'Bad', people: [3], notes: {} }], invitations: [null, {}] }));
  assert.equal(parsed.lists[0].id, 'saved');
  assert.equal(parsed.invitations.length, 0);
});
test('valid browser notes and drafts survive parsing without being mixed into shared profiles', () => {
  const state = { version: 1, lists: [{ id: 'saved', name: 'Dashboard team', people: ['alex-morgan'], notes: { 'alex-morgan': 'Private interview note' } }], invitations: [{ id: 'draft', developerId: 'alex-morgan', engagement: 'Freelance', company: 'Test', title: 'Test project', goal: 'Accessible dashboard', budget: 'USD 100/hour', timeline: 'Next month', commitment: '', createdAt: '2026-10-01' }] };
  assert.deepEqual(parseHiringState(JSON.stringify(state)), state);
});
