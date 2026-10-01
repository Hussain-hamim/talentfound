import type { Developer, DeveloperCategory } from './developer-profile-data';
import type { DeveloperReview } from './developer-review-data';

export type DeveloperSort = 'featured' | 'top-rated' | 'newest';
export const rankingPrior = { rating: 4, count: 5 } as const;

export function reviewRating(review: DeveloperReview): number {
  return (review.scores.quality + review.scores.communication + review.scores.reliability) / 3;
}

export function reviewSummary(reviews: readonly DeveloperReview[]) {
  const count = reviews.length;
  if (!count) return { count: 0, average: null, rankingScore: null, dimensions: null };
  const sum = reviews.reduce((total, review) => total + reviewRating(review), 0);
  return {
    count,
    average: sum / count,
    rankingScore: (sum + rankingPrior.count * rankingPrior.rating) / (count + rankingPrior.count),
    dimensions: {
      quality: reviews.reduce((sum, review) => sum + review.scores.quality, 0) / count,
      communication: reviews.reduce((sum, review) => sum + review.scores.communication, 0) / count,
      reliability: reviews.reduce((sum, review) => sum + review.scores.reliability, 0) / count,
    },
  };
}

export function newestReviews(reviews: readonly DeveloperReview[]) {
  return [...reviews].sort((a, b) => b.date.localeCompare(a.date) || a.id.localeCompare(b.id));
}

export function selectDevelopers(people: readonly Developer[], category: DeveloperCategory | 'All developers', newTalent: boolean, sort: DeveloperSort) {
  const result = people.filter(person => (category === 'All developers' || person.category === category) && (!newTalent || person.reviews.length === 0));
  if (sort === 'top-rated') result.sort((a, b) => {
    const left = reviewSummary(a.reviews);
    const right = reviewSummary(b.reviews);
    if (!left.count && right.count) return 1;
    if (left.count && !right.count) return -1;
    return (right.rankingScore ?? 0) - (left.rankingScore ?? 0) || right.count - left.count || a.id.localeCompare(b.id);
  });
  if (sort === 'newest') result.sort((a, b) => b.joinedAt.localeCompare(a.joinedAt) || a.id.localeCompare(b.id));
  return result;
}
