import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowUpRight,
  ChevronDown,
  ChevronRight,
  MapPin,
  Star,
  Layers3,
  Eye,
  BriefcaseBusiness,
  Globe,
} from "lucide-react";
import {
  getDeveloper,
  getProfileViewCounts,
  mediaUrl,
} from "@/lib/platform/data";
import { getSession } from "@/lib/platform/session";
import { Avatar, Empty } from "@/components/platform/ui";
import {
  ReviewEditor,
  ReviewControls,
  SavePerson,
} from "@/components/platform/profile-actions";
import { AnalyticsTracker } from "@/components/platform/analytics-tracker";
import { demoProfile } from "@/lib/platform/demo-profiles";
import { ContactActions } from "@/components/platform/contact-actions";
import { ProfileSocialLinks } from "@/components/platform/profile-social-links";
import { ProfileReviewList } from "@/components/platform/profile-review-list";
import "@/app/developer-detail.css";

function ReviewStars({ rating }: { rating: number }) {
  return (
    <span
      className="dp-stars"
      aria-label={`${rating.toFixed(1)} out of 5 stars`}
    >
      {Array.from({ length: 5 }, (_, index) => (
        <Star
          key={index}
          size={13}
          fill={index < Math.round(rating) ? "currentColor" : "none"}
          aria-hidden="true"
        />
      ))}
    </span>
  );
}

export async function DeveloperDetail({
  params,
  modal = false,
}: {
  params: Promise<{ id: string }>;
  modal?: boolean;
}) {
  const [person, s] = await Promise.all([
    getDeveloper((await params).id),
    getSession(),
  ]);
  if (!person) notFound();
  const { profile: d, member, projects, reviews } = person;
  const demo = demoProfile(d.handle);
  const self = s.user?.id === d.id;
  const [images, viewCounts] = await Promise.all([
    Promise.all(projects.map((p) => mediaUrl(p.image_path))),
    getProfileViewCounts([d.id]),
  ]);
  const viewCount = viewCounts.get(d.id);
  const reviewCount = demo?.reviews.length ?? reviews.length;
  const avg = reviewCount
    ? (demo
        ? demo.reviews.reduce(
            (total, r) =>
              total +
              (r.scores.quality +
                r.scores.communication +
                r.scores.reliability) /
                3,
            0,
          )
        : reviews.reduce((total, r) => total + r.rating, 0)) / reviewCount
    : null;
  const ownReview = reviews.find((r) => r.reviewer_id === s.user?.id);
  const reviewsId = demo ? "demo-reviews" : "reviews";
  const tone =
    d.category === "Frontend"
      ? "sage"
      : d.category === "Backend"
        ? "lavender"
        : "coral";
  const bio = d.bio.trim();
  const money = (amount: number) => amount.toLocaleString("en-US");

  return (
    <div className={`developer-detail dp-tone-${tone}`} data-profile-loaded>
      <AnalyticsTracker developerId={d.id} />
      <div className="dp-topline">
        {modal ? (
          <span className="dp-eyebrow">Meet the developer</span>
        ) : (
          <Link className="dp-back" href="/developers">
            <ArrowLeft size={15} aria-hidden="true" /> All developers
          </Link>
        )}
        {d.availability && (
          <span className="dp-availability">
            <i aria-hidden="true" />
            {d.availability}
          </span>
        )}
      </div>
      <header className="dp-hero">
        <div className="dp-person">
          <div className="dp-identity">
            <Avatar name={member.name} src={person.avatarUrl} />
            <div>
              <h1>{member.name}</h1>
              <p className="dp-headline">{d.headline}</p>
            </div>
          </div>
          <div className="dp-meta">
            {d.location && (
              <span>
                <MapPin size={14} aria-hidden="true" />
                {d.location}
              </span>
            )}
            {d.experience_years !== null && (
              <span>
                <BriefcaseBusiness size={14} aria-hidden="true" />
                {d.experience_years}{" "}
                {d.experience_years === 1 ? "year" : "years"} experience
              </span>
            )}
          </div>
          <Link
            className="dp-rating-link"
            href={`#${reviewsId}`}
            aria-label={
              avg !== null
                ? `${avg.toFixed(1)} out of 5. Read ${reviewCount} ${demo ? "sample " : ""}reviews`
                : "No reviews yet. View reviews"
            }
          >
            <Star
              size={16}
              fill={avg !== null ? "currentColor" : "none"}
              aria-hidden="true"
            />
            <strong>{avg !== null ? avg.toFixed(1) : "New"}</strong>
            <span>
              {reviewCount
                ? `Read ${reviewCount} ${reviewCount === 1 ? "review" : "reviews"}`
                : "No reviews yet"}
            </span>
            <ChevronRight size={14} aria-hidden="true" />
          </Link>
          <ProfileSocialLinks
            name={member.name}
            handle={d.handle}
            github={d.github}
            linkedin={d.linkedin}
            website={d.website}
            demo={!!demo}
          />
        </div>
        <div className="dp-intro">
          <span className="dp-eyebrow">A little about me</span>
          <p className="dp-bio">
            {bio ||
              "A new member of the community. Their story is just getting started."}
          </p>
          {bio.length > 180 && (
            <a className="dp-text-link" href="#about">
              Read more <ChevronRight size={13} aria-hidden="true" />
            </a>
          )}
          <div className="dp-summary">
            <span>
              <Layers3 size={14} aria-hidden="true" />
              {projects.length} {projects.length === 1 ? "project" : "projects"}
            </span>
            {viewCount != null && (
              <span title="Profile views in the last 90 days">
                <Eye size={14} aria-hidden="true" />
                Views {money(viewCount)}
              </span>
            )}
          </div>
        </div>
        {demo && (
          <p className="dp-demo-note">
            Demo profile · Projects and reviews are illustrative. Messages and
            invitations are available for testing.
          </p>
        )}
      </header>

      <nav className="dp-section-nav" aria-label="Profile sections">
        <a href="#work">
          Selected work <span>{String(projects.length).padStart(2, "0")}</span>
        </a>
        <a href="#about">About</a>
        <a href={`#${reviewsId}`}>
          Reviews <span>{String(reviewCount).padStart(2, "0")}</span>
        </a>
        <a href="#connect">
          Let’s connect <ArrowUpRight size={14} aria-hidden="true" />
        </a>
      </nav>

      <div className="dp-layout">
        <aside
          className="dp-contact-panel"
          id="connect"
          aria-labelledby="connect-title"
        >
          <span className="dp-eyebrow">Work together</span>
          <h2 id="connect-title">
            Good work starts <br />
            with a conversation.
          </h2>
          <ContactActions
            handle={d.handle}
            name={member.name}
            demo={!!demo}
            self={self}
          />
          {!demo && !self && (
            <SavePerson id={d.id} signedIn={!!s.user} handle={d.handle} />
          )}
          {demo && (
            <Link className="dp-community-link" href="/developers">
              Explore the community{" "}
              <ArrowUpRight size={14} aria-hidden="true" />
            </Link>
          )}
          <dl className="dp-work-facts">
            {d.work_style && (
              <div>
                <dt>Work style</dt>
                <dd>{d.work_style}</dd>
              </div>
            )}
            {d.hours_per_week !== null && (
              <div>
                <dt>Availability</dt>
                <dd>{d.hours_per_week} hours / week</dd>
              </div>
            )}
            {d.start_weeks !== null && (
              <div>
                <dt>Can start</dt>
                <dd>
                  {d.start_weeks === 0
                    ? "Ready now"
                    : `In ${d.start_weeks} ${d.start_weeks === 1 ? "week" : "weeks"}`}
                </dd>
              </div>
            )}
          </dl>
          {d.engagements.length > 0 && (
            <div className="dp-tags" aria-label="Work arrangements">
              {d.engagements.map((engagement) => (
                <span key={engagement}>{engagement}</span>
              ))}
            </div>
          )}
          {(d.hourly_usd !== null || d.salary_usd !== null) && (
            <div className="dp-compensation">
              <span className="dp-eyebrow">
                {demo ? "Sample expectations" : "Compensation"}
              </span>
              {d.hourly_usd !== null && (
                <p>
                  From <strong>${money(d.hourly_usd)}</strong>
                  <span> USD / hour</span>
                </p>
              )}
              {d.salary_usd !== null && (
                <p>
                  From <strong>${money(d.salary_usd)}</strong>
                  <span> USD / year</span>
                </p>
              )}
            </div>
          )}
        </aside>

        <div className="dp-content">
          <section
            className="dp-section"
            id="work"
            aria-labelledby="work-title"
          >
            <div className="dp-section-heading">
              <div>
                <span className="dp-eyebrow">01 / Selected work</span>
                <h2 id="work-title">A few things I’ve built.</h2>
              </div>
              <span className="dp-section-count">
                {String(projects.length).padStart(2, "0")} projects
              </span>
            </div>
            {projects.length ? (
              <div className="dp-project-grid">
                {projects.map((p, i) => {
                  const summary =
                    demo?.projects.find((sample) => sample.name === p.title)
                      ?.summary || p.description;
                  const projectLinks = [
                    ["Live project", p.live_url],
                    ["Source code", p.repository_url],
                  ].filter(([, url]) => /^https?:\/\//i.test(url));
                  return (
                    <article
                      className="dp-project"
                      key={p.id}
                      id={`project-${p.id}`}
                    >
                      <div className="dp-project-cover">
                        {images[i] ? (
                          <Image
                            src={images[i]!}
                            alt={`${p.title} preview`}
                            width={960}
                            height={600}
                            unoptimized
                          />
                        ) : (
                          <div className="dp-project-placeholder">
                            <Layers3 size={36} aria-hidden="true" />
                            <span>{p.title}</span>
                          </div>
                        )}
                        {summary && (
                          <div className="dp-project-overlay">
                            <p title={summary}>{summary}</p>
                          </div>
                        )}
                      </div>
                      <div className="dp-project-body">
                        <div className="dp-project-title">
                          <h3>{p.title}</h3>
                          <span>{String(i + 1).padStart(2, "0")}</span>
                        </div>
                        {p.stack.length > 0 && (
                          <div
                            className="dp-tags"
                            aria-label={`${p.title} technologies`}
                          >
                            {p.stack.map((technology) => (
                              <span key={technology}>{technology}</span>
                            ))}
                          </div>
                        )}
                        {p.description && (
                          <p className="dp-project-description">
                            {p.description}
                          </p>
                        )}
                        {p.contribution && (
                          <details className="dp-contribution">
                            <summary>
                              My contribution{" "}
                              <ChevronDown size={14} aria-hidden="true" />
                            </summary>
                            <p>{p.contribution}</p>
                          </details>
                        )}
                        {projectLinks.length > 0 && (
                          <div className="dp-project-links">
                            {projectLinks.map(([label, url]) => (
                              <a
                                key={label}
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                data-track-project={p.id}
                              >
                                {label}
                                <ArrowUpRight size={13} aria-hidden="true" />
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : (
              <Empty
                title="The next project starts here."
                description="No projects shared yet. Start a conversation to learn more about their work."
              />
            )}
          </section>

          <section
            className="dp-section dp-about"
            id="about"
            aria-labelledby="about-title"
          >
            <div className="dp-section-heading">
              <div>
                <span className="dp-eyebrow">02 / Behind the work</span>
                <h2 id="about-title">A little more about me.</h2>
              </div>
            </div>
            <p className="dp-about-bio">
              {bio || "This developer is still adding their story."}
            </p>
            <div className="dp-about-details">
              {d.skills.length > 0 && (
                <div>
                  <h3>What I work with</h3>
                  <div className="dp-tags">
                    {d.skills.map((skill) => (
                      <span key={skill}>{skill}</span>
                    ))}
                  </div>
                </div>
              )}
              {d.timezone && (
                <div>
                  <h3>Based in</h3>
                  <p className="dp-timezone">
                    <Globe size={15} aria-hidden="true" />
                    {d.timezone.replaceAll("_", " ")}
                  </p>
                  {d.utc_start !== null && d.utc_end !== null && (
                    <p className="dp-note">
                      Usual hours: {String(d.utc_start).padStart(2, "0")}:00–
                      {String(d.utc_end).padStart(2, "0")}:00 UTC
                    </p>
                  )}
                </div>
              )}
            </div>
          </section>

          <section
            className="dp-section"
            id={reviewsId}
            aria-labelledby="reviews-title"
          >
            <div className="dp-section-heading">
              <div>
                <span className="dp-eyebrow">03 / Community perspectives</span>
                <h2 id="reviews-title">
                  {demo
                    ? "Sample community reviews."
                    : "From the people around me."}
                </h2>
              </div>
              {avg !== null && (
                <div className="dp-review-total">
                  <Star size={18} fill="currentColor" aria-hidden="true" />
                  <strong>{avg.toFixed(1)}</strong>
                  <span>/ 5</span>
                </div>
              )}
            </div>
            <p className="dp-note dp-reviews-note">
              {demo
                ? "Illustrative feedback, not real endorsements."
                : "Member opinions, without verification of employment or completed work."}
            </p>
            <ProfileReviewList key={d.id}>
              {demo
                ? demo.reviews.map((review) => {
                    const rating =
                      (review.scores.quality +
                        review.scores.communication +
                        review.scores.reliability) /
                      3;
                    return (
                      <article className="dp-review" key={review.id}>
                        <header className="dp-review-header">
                          <div className="dp-review-author">
                            <Avatar name={review.client} src={review.avatar} />
                            <div>
                              <h3>{review.client}</h3>
                              <p>{review.company} · Sample review</p>
                            </div>
                          </div>
                          <ReviewStars rating={rating} />
                        </header>
                        <p className="dp-review-body">“{review.feedback}”</p>
                        <div className="dp-review-context">
                          <span>{review.project}</span>
                          <time dateTime={review.date}>
                            {new Date(review.date).toLocaleDateString("en", {
                              month: "short",
                              year: "numeric",
                              timeZone: "UTC",
                            })}
                          </time>
                        </div>
                        {"reply" in review && review.reply && (
                          <div className="dp-review-reply">
                            <strong>{member.name} replied</strong>
                            <p>{review.reply}</p>
                          </div>
                        )}
                      </article>
                    );
                  })
                : reviews.map((r) => {
                    const reply = Array.isArray(r.reply) ? r.reply[0] : r.reply;
                    return (
                      <article className="dp-review" key={r.id}>
                        <header className="dp-review-header">
                          <div className="dp-review-author">
                            <Avatar name={r.reviewer.name} />
                            <div>
                              <h3>{r.reviewer.name}</h3>
                              <time dateTime={r.created_at}>
                                {new Date(r.created_at).toLocaleDateString(
                                  "en",
                                  {
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                    timeZone: "UTC",
                                  },
                                )}
                              </time>
                            </div>
                          </div>
                          <ReviewStars rating={r.rating} />
                        </header>
                        <p className="dp-review-body">{r.body}</p>
                        {reply && (
                          <div className="dp-review-reply">
                            <strong>{member.name} replied</strong>
                            <p>{reply.body}</p>
                          </div>
                        )}
                        {s.user && (
                          <ReviewControls
                            id={r.id}
                            owner={r.reviewer_id === s.user.id}
                            developer={self}
                            reply={reply?.body}
                          />
                        )}
                      </article>
                    );
                  })}
            </ProfileReviewList>
            {!demo && !reviews.length && (
              <div className="dp-no-reviews">
                <Star size={22} aria-hidden="true" />
                <h3>Good things take a first word.</h3>
                <p>No reviews yet. Worked together? Share your experience.</p>
              </div>
            )}
            {!demo && !self && (
              <ReviewEditor
                developerId={d.id}
                handle={d.handle}
                signedIn={!!s.user}
                initial={ownReview}
              />
            )}
            {demo && (
              <div id="demo-links" className="dp-sample-links">
                <h3>About the sample links</h3>
                <p>
                  Portfolio, GitHub, and LinkedIn are example details for this
                  demo account. Explore the projects above to see the
                  illustrative work.
                </p>
                <a href="#work">
                  Back to selected work{" "}
                  <ArrowUpRight size={13} aria-hidden="true" />
                </a>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
