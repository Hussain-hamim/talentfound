import Image from "next/image";
import Link from "next/link";
import {
  ArrowUpRight,
  ChevronRight,
  Eye,
  Globe,
  Layers3,
  MapPin,
  Star,
} from "lucide-react";
import type { Developer } from "@/lib/platform/types";
import { demoProfile } from "@/lib/platform/demo-profiles";
import { SavePerson } from "./profile-actions";
import { Avatar } from "./ui";

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
  const socialLinks = [
    { name: "GitHub", url: p.github, icon: "github" },
    { name: "LinkedIn", url: p.linkedin, icon: "linkedin" },
    { name: "Portfolio", url: p.website, icon: "portfolio" },
  ].filter(({ url }) => demo || /^https?:\/\//i.test(url?.trim() || ""));
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
      {socialLinks.length > 0 && (
        <ul
          className="home-showcase-socials"
          aria-label={`${p.member.name}'s links`}
        >
          {socialLinks.map(({ name, url, icon }) => {
            const label = `${p.member.name}'s ${name}${demo ? " (demo)" : " (opens in a new tab)"}`;
            return (
              <li key={name}>
                <a
                  className={`home-showcase-social-link${icon === "portfolio" ? " home-showcase-portfolio" : ""}`}
                  href={
                    demo
                      ? `${href}#${icon === "portfolio" ? "work" : "demo-links"}`
                      : url.trim()
                  }
                  target={demo ? undefined : "_blank"}
                  rel={demo ? undefined : "noopener noreferrer"}
                  aria-label={label}
                  title={label}
                >
                  {icon === "portfolio" ? (
                    <>
                      <Globe size={15} aria-hidden="true" />
                      Portfolio
                      <ArrowUpRight size={13} aria-hidden="true" />
                    </>
                  ) : (
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      {icon === "github" ? (
                        <path d="M12 .75a11.25 11.25 0 0 0-3.558 21.923c.562.104.768-.244.768-.542 0-.267-.01-.975-.015-1.914-3.13.68-3.79-1.51-3.79-1.51-.512-1.3-1.25-1.646-1.25-1.646-1.022-.699.077-.685.077-.685 1.13.08 1.725 1.16 1.725 1.16 1.005 1.723 2.637 1.225 3.28.937.103-.728.394-1.225.715-1.507-2.498-.284-5.124-1.25-5.124-5.566 0-1.23.44-2.234 1.16-3.021-.117-.285-.503-1.43.11-2.98 0 0 .945-.302 3.095 1.154a10.79 10.79 0 0 1 5.634 0c2.148-1.456 3.09-1.154 3.09-1.154.615 1.55.229 2.695.113 2.98.722.787 1.158 1.791 1.158 3.021 0 4.327-2.63 5.279-5.136 5.558.404.349.764 1.04.764 2.096 0 1.513-.014 2.734-.014 3.105 0 .3.203.65.774.54A11.252 11.252 0 0 0 12 .75Z" />
                      ) : (
                        <>
                          <path d="M5.37 24H.4V7.98h4.97V24ZM2.88 5.8a2.88 2.88 0 1 1 0-5.76 2.88 2.88 0 0 1 0 5.76ZM24 24h-4.96v-7.8c0-1.86-.04-4.25-2.59-4.25-2.6 0-3 2.03-3 4.11V24H8.49V7.98h4.76v2.19h.07c.66-1.26 2.28-2.59 4.69-2.59 5.02 0 5.99 3.3 5.99 7.59V24Z" />
                        </>
                      )}
                    </svg>
                  )}
                </a>
              </li>
            );
          })}
        </ul>
      )}
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
