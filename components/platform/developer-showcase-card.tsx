import Image from "next/image";
import Link from "next/link";
import {
  ArrowUpRight,
  ChevronRight,
  Eye,
  Layers3,
  MapPin,
  Star,
} from "lucide-react";
import type { Developer } from "@/lib/platform/types";
import { demoProfile } from "@/lib/platform/demo-profiles";
import { SavePerson } from "./profile-actions";
import { Avatar } from "./ui";
import { ProfileSocialLinks } from "./profile-social-links";

export function DeveloperShowcaseCard({
  person: p,
  signedIn,
}: {
  person: Developer;
  signedIn: boolean;
  viewerId?: string;
}) {
  const demo = demoProfile(p.handle);
  const href = `/developers/${p.handle}`;
  const bio = p.bio?.trim();
  const reviewCount = demo?.reviews.length ?? p.reviewCount;
  const rating = reviewCount
    ? demo
      ? demo.reviews.reduce(
          (total, review) =>
            total +
            (review.scores.quality +
              review.scores.communication +
              review.scores.reliability) /
              3,
          0,
        ) / reviewCount
      : p.rating
    : null;
  const reviewLabel = reviewCount
    ? `Read ${reviewCount} ${reviewCount === 1 ? "review" : "reviews"}`
    : "No reviews yet";
  const theme =
    p.category === "Frontend"
      ? "sage"
      : p.category === "Backend"
        ? "lavender"
        : "coral";
  return (
    <article className={`developer-card home-showcase-card theme-${theme}`}>
      <div className="home-showcase-heading">
        <div className="home-showcase-person">
          <div className="developer-identity">
            <span className="developer-avatar-wrap">
              {p.avatarUrl ? (
                <Image
                  className="developer-avatar"
                  src={p.avatarUrl}
                  width={48}
                  height={48}
                  alt=""
                  unoptimized
                />
              ) : (
                <Avatar name={p.member.name} />
              )}
            </span>
            <div>
              <h3>
                <Link href={href}>{p.member.name}</Link>
              </h3>
              <p>{p.headline}</p>
            </div>
          </div>
          <Link
            className="home-showcase-reviews"
            href={`${href}#${demo ? "demo-reviews" : "reviews"}`}
            aria-label={
              rating !== null
                ? `${rating.toFixed(1)} out of 5. Read ${reviewCount} ${demo ? "sample " : ""}${reviewCount === 1 ? "review" : "reviews"} for ${p.member.name}`
                : `No reviews yet for ${p.member.name}. View reviews`
            }
          >
            <span className="home-showcase-rating">
              <Star
                size={14}
                fill={rating !== null ? "currentColor" : "none"}
                aria-hidden="true"
              />
              <strong>{rating !== null ? rating.toFixed(1) : "New"}</strong>
            </span>
            <span className="home-showcase-review-label">{reviewLabel}</span>
            <ChevronRight size={13} aria-hidden="true" />
          </Link>
        </div>
        {(bio || p.viewCount != null) && (
          <div className="home-showcase-aside">
            {bio && (
              <p className="home-showcase-bio" title={bio}>
                {bio}
              </p>
            )}
            {p.viewCount != null && (
              <span
                className="home-showcase-views"
                title="Profile views in the last 90 days"
              >
                <Eye size={12} aria-hidden="true" />
                Views {p.viewCount.toLocaleString("en-US")}
              </span>
            )}
          </div>
        )}
      </div>
      <div className="home-showcase-meta">
        {p.location && (
          <span className="home-showcase-location">
            <MapPin size={13} aria-hidden="true" />
            {p.location}
          </span>
        )}
        {p.availability && (
          <span className="developer-availability">
            <i aria-hidden="true" />
            {p.availability}
          </span>
        )}
      </div>
      <ProfileSocialLinks
        name={p.member.name}
        handle={p.handle}
        github={p.github}
        linkedin={p.linkedin}
        website={p.website}
        demo={!!demo}
      />
      {p.projects.length > 0 && (
        <div
          className="developer-project-grid"
          role="group"
          aria-label={`${p.member.name}'s selected work`}
        >
          {p.projects.slice(0, 2).map((project) => {
            const summary = (
              demo?.projects.find((sample) => sample.name === project.title)
                ?.summary || project.description
            ).trim();
            return (
              <Link
                key={project.id}
                className="developer-project-tile home-project-preview"
                href={`${href}#project-${project.id}`}
                aria-label={`Explore ${project.title} by ${p.member.name}`}
                aria-describedby={
                  summary ? `project-summary-${project.id}` : undefined
                }
                title={project.title}
              >
                <span className="home-project-image">
                  {project.imageUrl ? (
                    <Image
                      src={project.imageUrl}
                      alt={`${project.title} preview`}
                      width={480}
                      height={360}
                      unoptimized
                    />
                  ) : (
                    <Layers3 size={28} aria-hidden="true" />
                  )}
                  {summary && (
                    <span className="home-project-overlay">
                      <span
                        className="home-project-summary"
                        id={`project-summary-${project.id}`}
                      >
                        {summary}
                      </span>
                    </span>
                  )}
                </span>
                <span className="home-project-caption">
                  <strong className="home-project-title">
                    {project.title}
                  </strong>
                  {project.stack[0] && (
                    <span className="home-project-badge">
                      {project.stack[0]}
                    </span>
                  )}
                  <ArrowUpRight size={13} aria-hidden="true" />
                </span>
              </Link>
            );
          })}
        </div>
      )}
      <div className="developer-card-actions">
        <Link
          className="button button-red developer-profile-action"
          href={href}
        >
          View profile
          <ArrowUpRight size={19} aria-hidden="true" />
        </Link>
        <SavePerson id={p.id} signedIn={signedIn} handle={p.handle} iconOnly />
      </div>
    </article>
  );
}
