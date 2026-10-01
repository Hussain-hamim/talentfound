"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type MouseEvent } from "react";
import { Check, CodeXml, Eye, Globe, BriefcaseBusiness, MapPin, ArrowUpRight, ArrowLeft, X } from "lucide-react";
import { developers, developerCategories, developerCategoryThemes, type Developer, type DeveloperProject } from "./developer-profile-data";
import { rankingPrior, selectDevelopers, type DeveloperSort } from './developer-ranking';
import { Identity, SkillList, ProjectCover } from "./developer-card-parts";
import { SaveDeveloper, ShortlistLink } from "./hiring-ui";
import { savedDeveloperIds, useHiringStore } from "./hiring-store";
import { emptyFit, developerFit, hasFitFilters, compensation, type Engagement, type FitFilters } from "./developer-hiring-data";
import { DeveloperFitControls } from "./developer-fit-controls";
import { ProjectEvidenceDetail } from "./project-evidence-detail";
import { DeveloperRating, DeveloperReviews, ReviewExcerpt } from './developer-reviews';

const categories = ["All developers", ...developerCategories] as const;
type Preview = "profile" | "portfolio" | "social" | "reviews";

export function DeveloperProfiles({ directory = false, initialEngagement = '' }: { directory?: boolean; initialEngagement?: Engagement | '' }) {
  const [category, setCategory] = useState<(typeof categories)[number]>("All developers");
  const [sort, setSort] = useState<DeveloperSort>('featured');
  const [newTalent, setNewTalent] = useState(false);
  const [selected, setSelected] = useState<Developer | null>(null);
  const [preview, setPreview] = useState<Preview>("profile");
  const [project, setProject] = useState<DeveloperProject | null>(null);
  const saved = savedDeveloperIds(useHiringStore());
  const [fit, setFit] = useState<FitFilters>({ ...emptyFit, engagement: initialEngagement });
  const [compact, setCompact] = useState(directory);
  const [profileViews, setProfileViews] = useState<Record<string, number>>({});
  const dialog = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLButtonElement | null>(null);
  const visible = selectDevelopers(developers, category, newTalent, sort).filter(person => developerFit(person, fit).matches);

  useEffect(() => {
    if (!selected) return;
    dialog.current?.showModal();
    if (dialog.current) dialog.current.scrollTop = 0;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previousOverflow; };
  }, [selected]);

  function openProfile(person: Developer, event: MouseEvent<HTMLButtonElement>, view: Preview = "profile", work: DeveloperProject | null = null) {
    if (view === 'profile') {
      setProfileViews(previous => ({ ...previous, [person.id]: (previous[person.id] ?? 0) + 1 }));
    }
    opener.current = event.currentTarget;
    setPreview(view);
    setProject(work);
    setSelected(person);
  }

  function resetFilters() {
    setCategory('All developers');
    setNewTalent(false);
    setSort('featured');
    setFit(emptyFit);
  }

  return (
    <section className="developer-profiles" id="developers" aria-labelledby="developers-title">
      <div className="developer-section-heading">
        <h2 id="developers-title">Good people.<br /><span>Worth getting to know.</span></h2>
        <div className="developer-section-intro"><p>Different skills. Shared curiosity.{" "}<br />Meet the builders making things happen.</p></div>
      </div>
      <div className="hiring-discovery-top"><div className="hiring-view-toggle" role="group" aria-label="Card layout"><button type="button" aria-pressed={!compact} onClick={() => setCompact(false)}>Showcase</button><button type="button" aria-pressed={compact} onClick={() => setCompact(true)}>Compact</button></div><div className="hiring-directory-links">{!directory && <Link href="/developers" className="hiring-text-link">Browse directory <ArrowUpRight size={14} /></Link>}<ShortlistLink /></div></div>
      <DeveloperFitControls value={fit} onChange={setFit} />
      <div className="developer-toolbar">
        <div className="developer-filters" role="group" aria-label="Filter developers by specialty">
          {categories.map(item => <button key={item} type="button" aria-pressed={category === item} onClick={() => setCategory(item)}>{item}<span aria-hidden="true">{item === "All developers" ? developers.length : developers.filter(p => p.category === item).length}</span></button>)}
        </div>
        <div className="developer-discovery-controls">
          <button type="button" className="developer-new-filter" aria-pressed={newTalent} onClick={() => setNewTalent(value => !value)}>New talent</button>
          <label className="developer-sort">Sort by<select value={sort} onChange={event => setSort(event.target.value as DeveloperSort)}><option value="featured">Featured</option><option value="top-rated">Top rated</option><option value="newest">Newest</option></select></label>
        </div>
      </div>
      <div className="developer-discovery-note">
        <details className="developer-ranking-explanation"><summary>Top rated considers both client ratings and review count.</summary><p>The prototype score is (sum of review ratings + {rankingPrior.count} × {rankingPrior.rating.toFixed(1)}) ÷ (review count + {rankingPrior.count}). It adds the weight of five 4-star reviews to temper small samples. Visible stars show the actual average. Ties use review count, then profile ID; unreviewed profiles appear last. Featured keeps our curated order; Newest uses the date joined. All feedback is sample data.</p></details>
        <span className="developer-sample-label">Sample profiles{saved.length > 0 && ` · ${saved.length} saved`}</span>
      </div>
      <p className="sr-only" role="status">Showing {visible.length} sample developer {visible.length === 1 ? 'profile' : 'profiles'}, sorted by {sort === 'top-rated' ? 'top rated' : sort}. {saved.length} saved in this browser.</p>
      {visible.length === 0 && <div className="developer-discovery-empty"><h3>No developers match these filters.</h3><p>Try broadening your requirements or include developers with reviews.</p><button type="button" className="button button-red" onClick={resetFilters}>Reset filters <ArrowUpRight size={16} /></button></div>}
      <div className={`developer-grid${compact ? " developer-grid-compact" : ""}`}>
        {visible.map(person => <article className={`developer-card theme-${developerCategoryThemes[person.category]}`} key={person.id}>
          <div className="developer-card-header">
            <Identity person={person} />
            <div className="developer-card-details">
              <span className="developer-availability"><i aria-hidden="true" />{person.availability}</span>
              <p className="developer-meta"><span><MapPin size={12} aria-hidden="true" />{person.location}</span><span>{person.experience} experience</span></p>
            </div>
          </div>
          <div className="developer-card-stats">
            <DeveloperRating person={person} onClick={event => openProfile(person, event, 'reviews')} />
            <span className="developer-view-count" title="View profile clicks during this visit. Preview count resets when the page reloads." aria-label={`${profileViews[person.id] ?? 0} profile views during this visit`}>
              <Eye size={14} aria-hidden="true" /><span>{(profileViews[person.id] ?? 0).toLocaleString('en-US')} {(profileViews[person.id] ?? 0) === 1 ? 'view' : 'views'}</span>
            </span>
          </div>
          {hasFitFilters(fit) && <p className="hiring-fit-reasons"><Check size={12} />{developerFit(person, fit).reasons.slice(0, 3).join(" · ") || "Meets your selected requirements"}</p>}
          <p className="developer-bio">{person.bio}</p>
          <div className="developer-strengths"><span className="developer-specialty">{person.specialty}</span>{person.strengths.map(strength => <span key={strength}><Check size={11} aria-hidden="true" />{strength}</span>)}</div>
          <SkillList person={person} />
          <dl className="developer-fit"><div><dt>WORK STYLE</dt><dd>{person.workStyle}</dd></div><div><dt>CAN START</dt><dd>{person.start}</dd></div></dl>
          <p className="hiring-card-budget">{compensation(person, fit.engagement)} <span>· Sample expectation</span></p>
          <div className="developer-work-heading"><h4>Selected work</h4><span>{String(person.projects.length).padStart(2, '0')} projects</span></div>
          <div className={`developer-project-grid ${!compact && person.projects.length === 3 ? 'three-projects' : ''}`}>
            {(compact ? person.projects.slice(0, 2) : person.projects).map(work => <button type="button" key={work.name} className="developer-project-tile" aria-label={`Preview ${work.name} by ${person.name}`} onClick={event => openProfile(person, event, "portfolio", work)}><ProjectCover project={work} /></button>)}
          </div>
          {compact ? <Link className="hiring-more-work" href={`/developers/${person.id}#work`}>Explore all {person.projects.length} projects <ArrowUpRight size={12} /></Link> : <ReviewExcerpt person={person} />}
          <div className="developer-card-links">
            <button type="button" onClick={event => openProfile(person, event, "portfolio")} aria-label={`View ${person.name}'s portfolio`}><Globe size={15} />Portfolio<ArrowUpRight size={12} /></button>
            <div>
              <button type="button" onClick={event => openProfile(person, event, "social")} aria-label={`${person.name}'s GitHub preview`} title="GitHub preview"><CodeXml size={15} /><span>GitHub</span></button>
              <button type="button" onClick={event => openProfile(person, event, "social")} aria-label={`${person.name}'s LinkedIn preview`} title="LinkedIn preview"><BriefcaseBusiness size={15} /><span>LinkedIn</span></button>
            </div>
          </div>
          <div className="developer-card-actions">
            <Link className="button button-red developer-profile-action" href={`/developers/${person.id}`} onClick={() => setProfileViews(previous => ({ ...previous, [person.id]: (previous[person.id] ?? 0) + 1 }))} aria-label={`View ${person.name}'s sample profile`}>View profile <ArrowUpRight size={18} /></Link>
            <SaveDeveloper id={person.id} name={person.name} />
          </div>
        </article>)}
      </div>
      <p className="developer-avatar-credit">Illustrative profiles, reviews, projects, social handles and online status. Saved profiles stay in this browser. Online presence is separate from work availability.<br />Avatars: <a href="https://www.dicebear.com/styles/adventurer/" target="_blank" rel="noreferrer">Adventurer by Lisa Wischofsky</a> via DiceBear · <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noreferrer">CC BY 4.0</a></p>
      <dialog className={`developer-dialog ${selected ? `theme-${developerCategoryThemes[selected.category]}` : ''}`} ref={dialog} aria-labelledby="developer-dialog-title" onClick={event => { if (event.target === event.currentTarget) dialog.current?.close(); }} onClose={() => { setSelected(null); opener.current?.focus(); }}>
        {selected && <>
          <button type="button" className="developer-dialog-close" aria-label="Close developer profile" onClick={() => dialog.current?.close()}><X size={20} /></button>
          <span className="section-kicker">{project ? 'PROJECT PREVIEW' : preview === 'reviews' ? 'CLIENT REVIEWS · SAMPLE' : preview === 'portfolio' ? 'PORTFOLIO PREVIEW' : preview === 'social' ? 'FIND ME ONLINE' : 'DEVELOPER PROFILE'}</span>
          <Identity person={selected} dialog />
          <p className="developer-meta">{selected.location}<span aria-hidden="true">·</span>{selected.experience} experience</p>
          {preview === 'reviews' ? <><button type="button" className="developer-back-projects" onClick={() => setPreview('profile')}><ArrowLeft size={14} /> Back to profile</button><DeveloperReviews person={selected} /></> : project ? <div className="developer-project-detail">
            <button type="button" className="developer-back-projects" onClick={() => setProject(null)}><ArrowLeft size={14} /> All projects</button>
            <ProjectCover project={project} />
            <ProjectEvidenceDetail person={selected} project={project} />
          </div> : <>
            {preview === 'social' ? <div className="developer-social-preview">
              <p>Where {selected.name.split(' ')[0]} shares work and stays in touch.</p>
              <div><Globe size={19} /><span><strong>Portfolio</strong>{selected.handle}.example</span><button type="button" onClick={() => setPreview('portfolio')}>Preview <ArrowUpRight size={14} /></button></div>
              <div><CodeXml size={19} /><span><strong>GitHub</strong>@{selected.handle}</span><small>Sample handle</small></div>
              <div><BriefcaseBusiness size={19} /><span><strong>LinkedIn</strong>{selected.name}</span><small>Sample profile</small></div>
            </div> : <>
              {preview === 'profile' && <>
                <DeveloperRating person={selected} onClick={() => setPreview('reviews')} />
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
          <Link className="button button-red developer-profile-action" href={`/developers/${selected.id}`} onClick={() => dialog.current?.close()}>Explore full profile <ArrowUpRight size={18} /></Link>
          <p className="developer-demo-note">Mock profile: reviews, projects and social details are illustrative.</p>
        </>}
      </dialog>
    </section>
  );
}
