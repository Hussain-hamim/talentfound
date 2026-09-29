"use client";

import Link from "next/link";
import { useRef, useState, type MouseEvent } from "react";
import { Arrow } from "./brand";

const builders = [
  {
    name: "Alex Morgan",
    initials: "am",
    role: "Frontend developer",
    project: "Offscript",
    stack: "React · TypeScript",
    description:
      "An independent publishing space for people with something to say.",
    className: "offscript",
    title: "A little less ordinary.",
    number: "01",
  },
  {
    name: "Sam Rivera",
    initials: "sr",
    role: "Creative developer",
    project: "Frequency",
    stack: "Web Audio · React",
    description:
      "An interactive listening experience that makes room for discovery.",
    className: "frequency",
    title: "Find your frequency.",
    number: "02",
  },
  {
    name: "Jamie Chen",
    initials: "jc",
    role: "Full-stack developer",
    project: "Forma",
    stack: "Next.js · PostgreSQL",
    description:
      "A thoughtfully simple workspace for turning loose ideas into real projects.",
    className: "forma",
    title: "A space for what’s next.",
    number: "03",
  },
];

export function ProjectCover({ kind }: { kind: string }) {
  if (kind === "offscript")
    return (
      <div className="project-cover cover-offscript">
        <div className="cover-topline">
          <span>OFFSCRIPT</span>
          <span>INDEPENDENT BY NATURE ↗</span>
        </div>
        <span className="offscript-title">
          Ideas don’t
          <br />
          do ordinary.
        </span>
        <div className="paper-flower" aria-hidden="true">
          {Array.from({ length: 8 }, (_, i) => (
            <i key={i} style={{ transform: `rotate(${i * 45}deg)` }} />
          ))}
          <b />
        </div>
        <span className="cover-bottomline">
          A JOURNAL FOR THE REST OF US. <span>VOL. 001</span>
        </span>
      </div>
    );
  if (kind === "frequency")
    return (
      <div className="project-cover cover-frequency">
        <div className="cover-topline">
          <span>FREQUENCY</span>
          <span>LISTEN DIFFERENTLY</span>
        </div>
        <span className="frequency-title">
          Tune in.
          <br />
          <i>Zone out.</i>
        </span>
        <div className="frequency-wave" aria-hidden="true">
          {Array.from({ length: 35 }, (_, i) => (
            <i
              key={i}
              style={{
                height: `${Math.round(18 + Math.sin(i * 0.4) ** 2 * 90 + Math.cos(i * 0.18) ** 2 * 58)}px`,
                animationDelay: `${Number((i * -0.08).toFixed(2))}s`,
              }}
            />
          ))}
        </div>
        <span className="cover-bottomline">
          <span className="play-symbol" aria-hidden="true">
            ▶
          </span>{" "}
          A SOUNDTRACK FOR YOUR HEADSPACE. <span>02:48</span>
        </span>
      </div>
    );
  return (
    <div className="project-cover cover-forma">
      <div className="cover-topline">
        <span>forma</span>
        <span>ROOM TO THINK.</span>
      </div>
      <span className="forma-title">
        Make room
        <br />
        for possibility.
      </span>
      <div className="forma-object" aria-hidden="true">
        <i />
        <i />
        <i />
      </div>
      <span className="cover-bottomline">
        LESS NOISE. MORE SPACE. <span>↗</span>
      </span>
    </div>
  );
}

export function BuilderShowcase() {
  const [selected, setSelected] = useState(0);
  const dialog = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLButtonElement | null>(null);
  function openProfile(index: number, event: MouseEvent<HTMLButtonElement>) {
    opener.current = event.currentTarget;
    setSelected(index);
    dialog.current?.showModal();
  }
  function closeProfile() {
    dialog.current?.close();
  }
  const builder = builders[selected];
  return (
    <>
      <div className="builder-gallery">
        {builders.map((person, index) => (
          <button
            type="button"
            className={`builder-tile ${person.className}`}
            key={person.name}
            onClick={(event) => openProfile(index, event)}
            aria-label={`View ${person.name}’s example profile`}
            data-reveal
          >
            <div className="project-cover-wrap">
              <ProjectCover kind={person.className} />
              <span className="view-profile-bubble">
                <Arrow diagonal />
              </span>
            </div>
            <div className="builder-caption-row">
              <span className="builder-initials">{person.initials}</span>
              <span className="builder-name">
                {person.name}
                <small>{person.role}</small>
              </span>
              <span className="builder-index">/{person.number}</span>
            </div>
          </button>
        ))}
      </div>
      <dialog
        className="builder-dialog"
        ref={dialog}
        aria-labelledby="profile-dialog-title"
        onClick={(event) => {
          if (event.target === event.currentTarget) closeProfile();
        }}
        onClose={() => opener.current?.focus()}
      >
        <button
          type="button"
          className="dialog-close"
          onClick={closeProfile}
          aria-label="Close example profile"
        >
          ×
        </button>
        <span className="section-kicker">EXAMPLE PROFILE</span>
        <h2 id="profile-dialog-title">
          {builder.name}
          <span>.</span>
        </h2>
        <p className="dialog-role">{builder.role} · Open to possibilities</p>
        <ProjectCover kind={builder.className} />
        <div className="dialog-project">
          <div>
            <h3>{builder.project}</h3>
            <span>{builder.stack}</span>
          </div>
          <p>{builder.description}</p>
        </div>
        <Link href="/signup" className="brand-button" onClick={closeProfile}>
          Make a profile of your own <Arrow diagonal />
        </Link>
        <p className="dialog-note">
          An illustrative profile. Your work could be next.
        </p>
      </dialog>
    </>
  );
}

const directions = [
  {
    label: "I build things",
    role: "developer",
    person: "THE BUILDER",
    match: "THE NEXT CHAPTER",
    text: "Your work, in front of people who get it.",
    cta: "Get discovered",
  },
  {
    label: "I’m hiring",
    role: "hiring",
    person: "THE TEAM",
    match: "THE MISSING PIECE",
    text: "Find the person behind the work you wish you’d made.",
    cta: "Find your next builder",
  },
  {
    label: "I have an idea",
    role: "founder",
    person: "THE BIG IDEA",
    match: "THE CO-FOUNDER",
    text: "Meet someone who’s as all-in on your idea as you are.",
    cta: "Find your co-founder",
  },
];

export function ConnectionPlayground() {
  const [active, setActive] = useState(0);
  const direction = directions[active];
  return (
    <div className="connection-playground">
      <div className="connection-visual" key={active} aria-hidden="true">
        <div className="person-disc disc-you">
          <span>{direction.person}</span>
          <svg viewBox="0 0 100 100">
            <circle cx="50" cy="34" r="12" />
            <path
              d="M24 76a26 26 0 0 1 52 0"
              fill="none"
              stroke="currentColor"
              strokeWidth="13"
            />
          </svg>
        </div>
        <div className="person-disc disc-next">
          <span>{direction.match}</span>
          <svg viewBox="0 0 100 100">
            <path
              d="M50 15v70M15 50h70M25 25l50 50M25 75l50-50"
              fill="none"
              stroke="currentColor"
              strokeWidth="13"
            />
          </svg>
        </div>
        <div className="connection-cursor cursor-one">
          ↖ <span>you</span>
        </div>
        <div className="connection-cursor cursor-two">
          ↖ <span>your kind of person</span>
        </div>
        <span className="connection-visual-caption">
          IT STARTS WITH A CONNECTION.
        </span>
      </div>
      <div className="connection-controls">
        <div
          className="direction-options"
          role="group"
          aria-label="What brings you to DevMatch?"
        >
          {directions.map((item, index) => (
            <button
              key={item.role}
              type="button"
              aria-pressed={active === index}
              onClick={() => setActive(index)}
            >
              <span className="direction-number">0{index + 1}</span>
              {item.label}
              <span className="direction-indicator">
                {active === index ? "↗" : "+"}
              </span>
            </button>
          ))}
        </div>
        <div className="direction-copy" key={direction.role}>
          <p>{direction.text}</p>
          <Link
            className="connection-cta"
            href={`/signup?role=${direction.role}`}
          >
            {direction.cta}
            <Arrow diagonal />
          </Link>
        </div>
      </div>
    </div>
  );
}
