import Link from 'next/link';
import { ArrowUpRight, FileText } from 'lucide-react';
import type { Developer, DeveloperProject } from './developer-profile-data';
import { projectEvidence, projectSlug } from './developer-hiring-data';

export function ProjectEvidenceDetail({ person, project, showProfileLink = true }: { person: Developer; project: DeveloperProject; showProfileLink?: boolean }) {
  const proof = projectEvidence(project);
  const feedback = person.reviews.filter(review => review.project === project.name || review.project.startsWith(`${project.name} `));
  return <div className="hiring-project-evidence">
    <span className="hiring-eyebrow">ILLUSTRATIVE CASE STUDY</span>
    <h3>{project.name}</h3><p>{project.description}</p>
    <div className="hiring-context">{proof.context}<span>{project.stack}</span></div>
    <dl><div><dt>The problem</dt><dd>{proof.problem}</dd></div><div><dt>My contribution</dt><dd>{project.contribution}</dd></div><div><dt>What changed</dt><dd>{proof.outcome}</dd></div></dl>
    <details className="hiring-evidence-notes"><summary><FileText size={15} />Evidence &amp; project context</summary><p>This sample case study outlines the evidence a real developer would attach. No live deployment, repository, or independently checked outcome is available for this fictional project.</p><ul>{proof.artifacts.map(item => <li key={item}>{item} <span>· Not attached in this sample</span></li>)}</ul></details>
    {feedback.length > 0 && <Link className="hiring-text-link" href={`/developers/${person.id}#reviews`}>Read {feedback.length} related sample {feedback.length === 1 ? 'review' : 'reviews'} <ArrowUpRight size={13} /></Link>}
    {showProfileLink && <Link className="hiring-text-link" href={`/developers/${person.id}#project-${projectSlug(project)}`}>Open on full profile <ArrowUpRight size={13} /></Link>}
  </div>;
}
