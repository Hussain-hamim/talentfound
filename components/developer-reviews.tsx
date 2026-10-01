import type { MouseEvent } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { projectSlug } from './developer-hiring-data';
import { ChevronRight, Star } from 'lucide-react';
import type { Developer } from './developer-profile-data';
import { newestReviews, reviewRating, reviewSummary } from './developer-ranking';

export function DeveloperRating({ person, onClick }: { person: Developer; onClick: (event: MouseEvent<HTMLButtonElement>) => void }) {
  const summary = reviewSummary(person.reviews);
  return <button type="button" className="developer-rating" onClick={onClick} aria-haspopup="dialog" aria-label={`Read ${person.name}'s reviews${summary.average === null ? ': no reviews yet' : `: ${summary.average.toFixed(1)} out of 5, ${summary.count} ${summary.count === 1 ? 'review' : 'reviews'}`}`}>
    {summary.average === null ? <><span className="developer-new-talent">New talent</span><span>· No reviews yet</span></> : <>
      <Star size={13} fill="currentColor" aria-hidden="true" /><strong>{summary.average.toFixed(1)}</strong><span className="developer-rating-label">Read {summary.count} {summary.count === 1 ? 'review' : 'reviews'}</span><ChevronRight size={14} aria-hidden="true" />
    </>}
  </button>;
}

export function ReviewExcerpt({ person }: { person: Developer }) {
  const latest = newestReviews(person.reviews)[0];
  if (!latest) return null;
  return <figure className="developer-review-excerpt">
    <span className="developer-review-eyebrow">LATEST CLIENT REVIEW · SAMPLE</span>
    <blockquote>“{latest.feedback}”</blockquote>
    <figcaption><Image className="developer-client-avatar" src={latest.avatar} alt="" width={28} height={28} /><div>{latest.client}<span> · {latest.company}</span></div></figcaption>
  </figure>;
}

const reviewDate = new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });

export function DeveloperReviews({ person }: { person: Developer }) {
  const summary = reviewSummary(person.reviews);
  return <section className="developer-reviews" aria-label={`${person.name}'s client reviews`}>
    <div className="developer-reviews-heading"><h3>Client reviews</h3><span>Sample feedback</span></div>
    {summary.average === null || !summary.dimensions ? <div className="developer-reviews-empty">
      <span className="developer-new-talent">New talent</span><h4>No reviews yet</h4><p>{person.name.split(' ')[0]} is new to the network. Explore their projects and skills to see what they can bring to your team.</p>
    </div> : <>
      <p className="hiring-review-context">{summary.count} reviews from {new Set(person.reviews.map(review => review.clientId)).size} distinct sample clients. Feedback describes past delivery, not a technical assessment or a guarantee of fit.</p>
      <div className="developer-review-summary">
        <div className="developer-review-overall"><Star size={22} fill="currentColor" aria-hidden="true" /><strong>{summary.average.toFixed(1)}<small> / 5</small></strong><span>From {summary.count} sample {summary.count === 1 ? 'review' : 'reviews'}</span></div>
        <dl className="developer-review-dimensions">{Object.entries(summary.dimensions).map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value.toFixed(1)}<span> / 5</span></dd></div>)}</dl>
      </div>
      <ol className="developer-review-list">{newestReviews(person.reviews).map(review => <li key={review.id}>
        <div className="developer-review-byline"><div className="developer-review-author"><Image className="developer-client-avatar" src={review.avatar} alt="" width={28} height={28} /><div><strong>{review.client}</strong><span>{review.company}</span></div></div><span className="developer-review-score"><Star size={12} fill="currentColor" aria-hidden="true" />{reviewRating(review).toFixed(1)}<span className="sr-only"> out of 5</span></span></div>
        <p className="developer-review-project">{review.project}<span> · </span><time dateTime={review.date}>{reviewDate.format(new Date(`${review.date}T00:00:00Z`))}</time></p>
        <span className="hiring-review-source">Sample feedback · Engagement not verified</span>
        <blockquote>{review.feedback}</blockquote>
        {person.projects.filter(project => review.project === project.name || review.project.startsWith(`${project.name} `)).map(project => <Link key={project.name} className="hiring-text-link" href={`/developers/${person.id}#project-${projectSlug(project)}`}>Explore {project.name} case study ↗</Link>)}
        {review.reply && <div className="hiring-review-reply"><strong>{person.name} replied · Sample</strong>{review.reply}</div>}
        <dl className="developer-review-scores">{Object.entries(review.scores).map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}/5</dd></div>)}</dl>
      </li>)}</ol>
    </>}
  </section>;
}
