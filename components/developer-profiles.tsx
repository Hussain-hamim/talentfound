"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState, type MouseEvent } from "react";
import { Accessibility, Bookmark, Check, CodeXml, Globe, BriefcaseBusiness, MapPin, ArrowUpRight, ArrowLeft, Waves, X } from "lucide-react";
import { developers, type Developer, type DeveloperProject } from "./developer-profile-data";

const categories = ["All developers", "Frontend", "Full-stack", "Backend"] as const;
type Preview = "profile" | "portfolio" | "social";

const skillIcons: Record<string, string> = {
  React: 'react', TypeScript: 'typescript', 'Next.js': 'nextjs', 'Node.js': 'nodejs',
  PostgreSQL: 'postgresql', Python: 'python', FastAPI: 'fastapi', Redis: 'redis',
  WebGL: 'webgl', Go: 'go', Docker: 'docker',
};

function SkillList({ person }: { person: Developer }) {
  return <div className="developer-tech-stack"><span className="developer-tech-stack-label">Tech stack:</span><ul className="developer-skills" aria-label={`${person.name}'s skills`}>
    {person.skills.map(skill => <li key={skill} tabIndex={0}>
      {skillIcons[skill]
        ? <Image className={`developer-skill-icon skill-${skillIcons[skill]}`} src={`/images/skills/${skillIcons[skill]}.svg`} alt={skill} width={24} height={24} />
        : <span role="img" aria-label={skill}>{skill === 'Accessibility' ? <Accessibility size={24} aria-hidden="true" /> : skill === 'Motion' ? <Waves size={24} aria-hidden="true" /> : <CodeXml size={24} aria-hidden="true" />}</span>}
      <span className="developer-skill-tooltip" aria-hidden="true">{skill}</span>
    </li>)}
  </ul></div>;
}

function ProjectCover({ project }: { project: DeveloperProject }) {
  const tile = project.image?.sampleTile;
  return <span className={`developer-project-cover project-color-${project.color}${project.image ? ' has-project-image' : ''}`}>
    <span className="project-cover-copy">
      <span className="project-cover-top">{project.kind}<ArrowUpRight size={14} /></span>
      <strong>{project.name}</strong>
      <span className="project-cover-stack">{project.stack}</span>
    </span>
    {project.image && <span className="project-cover-thumbnail">
      <span className="project-thumbnail-crop"><Image
        src={project.image.src}
        alt={project.image.alt}
        width={tile === undefined ? 400 : 1536}
        height={tile === undefined ? 400 : 1024}
        sizes="(max-width: 760px) 300px, 450px"
        className={tile === undefined ? 'project-upload-image' : 'project-sample-sheet'}
        style={tile === undefined ? undefined : { left: `${-(tile % 3) * 100}%`, top: `${-Math.floor(tile / 3) * 100}%` }}
      /></span>
    </span>}
  </span>;
}

function Identity({ person, dialog = false }: { person: Developer; dialog?: boolean }) {
  return <div className="developer-identity">
    <span className="developer-avatar-wrap">
      <Image className={`developer-avatar theme-${person.theme}`} src={person.avatar} alt="" width={64} height={64} />
      {person.isOnline && <span className="developer-online-dot" role="img" aria-label="Online now (sample status)" title="Online now (sample status)" />}
    </span>
    <div>{dialog ? <h2 id="developer-dialog-title">{person.name}</h2> : <h3>{person.name}</h3>}<p>{person.role}</p></div>
  </div>;
}

export function DeveloperProfiles() {
  const [category, setCategory] = useState<(typeof categories)[number]>("All developers");
  const [selected, setSelected] = useState<Developer | null>(null);
  const [preview, setPreview] = useState<Preview>("profile");
  const [project, setProject] = useState<DeveloperProject | null>(null);
  const [saved, setSaved] = useState<string[]>([]);
  const dialog = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLButtonElement | null>(null);
  const visible = developers.filter(person => category === "All developers" || person.category === category);

  useEffect(() => {
    if (!selected) return;
    dialog.current?.showModal();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previousOverflow; };
  }, [selected]);

  function openProfile(person: Developer, event: MouseEvent<HTMLButtonElement>, view: Preview = "profile", work: DeveloperProject | null = null) {
    opener.current = event.currentTarget;
    setPreview(view);
    setProject(work);
    setSelected(person);
  }

  function toggleSaved(name: string) {
    setSaved(previous => previous.includes(name) ? previous.filter(item => item !== name) : [...previous, name]);
  }

  return (
    <section className="developer-profiles" id="developers" aria-labelledby="developers-title">
      <div className="developer-section-heading">
        <h2 id="developers-title">Good people.<br /><span>Worth getting to know.</span></h2>
        <div className="developer-section-intro"><p>Different skills. Shared curiosity.{" "}<br />Meet the builders making things happen.</p></div>
      </div>
      <div className="developer-toolbar">
        <div className="developer-filters" role="group" aria-label="Filter developers by specialty">
          {categories.map(item => <button key={item} type="button" aria-pressed={category === item} onClick={() => setCategory(item)}>{item}<span aria-hidden="true">{item === "All developers" ? developers.length : developers.filter(p => p.category === item).length}</span></button>)}
        </div>
        <span className="developer-sample-label">Sample profiles{saved.length > 0 && ` · ${saved.length} saved`}</span>
      </div>
      <p className="sr-only" role="status">Showing {visible.length} sample developer profiles. {saved.length} saved for this visit.</p>
      <div className="developer-grid">
        {visible.map(person => <article className={`developer-card theme-${person.theme}`} key={person.name}>
          <div className="developer-card-header">
            <Identity person={person} />
            <div className="developer-card-details">
              <span className="developer-availability"><i aria-hidden="true" />{person.availability}</span>
              <p className="developer-meta"><span><MapPin size={12} aria-hidden="true" />{person.location}</span><span>{person.experience} experience</span></p>
            </div>
          </div>
          <p className="developer-bio">{person.bio}</p>
          <div className="developer-strengths"><span className="developer-specialty">{person.specialty}</span>{person.strengths.map(strength => <span key={strength}><Check size={11} aria-hidden="true" />{strength}</span>)}</div>
          <SkillList person={person} />
          <dl className="developer-fit"><div><dt>WORK STYLE</dt><dd>{person.workStyle}</dd></div><div><dt>CAN START</dt><dd>{person.start}</dd></div></dl>
          <div className="developer-work-heading"><h4>Selected work</h4><span>{String(person.projects.length).padStart(2, '0')} projects</span></div>
          <div className={`developer-project-grid ${person.projects.length === 3 ? 'three-projects' : ''}`}>
            {person.projects.map(work => <button type="button" key={work.name} className="developer-project-tile" aria-label={`Preview ${work.name} by ${person.name}`} onClick={event => openProfile(person, event, "portfolio", work)}><ProjectCover project={work} /></button>)}
          </div>
          <div className="developer-card-links">
            <button type="button" onClick={event => openProfile(person, event, "portfolio")} aria-label={`View ${person.name}'s portfolio`}><Globe size={15} />Portfolio<ArrowUpRight size={12} /></button>
            <div>
              <button type="button" onClick={event => openProfile(person, event, "social")} aria-label={`${person.name}'s GitHub preview`} title="GitHub preview"><CodeXml size={15} /><span>GitHub</span></button>
              <button type="button" onClick={event => openProfile(person, event, "social")} aria-label={`${person.name}'s LinkedIn preview`} title="LinkedIn preview"><BriefcaseBusiness size={15} /><span>LinkedIn</span></button>
            </div>
          </div>
          <div className="developer-card-actions">
            <button type="button" className="button button-red developer-profile-action" onClick={event => openProfile(person, event)} aria-label={`View ${person.name}'s sample profile`}>View profile <ArrowUpRight size={18} /></button>
            <button className="developer-save" type="button" aria-label={`${saved.includes(person.name) ? 'Unsave' : 'Save'} ${person.name}`} aria-pressed={saved.includes(person.name)} onClick={() => toggleSaved(person.name)}><Bookmark size={17} fill={saved.includes(person.name) ? 'currentColor' : 'none'} /></button>
          </div>
        </article>)}
      </div>
      <p className="developer-avatar-credit">Illustrative profiles, projects, social handles and online status. Saved profiles last for this visit.<br />Avatars: <a href="https://www.dicebear.com/styles/adventurer/" target="_blank" rel="noreferrer">Adventurer by Lisa Wischofsky</a> via DiceBear · <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noreferrer">CC BY 4.0</a></p>
      <dialog className={`developer-dialog ${selected ? `theme-${selected.theme}` : ''}`} ref={dialog} aria-labelledby="developer-dialog-title" onClick={event => { if (event.target === event.currentTarget) dialog.current?.close(); }} onClose={() => { setSelected(null); opener.current?.focus(); }}>
        {selected && <>
          <button type="button" className="developer-dialog-close" aria-label="Close developer profile" onClick={() => dialog.current?.close()}><X size={20} /></button>
          <span className="section-kicker">{project ? 'PROJECT PREVIEW' : preview === 'portfolio' ? 'PORTFOLIO PREVIEW' : preview === 'social' ? 'FIND ME ONLINE' : 'DEVELOPER PROFILE'}</span>
          <Identity person={selected} dialog />
          <p className="developer-meta">{selected.location}<span aria-hidden="true">·</span>{selected.experience} experience</p>
          {project ? <div className="developer-project-detail">
            <button type="button" className="developer-back-projects" onClick={() => setProject(null)}><ArrowLeft size={14} /> All projects</button>
            <ProjectCover project={project} />
            <h3>{project.name}</h3><p>{project.description}</p>
            <h4>What I built</h4><p>{project.contribution}</p>
            <span className="developer-detail-stack">{project.stack}</span>
          </div> : <>
            {preview === 'social' ? <div className="developer-social-preview">
              <p>Where {selected.name.split(' ')[0]} shares work and stays in touch.</p>
              <div><Globe size={19} /><span><strong>Portfolio</strong>{selected.handle}.example</span><button type="button" onClick={() => setPreview('portfolio')}>Preview <ArrowUpRight size={14} /></button></div>
              <div><CodeXml size={19} /><span><strong>GitHub</strong>@{selected.handle}</span><small>Sample handle</small></div>
              <div><BriefcaseBusiness size={19} /><span><strong>LinkedIn</strong>{selected.name}</span><small>Sample profile</small></div>
            </div> : <>
              {preview === 'profile' && <>
                <p className="developer-dialog-bio">{selected.bio}</p>
                <div className="developer-strengths"><span className="developer-specialty">{selected.specialty}</span>{selected.strengths.map(strength => <span key={strength}><Check size={11} />{strength}</span>)}</div>
                <SkillList person={selected} />
                <dl className="developer-fit"><div><dt>WORK STYLE</dt><dd>{selected.workStyle}</dd></div><div><dt>CAN START</dt><dd>{selected.start}</dd></div><div><dt>TIME ZONE</dt><dd>{selected.timezone}</dd></div><div><dt>LOOKING FOR</dt><dd>{selected.availability.replace('Open to ', '')}</dd></div></dl>
              </>}
              <div className="developer-work-heading"><h3>Selected work</h3><span>{selected.projects.length} projects</span></div>
              <div className="developer-project-grid">{selected.projects.map(work => <button type="button" className="developer-project-tile" key={work.name} onClick={() => setProject(work)} aria-label={`Preview ${work.name}`}><ProjectCover project={work} /></button>)}</div>
              <button type="button" className="developer-dialog-socials" onClick={() => setPreview('social')}><CodeXml size={16} /><BriefcaseBusiness size={16} /> Social profiles <ArrowUpRight size={14} /></button>
            </>}
          </>}
          <Link className="button button-red developer-profile-action" href="/signup?role=hiring" onClick={() => dialog.current?.close()}>Join to connect <ArrowUpRight size={18} /></Link>
          <p className="developer-demo-note">Mock profile: projects and social details are illustrative.</p>
        </>}
      </dialog>
    </section>
  );
}
