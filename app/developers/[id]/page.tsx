import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight, MapPin, Star, Layers3 } from "lucide-react";
import { getDeveloper, mediaUrl } from "@/lib/platform/data";
import { getSession } from "@/lib/platform/session";
import { PublicShell } from "@/components/platform/public-shell";
import { Avatar, Empty } from "@/components/platform/ui";
import {
  ReviewEditor,
  ReviewControls,
  SavePerson,
} from "@/components/platform/profile-actions";
import { AnalyticsTracker } from "@/components/platform/analytics-tracker";
import { appUrl } from "@/lib/supabase/config";
import { demoProfile } from "@/lib/platform/demo-profiles";
import { ContactActions } from "@/components/platform/contact-actions";
type Props = { params: Promise<{ id: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const person = await getDeveloper((await params).id);
  return person
    ? {
        title: `${person.member.name} · ${person.profile.headline}`,
        description: person.profile.bio || person.profile.headline,
        alternates: {
          canonical: `${appUrl()}/developers/${person.profile.handle}`,
        },
        openGraph: {
          title: person.member.name,
          description: person.profile.headline,
        },
        robots: { index: !demoProfile(person.profile.handle), follow: true },
      }
    : { title: "Developer not found", robots: { index: false } };
}
export default async function Page({ params }: Props) {
  const [person, s] = await Promise.all([
    getDeveloper((await params).id),
    getSession(),
  ]);
  if (!person) notFound();
  const { profile: d, member, projects, reviews } = person;
  const demo = demoProfile(d.handle);
  const self = s.user?.id === d.id;
  const images = await Promise.all(projects.map((p) => mediaUrl(p.image_path)));
  const avg = reviews.length
    ? reviews.reduce((n, r) => n + r.rating, 0) / reviews.length
    : 0;
  const ownReview = reviews.find((r) => r.reviewer_id === s.user?.id);
  return (
    <PublicShell>
      {demo && (
        <p
          className="pf-note"
          style={{
            marginBottom: 24,
            padding: 18,
            border: "1px solid #ffffff24",
          }}
        >
          Demo developer · Illustrative projects, availability, compensation,
          and feedback. This account is not available for hire.
        </p>
      )}
      <AnalyticsTracker developerId={d.id} />
      <Link className="pf-link" href="/developers">
        <ArrowLeft size={13} style={{ display: "inline" }} /> Explore talent
      </Link>
      <section className="pf-profile-hero" style={{ marginTop: 35 }}>
        <div>
          <Avatar name={member.name} src={person.avatarUrl} />
          <h1>{member.name}</h1>
          <p style={{ fontSize: 20, color: "#ded4d6" }}>{d.headline}</p>
          <div className="pf-tags">
            <span className="pf-tag">
              <MapPin size={11} style={{ marginRight: 5 }} />
              {d.location}
            </span>
            {d.experience_years !== null && (
              <span className="pf-tag">
                {d.experience_years} years of experience
              </span>
            )}
            <span className="pf-tag">{d.timezone}</span>
          </div>
          <p className="pf-profile-body">
            {d.bio ||
              "A new member of the TalentFound community. Their story is just getting started."}
          </p>
          <div className="pf-tags">
            {d.skills.map((skill) => (
              <span key={skill} className="pf-tag">
                {skill}
              </span>
            ))}
          </div>
          <div className="pf-actions">
            {[
              ["Portfolio", d.website],
              ["GitHub", d.github],
              ["LinkedIn", d.linkedin],
            ]
              .filter(([, url]) => !demo && url && /^https?:\/\//.test(url))
              .map(([name, url]) => (
                <a
                  className="pf-link"
                  key={name}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {name} ↗
                </a>
              ))}
          </div>
        </div>
        <aside className="pf-panel" style={{ alignSelf: "start" }}>
          <span className="pf-eyebrow">LET’S WORK TOGETHER</span>
          <h2 style={{ font: "400 29px Georgia", margin: "18px 0" }}>
            {d.availability}
          </h2>
          <p>
            {d.work_style}
            {d.hours_per_week !== null
              ? ` · ${d.hours_per_week} hours/week`
              : ""}
          </p>
          {d.start_weeks !== null && (
            <p>
              {d.start_weeks === 0
                ? "Ready to start"
                : `Can start in ${d.start_weeks} weeks`}
            </p>
          )}
          <div className="pf-tags" style={{ margin: "20px 0" }}>
            {d.engagements.map((x) => (
              <span className="pf-tag" key={x}>
                {x}
              </span>
            ))}
          </div>
          {d.hourly_usd !== null && (
            <p className="pf-note">From ${d.hourly_usd} USD / hour</p>
          )}
          {d.salary_usd !== null && (
            <p className="pf-note">
              From ${d.salary_usd.toLocaleString()} USD / year
            </p>
          )}
          <div className="pf-stack" style={{ gap: 10, marginTop: 22 }}>
            <ContactActions
              handle={d.handle}
              name={member.name}
              demo={!!demo}
              self={self}
            />
            {demo && (
              <Link className="pf-button primary" href="/developers">
                Explore the community ↗
              </Link>
            )}
            {!demo && !self && (
              <SavePerson id={d.id} signedIn={!!s.user} handle={d.handle} />
            )}
          </div>
          {!demo && (
            <p className="pf-note" style={{ marginTop: 18 }}>
              Public profile. Private conversations. Sign in to connect.
            </p>
          )}
        </aside>
      </section>
      <section className="pf-profile-section" id="work">
        <span className="pf-eyebrow">01 / SELECTED WORK</span>
        <h2>What I’ve been building.</h2>
        {projects.length ? (
          <div className="pf-project-list">
            {projects.map((p, i) => (
              <article
                className="pf-panel pf-project-card"
                key={p.id}
                id={`project-${p.id}`}
              >
                {images[i] ? (
                  <Image
                    className="pf-project-image"
                    src={images[i]!}
                    alt={`${p.title} screenshot`}
                    width={960}
                    height={540}
                    unoptimized
                  />
                ) : (
                  <div className="pf-project-image pf-project-placeholder">
                    <Layers3 size={35} />
                  </div>
                )}
                <h2>{p.title}</h2>
                <div className="pf-tags">
                  {p.stack.map((t) => (
                    <span className="pf-tag" key={t}>
                      {t}
                    </span>
                  ))}
                </div>
                <p className="pf-profile-body">{p.description}</p>
                {p.contribution && (
                  <>
                    <span className="pf-eyebrow">MY CONTRIBUTION</span>
                    <p className="pf-profile-body">{p.contribution}</p>
                  </>
                )}
                <div className="pf-actions">
                  {[
                    ["See the project", p.live_url],
                    ["View the code", p.repository_url],
                  ]
                    .filter(([, url]) => url && /^https?:\/\//.test(url))
                    .map(([label, url]) => (
                      <a
                        key={label}
                        className="pf-button small"
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        data-track-project={p.id}
                      >
                        {label}
                        <ArrowUpRight size={12} />
                      </a>
                    ))}
                </div>
              </article>
            ))}
          </div>
        ) : (
          <Empty
            title="There’s more to come."
            description="This developer hasn’t shared a project yet. You can still introduce yourself."
          />
        )}
      </section>
      {demo && (
        <section className="pf-profile-section" id="demo-reviews">
          <span className="pf-eyebrow">
            ILLUSTRATIVE FEEDBACK · NOT REAL ENDORSEMENTS
          </span>
          <h2>Sample community reviews.</h2>
          {demo.reviews.map((review) => (
            <article
              className="pf-panel"
              key={review.id}
              style={{ marginTop: 16 }}
            >
              <p className="pf-note">
                {review.client} · {review.company} · Sample review
              </p>
              <p className="pf-profile-body">“{review.feedback}”</p>
            </article>
          ))}
          <div id="demo-links" className="pf-panel" style={{ marginTop: 24 }}>
            <h3>Sample links</h3>
            <p className="pf-note">
              Portfolio, GitHub, and LinkedIn are example details for this demo
              account. Project previews above show the illustrative work.
            </p>
          </div>
        </section>
      )}
      {!demo && (
        <section className="pf-profile-section" id="reviews">
          <span className="pf-eyebrow">02 / COMMUNITY PERSPECTIVES</span>
          <h2>From the people around me.</h2>
          <p className="pf-note">
            {reviews.length ? (
              <>
                <Star size={13} style={{ display: "inline" }} />{" "}
                {avg.toFixed(1)} / 5 · {reviews.length} community reviews.{" "}
              </>
            ) : (
              "No community reviews yet. "
            )}
            Member opinions, without verification of employment or completed
            work.
          </p>
          {reviews.map((r) => {
            const reply = Array.isArray(r.reply) ? r.reply[0] : r.reply;
            return (
              <article className="pf-review" key={r.id}>
                <div className="pf-row-main">
                  <Avatar name={r.reviewer.name} />
                  <div>
                    <h3>{r.reviewer.name}</h3>
                    <span className="pf-note">
                      {"★".repeat(r.rating)} ·{" "}
                      {new Date(r.created_at).toLocaleDateString("en", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                </div>
                <p>{r.body}</p>
                {reply && (
                  <div className="pf-review-reply">
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
          {!self && (
            <ReviewEditor
              developerId={d.id}
              handle={d.handle}
              signedIn={!!s.user}
              initial={ownReview}
            />
          )}
        </section>
      )}
    </PublicShell>
  );
}
