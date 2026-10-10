import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { searchDevelopers } from "@/lib/platform/data";
import { getSession } from "@/lib/platform/session";
import { demoHandles } from "@/lib/platform/demo-profiles";
import { DeveloperShowcaseCard } from "./developer-showcase-card";
import "@/app/dashboard/dashboard.css";
import "@/app/home-showcase.css";
export async function HomePeople() {
  const [{ people }, session] = await Promise.all([
    searchDevelopers({ sort: "newest" }),
    getSession(),
  ]);
  const ordered = [...people].sort((a, b) => {
    const left = demoHandles.indexOf(a.handle),
      right = demoHandles.indexOf(b.handle);
    return (left < 0 ? 99 : left) - (right < 0 ? 99 : right);
  });
  return (
    <section
      id="developers"
      className="developer-profiles home-profiles home-profiles-atmosphere"
      aria-labelledby="developers-title"
    >
      <div className="developer-section-heading">
        <h2 id="developers-title">
          Good people.
          <br />
          <span>Worth getting to know.</span>
        </h2>
        <Link
          className="button button-outline home-directory-link"
          href="/developers"
        >
          View all developers
          <ArrowUpRight size={17} aria-hidden="true" />
        </Link>
      </div>
      <div className="developer-grid">
        {ordered.slice(0, 6).map((person) => (
          <DeveloperShowcaseCard
            key={person.id}
            person={person}
            signedIn={!!session.member}
            viewerId={session.user?.id}
          />
        ))}
      </div>
      {!people.length && (
        <div className="pf-panel">
          <h3>Every community starts with its first builders.</h3>
          <Link className="pf-button primary" href="/signup?role=developer">
            Create your profile ↗
          </Link>
        </div>
      )}
    </section>
  );
}
