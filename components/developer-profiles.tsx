"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState, type MouseEvent } from "react";
import { Arrow } from "./brand";

const developers = [
  { name: "Alex Morgan", avatar: "/images/avatars/alex.svg", role: "Frontend developer", category: "Frontend", location: "London, UK", experience: "5 years", availability: "Open to full-time", skills: ["React", "TypeScript", "Accessibility"], bio: "Making complex products feel simple, fast, and a little more human.", project: "Orbit", projectType: "A calmer project workspace", projectDetail: "A keyboard-first workspace with accessible components, real-time updates, and a design system built to grow.", theme: "sage" },
  { name: "Jamie Chen", avatar: "/images/avatars/jamie.svg", role: "Full-stack developer", category: "Full-stack", location: "Toronto, Canada", experience: "6 years", availability: "Open to collaborations", skills: ["Next.js", "Node.js", "PostgreSQL"], bio: "From the first sketch to the last API. I like making the whole thing work.", project: "Gather", projectType: "Community, without the noise", projectDetail: "A small-community platform with event scheduling, member profiles, and a thoughtful onboarding experience.", theme: "coral" },
  { name: "Nadia Hassan", avatar: "/images/avatars/nadia.svg", role: "Backend developer", category: "Backend", location: "Berlin, Germany", experience: "4 years", availability: "Open to freelance", skills: ["Python", "FastAPI", "Redis"], bio: "Reliable systems, thoughtful APIs, and fewer late-night alerts.", project: "Relay", projectType: "An API that keeps things moving", projectDetail: "A background-job service with retries, observability, and clear documentation for the teams building on it.", theme: "lavender" },
  { name: "Sam Rivera", avatar: "/images/avatars/sam.svg", role: "Creative developer", category: "Frontend", location: "Lisbon, Portugal", experience: "3 years", availability: "Open to freelance", skills: ["React", "WebGL", "Motion"], bio: "A little interaction can make a big difference. I build for that moment.", project: "Playground", projectType: "Experiments worth clicking", projectDetail: "An interactive collection of sound and motion experiments, with responsive graphics and reduced-motion alternatives.", theme: "sand" },
  { name: "Maya Patel", avatar: "/images/avatars/maya.svg", role: "Full-stack developer", category: "Full-stack", location: "Bengaluru, India", experience: "5 years", availability: "Open to full-time", skills: ["TypeScript", "React", "Go"], bio: "Turning early ideas into useful products, one considered release at a time.", project: "Fieldnotes", projectType: "A home for scattered ideas", projectDetail: "A collaborative research notebook with full-text search, shared collections, and a clean writing experience.", theme: "rose" },
  { name: "Leo Martins", avatar: "/images/avatars/leo.svg", role: "Backend developer", category: "Backend", location: "São Paulo, Brazil", experience: "7 years", availability: "Open to collaborations", skills: ["Go", "PostgreSQL", "Docker"], bio: "Building the quiet infrastructure that lets good ideas scale.", project: "Pulse", projectType: "Know how your systems feel", projectDetail: "A lightweight monitoring toolkit that turns service metrics into useful signals, with simple alerting and readable dashboards.", theme: "slate" },
] as const;

const categories = ["All developers", "Frontend", "Full-stack", "Backend"] as const;
type Developer = (typeof developers)[number];

function ProjectPreview({ person }: { person: Developer }) {
  return (
    <div className={`developer-project theme-${person.theme}`}>
      <div className="developer-project-art" aria-hidden="true">
        <span /><span /><span /><i />
      </div>
      <div><span className="developer-project-label">SELECTED WORK</span><strong>{person.project}</strong><p>{person.projectType}</p></div>
    </div>
  );
}

export function DeveloperProfiles() {
  const [category, setCategory] = useState<(typeof categories)[number]>("All developers");
  const [selected, setSelected] = useState<Developer | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLButtonElement | null>(null);
  const visible = developers.filter((person) => category === "All developers" || person.category === category);

  useEffect(() => {
    if (!selected) return;
    dialog.current?.showModal();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previousOverflow; };
  }, [selected]);

  function openProfile(person: Developer, event: MouseEvent<HTMLButtonElement>) {
    opener.current = event.currentTarget;
    setSelected(person);
  }

  return (
    <section className="developer-profiles" id="developers" aria-labelledby="developers-title">
      <div className="developer-section-heading">
        <div>
          <span className="section-kicker">THE PEOPLE BEHIND THE WORK</span>
          <h2 id="developers-title">Good people.<br /><span>Worth getting to know.</span></h2>
        </div>
        <div className="developer-section-intro">
          <p>Different skills. Shared curiosity.<br />Meet the builders making things happen.</p>
          <Link href="/signup" className="developer-join">Your profile belongs here <Arrow diagonal /></Link>
        </div>
      </div>
      <div className="developer-toolbar">
        <div className="developer-filters" role="group" aria-label="Filter developers by specialty">
          {categories.map((item) => <button key={item} type="button" aria-pressed={category === item} onClick={() => setCategory(item)}>{item}<span aria-hidden="true">{item === "All developers" ? developers.length : developers.filter(p => p.category === item).length}</span></button>)}
        </div>
        <span className="developer-sample-label">Sample profiles</span>
      </div>
      <p className="sr-only" role="status">Showing {visible.length} sample developer profiles.</p>
      <div className="developer-grid">
        {visible.map((person) => (
          <article className="developer-card" key={person.name}>
            <span className="developer-availability"><i aria-hidden="true" />{person.availability}</span>
            <div className="developer-identity">
              <Image className={`developer-avatar theme-${person.theme}`} src={person.avatar} alt="" width={56} height={56} />
              <div><h3>{person.name}</h3><p>{person.role}</p></div>
            </div>
            <p className="developer-meta">{person.location}<span aria-hidden="true">·</span>{person.experience} experience</p>
            <p className="developer-bio">{person.bio}</p>
            <ul className="developer-skills" aria-label={`${person.name}'s skills`}>{person.skills.map(skill => <li key={skill}>{skill}</li>)}</ul>
            <ProjectPreview person={person} />
            <button type="button" className="developer-profile-link" onClick={event => openProfile(person, event)} aria-label={`View ${person.name}'s sample profile`}>View profile <Arrow diagonal /></button>
          </article>
        ))}
      </div>
      <p className="developer-avatar-credit">Avatars: <a href="https://www.dicebear.com/styles/adventurer/" target="_blank" rel="noreferrer">Adventurer by Lisa Wischofsky</a> via DiceBear · <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noreferrer">CC BY 4.0</a></p>
      <dialog className="developer-dialog" ref={dialog} aria-labelledby="developer-dialog-title" onClick={event => { if (event.target === event.currentTarget) dialog.current?.close(); }} onClose={() => { setSelected(null); opener.current?.focus(); }}>
        {selected && <>
          <button type="button" className="developer-dialog-close" aria-label="Close developer profile" onClick={() => dialog.current?.close()}>×</button>
          <span className="section-kicker">SAMPLE DEVELOPER PROFILE</span>
          <div className="developer-identity">
            <Image className={`developer-avatar theme-${selected.theme}`} src={selected.avatar} alt="" width={56} height={56} />
            <div><h2 id="developer-dialog-title">{selected.name}</h2><p>{selected.role}</p></div>
          </div>
          <p className="developer-meta">{selected.location}<span aria-hidden="true">·</span>{selected.experience} experience</p>
          <span className="developer-availability"><i aria-hidden="true" />{selected.availability}</span>
          <p className="developer-dialog-bio">{selected.bio}</p>
          <ul className="developer-skills" aria-label="Skills">{selected.skills.map(skill => <li key={skill}>{skill}</li>)}</ul>
          <ProjectPreview person={selected} />
          <p className="developer-project-description">{selected.projectDetail}</p>
          <Link className="brand-button" href="/signup" onClick={() => dialog.current?.close()}>Create your own profile <Arrow diagonal /></Link>
          <p className="developer-demo-note">An illustrative profile with mock details.</p>
        </>}
      </dialog>
    </section>
  );
}
