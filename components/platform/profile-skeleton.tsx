export function ProfileSkeleton() {
  return (
    <div
      className="profile-skeleton"
      role="status"
      aria-label="Loading developer profile"
      aria-busy="true"
    >
      <span className="sr-only">Loading developer profile…</span>
      <div aria-hidden="true">
        <div className="profile-skeleton-topline">
          <span className="profile-skeleton-line" />
          <span className="profile-skeleton-line" />
        </div>
        <div className="profile-skeleton-hero">
          <div>
            <div className="profile-skeleton-identity">
              <span className="profile-skeleton-avatar" />
              <div>
                <span className="profile-skeleton-line profile-skeleton-title" />
                <span className="profile-skeleton-line" />
              </div>
            </div>
            <span className="profile-skeleton-line" />
            <span className="profile-skeleton-line profile-skeleton-short" />
            <div className="profile-skeleton-socials">
              <span />
              <span />
              <span />
            </div>
          </div>
          <div className="profile-skeleton-bio">
            <span className="profile-skeleton-line profile-skeleton-short" />
            <span className="profile-skeleton-line profile-skeleton-title" />
            <span className="profile-skeleton-line profile-skeleton-title" />
            <span className="profile-skeleton-line" />
          </div>
        </div>
        <div className="profile-skeleton-nav">
          <span className="profile-skeleton-line" />
          <span className="profile-skeleton-line" />
          <span className="profile-skeleton-line" />
        </div>
        <div className="profile-skeleton-body">
          <div className="profile-skeleton-projects">
            {[0, 1].map((project) => (
              <div className="profile-skeleton-project" key={project}>
                <span className="profile-skeleton-cover" />
                <span className="profile-skeleton-line profile-skeleton-title" />
                <span className="profile-skeleton-line" />
                <span className="profile-skeleton-line profile-skeleton-short" />
              </div>
            ))}
          </div>
          <div className="profile-skeleton-contact">
            <span className="profile-skeleton-line profile-skeleton-title" />
            <span className="profile-skeleton-line" />
            <span className="profile-skeleton-button" />
            <span className="profile-skeleton-button" />
            <span className="profile-skeleton-line profile-skeleton-short" />
            <span className="profile-skeleton-line" />
          </div>
        </div>
      </div>
    </div>
  );
}
