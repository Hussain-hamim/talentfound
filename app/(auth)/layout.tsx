import { Brand, MatchMark } from "@/components/brand";
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="auth-layout" id="main-content">
      <aside className="auth-story">
        <Brand light />
        <div className="auth-story-main">
          <div className="eyebrow">FOR THE ONES WHO MAKE.</div>
          <h2>
            Your work.
            <br />
            Your people.
            <br />
            <span>Your next chapter.</span>
          </h2>
          <p>
            Good things happen when the right
            <br />
            builders find each other.
          </p>
          <div className="auth-graphic" aria-hidden="true">
            <div className="auth-orbit orbit-a" />
            <div className="auth-orbit orbit-b" />
            <div className="auth-orbit orbit-c" />
            <div className="auth-graphic-center">
              <MatchMark />
            </div>
            <span className="orbit-node node-one">&lt;/&gt;</span>
            <span className="orbit-node node-two">✳</span>
            <span className="orbit-node node-three">↗</span>
          </div>
        </div>
        <div className="auth-story-footer">
          <span>ONE PROFILE. MORE POSSIBILITY.</span>
          <span>© {new Date().getFullYear()} TalentFound</span>
        </div>
      </aside>
      <section className="auth-panel">
        <div className="auth-mobile-brand">
          <Brand />
        </div>
        {children}
        <div className="auth-panel-footer">
          A little less searching. A lot more building.
        </div>
      </section>
    </main>
  );
}
