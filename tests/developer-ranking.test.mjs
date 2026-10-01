import assert from 'node:assert/strict';
import test from 'node:test';
import { newestReviews, reviewRating, reviewSummary, selectDevelopers } from '../components/developer-ranking.ts';
import { sampleReviews } from '../components/developer-review-data.ts';

const review = (scores = [5, 5, 5], extra = {}) => ({ id: 'review', date: '2026-09-01', scores: { quality: scores[0], communication: scores[1], reliability: scores[2] }, ...extra });
const person = (id, reviews = [], extra = {}) => ({ id, reviews, category: 'Frontend', joinedAt: '2026-01-01', ...extra });
const top = people => selectDevelopers(people, 'All developers', false, 'top-rated').map(p => p.id);

test('ratings use equal dimension averages and only round for display', () => {
  const reviews = [review([5, 4, 4]), review([5, 5, 5])];
  assert.equal(reviewRating(reviews[0]), 13 / 3);
  const summary = reviewSummary(reviews);
  assert.equal(summary.count, 2);
  assert.ok(Math.abs(summary.average - 14 / 3) < 1e-12);
  assert.equal(summary.average.toFixed(1), '4.7');
  assert.deepEqual(summary.dimensions, { quality: 5, communication: 4.5, reliability: 4.5 });
  assert.ok(Math.abs(summary.rankingScore - (28 / 3 + 20) / 7) < 1e-12);
});

test('several strong reviews outrank a single five-star review', () => {
  assert.deepEqual(top([person('single', [review()]), person('established', Array.from({ length: 5 }, () => review([5, 5, 4])))]), ['established', 'single']);
});

test('unrounded scores determine order even when visible averages match', () => {
  const lower = Array.from({ length: 20 }, () => review([5, 5, 4]));
  const higher = [review(), ...lower.slice(1)];
  assert.equal(reviewSummary(lower).average.toFixed(1), reviewSummary(higher).average.toFixed(1));
  assert.deepEqual(top([person('a-lower', lower), person('z-higher', higher)]), ['z-higher', 'a-lower']);
});

test('ranking ties use count then stable ID; unreviewed profiles come last', () => {
  assert.deepEqual(top([person('z', [review([4, 4, 4])]), person('new'), person('b', [review([4, 4, 4]), review([4, 4, 4])]), person('a', [review([4, 4, 4]), review([4, 4, 4])])]), ['a', 'b', 'z', 'new']);
  assert.deepEqual(reviewSummary([]), { count: 0, average: null, rankingScore: null, dimensions: null });
});

test('category, new talent, and sorting compose without mutating input', () => {
  const people = [person('first', [review()]), person('new-backend', [], { category: 'Backend', joinedAt: '2026-09-20' }), person('new-frontend', [], { joinedAt: '2026-09-25' })];
  assert.deepEqual(selectDevelopers(people, 'All developers', false, 'featured').map(p => p.id), ['first', 'new-backend', 'new-frontend']);
  assert.deepEqual(selectDevelopers(people, 'All developers', false, 'newest').map(p => p.id), ['new-frontend', 'new-backend', 'first']);
  assert.deepEqual(selectDevelopers(people, 'Frontend', true, 'top-rated').map(p => p.id), ['new-frontend']);
  assert.deepEqual(selectDevelopers(people, 'Full-stack', true, 'featured'), []);
  top(people);
  assert.equal(people[0].id, 'first');
});

test('reviews appear newest first with stable date ties, without mutation', () => {
  const reviews = [review(undefined, { id: 'old', date: '2026-01-01' }), review(undefined, { id: 'b' }), review(undefined, { id: 'a' })];
  assert.deepEqual(newestReviews(reviews).map(r => r.id), ['a', 'b', 'old']);
  assert.equal(reviews[0].id, 'old');
});

test('profile presence and non-review attributes do not affect ranking', () => {
  assert.deepEqual(top([person('b', [review()], { isOnline: true, location: 'London', saved: true }), person('a', [review()], { isOnline: false, location: 'Berlin', category: 'Backend' })]), ['a', 'b']);
});

test('sample feedback has unique IDs, valid integer scores, and a newcomer', () => {
  const all = Object.values(sampleReviews).flat();
  assert.equal(new Set(all.map(r => r.id)).size, all.length);
  assert.ok(Object.values(sampleReviews).some(reviews => reviews.length === 0));
  for (const item of all) {
    assert.ok(item.client && item.company && item.project && item.feedback);
    assert.ok(Number.isFinite(Date.parse(item.date)));
    for (const value of Object.values(item.scores)) assert.ok(Number.isInteger(value) && value >= 1 && value <= 5);
  }
});
