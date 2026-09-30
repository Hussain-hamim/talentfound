import { Arrow, CodeIcon } from "./brand";
export function ProfilePreview() {
  return (
    <div className="profile-preview" aria-label="Example developer profile">
      <div className="profile-browser">
        <span>
          <i />
          <i />
          <i />
        </span>
        <span>talentfound / alexmorgan</span>
        <Arrow diagonal />
      </div>
      <div className="profile-content">
        <div className="profile-top">
          <div className="avatar avatar-large">
            am<span>✳</span>
          </div>
          <span className="available">
            <span className="status-dot" /> Open to work
          </span>
        </div>
        <h2>
          Alex Morgan{" "}
          <span className="verified" aria-label="Verified example">
            ✳
          </span>
        </h2>
        <div className="profile-role">
          Full-stack developer. Endlessly curious.
        </div>
        <p>
          I turn coffee and interesting problems
          <br />
          into things people love to use.
        </p>
        <div className="skill-tags">
          <span>React</span>
          <span>Next.js</span>
          <span>TypeScript</span>
          <span>+3</span>
        </div>
        <div className="profile-divider" />
        <div className="project-heading">
          <span>SELECTED WORK</span>
          <span>
            02 PROJECTS <Arrow diagonal />
          </span>
        </div>
        <div className="profile-projects">
          <div className="preview-project">
            <div className="preview-project-art art-one">
              <span className="mini-orbit" />
              <span className="mini-planet" />
              <b>
                orbit<span>make room for focus.</span>
              </b>
            </div>
            <div className="preview-project-title">
              Orbit workspace <Arrow diagonal />
            </div>
            <span>Next.js · Supabase</span>
          </div>
          <div className="preview-project">
            <div className="preview-project-art art-two">
              <CodeIcon />
              <div className="code-lines">
                <i />
                <i />
                <i />
                <i />
              </div>
              <span className="code-cursor">▌</span>
            </div>
            <div className="preview-project-title">
              Snip / code, collected <Arrow diagonal />
            </div>
            <span>React · TypeScript</span>
          </div>
        </div>
        <div className="profile-footer">
          <span>
            <span className="globe-icon">◎</span> Based on Earth. Building
            everywhere.
          </span>
          <span>↗</span>
        </div>
      </div>
    </div>
  );
}
