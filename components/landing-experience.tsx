"use client";

import Link from "next/link";
import { ConnectionArt } from "./connection-art";
import { useEffect, useRef, useState, type MouseEvent } from "react";
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
          A JOURNAL FOR THE REST OF US.
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
                ["--wave-shift" as string]: `${Number((i * -0.08).toFixed(2))}s`,
              }}
            />
          ))}
        </div>
        <span className="cover-bottomline">
          <span className="play-symbol" aria-hidden="true">
            ▶
          </span>{" "}
          A SOUNDTRACK FOR YOUR HEADSPACE.
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
        LESS NOISE. MORE SPACE.
      </span>
    </div>
  );
}

export function BuilderShowcase() {
  const [selected, setSelected] = useState(0);
  const [intro, setIntro] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLButtonElement | null>(null);
  const gallery = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = gallery.current;
    if (!node || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        setIntro(true);
        observer.disconnect();
      },
      { threshold: 0.4 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!intro) return;
    const timeout = window.setTimeout(() => setIntro(false), 1700);
    return () => window.clearTimeout(timeout);
  }, [intro]);

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
      <div className={intro ? "builder-gallery cover-intro" : "builder-gallery"} ref={gallery}>
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
            </div>
            <div className="builder-caption-row">
              <span className="builder-initials">{person.initials}</span>
              <span className="builder-name">
                {person.name}
                <small>{person.role}</small>
              </span>
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
    text: "Your work, in front of people who get it.",
    cta: "Get discovered",
  },
  {
    label: "I’m hiring",
    role: "hiring",
    text: "Find the person behind the work you wish you’d made.",
    cta: "Find your next builder",
  },
  {
    label: "I have an idea",
    role: "founder",
    text: "Meet someone who’s as all-in on your idea as you are.",
    cta: "Find your co-founder",
  },
];

export function ConnectionPlayground() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [inView, setInView] = useState(false);
  const chosen = useRef(false);
  const layout = useRef<HTMLDivElement>(null);
  const direction = directions[active];

  useEffect(() => {
    const node = layout.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.45 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!inView || paused || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => {
      setActive((current) => (current + 1) % directions.length);
    }, 4000);
    return () => window.clearInterval(timer);
  }, [inView, paused]);

  function choose(index: number) {
    chosen.current = true;
    setPaused(true);
    setActive(index);
  }

  return (
    <div className="match-layout" ref={layout}>
      <div className="match-editorial" data-reveal>
        <h2 id="match-title">
          Good things<br />
          start with<br />
          <span>your people.</span>
        </h2>
        <div
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => {
            if (!chosen.current) setPaused(false);
          }}
          onFocus={() => setPaused(true)}
          onBlur={(event) => {
            const next = event.relatedTarget;
            if (chosen.current || (next instanceof Node && event.currentTarget.contains(next))) return;
            setPaused(false);
          }}
        >
          <div className="match-role-selector" role="group" aria-label="What brings you to TalentFound?">
            {directions.map((item, index) => (
              <button
                key={item.role}
                type="button"
                aria-pressed={active === index}
                aria-controls="match-detail"
                onClick={() => choose(index)}
              >
                {item.label}
              </button>
            ))}
          </div>
          <div className="match-detail" id="match-detail">
            <p aria-live="polite" aria-atomic="true">{direction.text}</p>
            <Link className="brand-button match-action" href={`/signup?role=${direction.role}`}>
              {direction.cta}<Arrow diagonal />
            </Link>
          </div>
        </div>
      </div>
      <div className="match-art" data-role={direction.role} aria-hidden="true">
        <div className="match-art-frame">
          <ConnectionArt variant="people" />
        </div>
      </div>
    </div>
  );
}
