import Image from "next/image";
import { Accessibility, ArrowUpRight, CodeXml, Waves } from "lucide-react";
import type { Developer, DeveloperProject } from "./developer-profile-data";

const skillIcons: Record<string, string> = {
  React: 'react', TypeScript: 'typescript', 'Next.js': 'nextjs', 'Node.js': 'nodejs',
  PostgreSQL: 'postgresql', Python: 'python', FastAPI: 'fastapi', Redis: 'redis',
  WebGL: 'webgl', Go: 'go', Docker: 'docker',
};

export function SkillList({ person }: { person: Developer }) {
  return <div className="developer-tech-stack"><span className="developer-tech-stack-label">Tech stack:</span><ul className="developer-skills" aria-label={`${person.name}'s skills`}>
    {person.skills.map(skill => <li key={skill} tabIndex={0}>
      {skillIcons[skill]
        ? <Image className={`developer-skill-icon skill-${skillIcons[skill]}`} src={`/images/skills/${skillIcons[skill]}.svg`} alt={skill} width={24} height={24} />
        : <span role="img" aria-label={skill}>{skill === 'Accessibility' ? <Accessibility size={24} aria-hidden="true" /> : skill === 'Motion' ? <Waves size={24} aria-hidden="true" /> : <CodeXml size={24} aria-hidden="true" />}</span>}
      <span className="developer-skill-tooltip" aria-hidden="true">{skill}</span>
    </li>)}
  </ul></div>;
}

export function ProjectCover({ project }: { project: DeveloperProject }) {
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

export function Identity({ person, dialog = false }: { person: Developer; dialog?: boolean }) {
  return <div className="developer-identity">
    <span className="developer-avatar-wrap">
      <Image className={`developer-avatar theme-${person.theme}`} src={person.avatar} alt="" width={64} height={64} />
      {person.isOnline && <span className="developer-online-dot" role="img" aria-label="Online now (sample status)" title="Online now (sample status)" />}
    </span>
    <div>{dialog ? <h2 id="developer-dialog-title">{person.name}</h2> : <h3>{person.name}</h3>}<p>{person.role}</p></div>
  </div>;
}

