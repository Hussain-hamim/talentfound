"use client";
import Link from "next/link";
import Image from "next/image";
import { isDemoProfile } from "@/lib/platform/demo-profiles";
import { useRouter, usePathname } from "next/navigation";
import { useState, type FormEvent } from "react";
import {
  ArrowUpRight,
  Search,
  SlidersHorizontal,
  Bookmark,
  Star,
  MapPin,
} from "lucide-react";
import type { Developer } from "@/lib/platform/types";
import type { Filters } from "@/lib/platform/validation";
import { mutate } from "@/lib/platform/api";
import { Avatar, Empty, Field, Heading, Status } from "./ui";
import { DeveloperShowcaseCard } from "./developer-showcase-card";
import { ContactActions } from "./contact-actions";
import "@/app/developer-profiles.css";
import "@/app/hiring.css";
import "@/app/home-showcase.css";
export function Directory({
  people,
  total,
  filters,
  signedIn = false,
  compactHeading = false,
  viewerId,
}: {
  people: Developer[];
  total: number;
  filters: Filters;
  signedIn?: boolean;
  compactHeading?: boolean;
  viewerId?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [advanced, setAdvanced] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  function query(values: Record<string, unknown>) {
    const params = new URLSearchParams();
    Object.entries({ ...filters, ...values }).forEach(([k, v]) => {
      if (v !== "" && v !== undefined && v !== null) params.set(k, String(v));
    });
    return `${pathname}?${params}`;
  }
  function search(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    router.push(
      query({ ...Object.fromEntries(new FormData(e.currentTarget)), page: 1 }),
    );
  }
  async function save(person: Developer) {
    if (!signedIn) {
      router.push(
        `/login?next=${encodeURIComponent(`/developers/${person.handle}`)}`,
      );
      return;
    }
    setBusy(person.id);
    setError("");
    try {
      await mutate("savePerson", { developer_id: person.id });
      setMessage(`${person.member.name} added to your shortlist.`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save.");
    } finally {
      setBusy(null);
    }
  }
  async function saveSearch(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    try {
      await mutate("saveSearch", {
        name: String(new FormData(e.currentTarget).get("name")),
        filters,
      });
      setMessage("Search saved to your workspace.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save.");
    }
  }
  return (
    <>
      <Heading
        eyebrow="THE PEOPLE BEHIND THE WORK"
        title={
          compactHeading
            ? "Find your next collaborator."
            : "Good people. Worth knowing."
        }
        description="Explore the work, meet the person, and start a conversation."
      />
      <form method="post" onSubmit={search}>
        <div className="pf-discovery-toolbar">
          <label className="sr-only" htmlFor="talent-search">
            Search developers
          </label>
          <input
            className="pf-input"
            id="talent-search"
            name="q"
            defaultValue={filters.q}
            placeholder="Search skills, projects, or people…"
          />
          <button className="pf-button primary">
            <Search size={16} />
            Search
          </button>
          <button
            type="button"
            className="pf-button"
            aria-expanded={advanced}
            onClick={() => setAdvanced(!advanced)}
          >
            <SlidersHorizontal size={15} />
            Filters
          </button>
        </div>
        <div
          className="pf-filters"
          hidden={!advanced}
          style={!advanced ? { display: "none" } : undefined}
        >
          <Field label="Specialty">
            <select name="category" defaultValue={filters.category}>
              <option value="">All specialties</option>
              {[
                "Frontend",
                "Full-stack",
                "Backend",
                "Mobile",
                "Data & AI",
                "DevOps",
                "Other",
              ].map((x) => (
                <option key={x}>{x}</option>
              ))}
            </select>
          </Field>
          <Field label="Location">
            <input
              name="location"
              defaultValue={filters.location}
              placeholder="City or country"
            />
          </Field>
          <Field label="Engagement">
            <select name="engagement" defaultValue={filters.engagement}>
              <option value="">Any type</option>
              {["Freelance", "Full-time", "Co-founder"].map((x) => (
                <option key={x}>{x}</option>
              ))}
            </select>
          </Field>
          <Field label="Availability">
            <select name="availability" defaultValue={filters.availability}>
              <option value="">Any availability</option>
              {[
                "Available now",
                "Open to conversations",
                "Not currently available",
              ].map((x) => (
                <option key={x}>{x}</option>
              ))}
            </select>
          </Field>
          <Field label="Minimum experience · years">
            <input
              type="number"
              name="experience"
              min={0}
              max={70}
              defaultValue={filters.experience}
            />
          </Field>
          <Field label="Minimum hours per week">
            <input
              type="number"
              name="hours"
              min={0}
              max={168}
              defaultValue={filters.hours}
            />
          </Field>
          <Field
            label="Maximum budget · USD"
            help="Annual for full-time; hourly otherwise. Zero means no limit."
          >
            <input
              type="number"
              name="budget"
              min={0}
              defaultValue={filters.budget}
            />
          </Field>
          <Field label="Can start">
            <select name="start" defaultValue={filters.start}>
              <option value="">Flexible</option>
              <option value="0">Now</option>
              <option value="2">Within 2 weeks</option>
              <option value="4">Within 4 weeks</option>
            </select>
          </Field>
          <Field
            label="Working-hour overlap"
            help="At least four hours in the selected UTC workday."
          >
            <select name="overlap" defaultValue={filters.overlap}>
              <option value="">Any time zone</option>
              <option value="Europe">Europe · 09–17 UTC</option>
              <option value="Americas">Americas · 13–21 UTC</option>
              <option value="Asia">Asia · 05–13 UTC</option>
            </select>
          </Field>
          <Field label="Sort by">
            <select name="sort" defaultValue={filters.sort}>
              <option value="relevance">Search relevance</option>
              <option value="newest">Newest</option>
              <option value="top-rated">Top rated</option>
            </select>
          </Field>
          <div className="pf-actions">
            <button className="pf-button primary">Apply filters</button>
            <Link className="pf-button" href={pathname}>
              Reset
            </Link>
          </div>
        </div>
      </form>
      <Status error={error} message={message} />
      <div className="pf-search-results">
        <span>
          {total} developer{total === 1 ? "" : "s"} · Public profiles
        </span>
        <div className="pf-actions">
          <Link
            className={`pf-button small ${filters.layout === "showcase" ? "primary" : ""}`}
            href={query({ layout: "showcase" })}
          >
            Showcase
          </Link>
          <Link
            className={`pf-button small ${filters.layout === "compact" ? "primary" : ""}`}
            href={query({ layout: "compact" })}
          >
            Compact
          </Link>
        </div>
      </div>
      {filters.sort === "top-rated" && (
        <p className="pf-note" style={{ marginBottom: 20 }}>
          Community ratings are weighted by review count: five prior 4-star
          ratings temper small samples. These are member opinions, not verified
          work history.
        </p>
      )}
      {people.length ? (
        <div
          className={
            filters.layout === "showcase"
              ? "directory-showcase-grid"
              : "pf-directory-grid compact"
          }
        >
          {people.map((person) =>
            filters.layout === "showcase" ? (
              <DeveloperShowcaseCard
                key={person.id}
                person={person}
                signedIn={signedIn}
                viewerId={viewerId}
              />
            ) : (
              <article className="pf-talent-card" key={person.id}>
                <div className="pf-project-preview">
                  {person.coverUrl ? (
                    <Image
                      src={person.coverUrl}
                      alt={person.projects[0]?.title || "Portfolio project"}
                      width={720}
                      height={420}
                      unoptimized
                    />
                  ) : (
                    person.projects[0]?.title || "Make room for what’s next."
                  )}
                </div>
                <div className="pf-talent-inner">
                  <div className="pf-row-main">
                    <Avatar name={person.member.name} src={person.avatarUrl} />
                    <div>
                      <h2>
                        <Link href={`/developers/${person.handle}`}>
                          {person.member.name}
                        </Link>
                      </h2>
                      <p>{person.headline}</p>
                      {isDemoProfile(person.handle) && (
                        <span className="pf-tag">Demo profile</span>
                      )}
                    </div>
                  </div>
                  <p>
                    {person.bio || "A new member of the TalentFound community."}
                  </p>
                  <ContactActions
                    handle={person.handle}
                    name={person.member.name}
                    demo={isDemoProfile(person.handle)}
                    self={viewerId === person.id}
                  />
                  <div className="pf-tags">
                    {person.skills.slice(0, 5).map((skill) => (
                      <span className="pf-tag" key={skill}>
                        {skill}
                      </span>
                    ))}
                  </div>
                  <p>
                    <MapPin
                      size={12}
                      style={{ display: "inline", marginRight: 5 }}
                    />
                    {person.location} ·{" "}
                    {person.experience_years === null
                      ? "Experience not added"
                      : `${person.experience_years} years`}
                  </p>
                  <div className="pf-actions">
                    <span className="pf-tag red">{person.availability}</span>
                    {person.reviewCount > 0 ? (
                      <span className="pf-note">
                        <Star size={11} style={{ display: "inline" }} />{" "}
                        {Number(person.rating).toFixed(1)} ·{" "}
                        {person.reviewCount} reviews
                      </span>
                    ) : (
                      <span className="pf-note">No reviews yet</span>
                    )}
                  </div>
                </div>
                <div className="pf-talent-footer">
                  <Link
                    className="pf-button small"
                    href={`/developers/${person.handle}`}
                  >
                    Meet {person.member.name.split(" ")[0]}
                    <ArrowUpRight size={13} />
                  </Link>
                  <button
                    aria-label={`Save ${person.member.name}`}
                    disabled={busy === person.id}
                    className="pf-button small"
                    onClick={() => save(person)}
                  >
                    <Bookmark size={14} />
                  </button>
                </div>
              </article>
            ),
          )}
        </div>
      ) : (
        <Empty
          title={
            total === 0 && !filters.q
              ? "Your people are on their way."
              : "No matches just yet."
          }
          description={
            filters.q
              ? "Try a different skill or broaden your filters."
              : "Be one of the first builders to share your work on TalentFound."
          }
          href="/signup?role=developer"
          label="Create your profile"
        />
      )}
      {total > 12 && (
        <nav className="pf-pagination" aria-label="Directory pages">
          {filters.page > 1 && (
            <Link
              className="pf-button"
              href={query({ page: filters.page - 1 })}
            >
              Previous
            </Link>
          )}
          <span>
            Page {filters.page} of {Math.ceil(total / 12)}
          </span>
          {filters.page * 12 < total && (
            <Link
              className="pf-button"
              href={query({ page: filters.page + 1 })}
            >
              Next
            </Link>
          )}
        </nav>
      )}
      {signedIn && (
        <form
          method="post"
          className="pf-inline-form"
          style={{ marginTop: 30, maxWidth: 440 }}
          onSubmit={saveSearch}
        >
          <Field label="Keep this search">
            <input
              name="name"
              required
              maxLength={100}
              placeholder="e.g. React builders in Europe"
            />
          </Field>
          <button className="pf-button">
            <Bookmark size={14} />
            Save search
          </button>
        </form>
      )}
    </>
  );
}
