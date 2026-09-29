import Link from "next/link";
import { Arrow, Brand, CodeIcon, MatchMark } from "@/components/brand";
import { Header } from "@/components/header";
import { ProfilePreview } from "@/components/profile-preview";
import { ScrollReveal } from "@/components/scroll-reveal";

const questions = [
  [
    "How is DevMatch different from a job board?",
    "Your work starts the conversation. Instead of applying to individual listings, you build a profile with your projects, skills, and interests. Recruiters and founders can discover you and send a direct invitation to connect.",
  ],
  [
    "Who is DevMatch for?",
    "Developers who want their work to be seen, teams looking for builders, and founders looking for a technical partner. Whether you build for the web, mobile, or AI, there’s a place for your work here.",
  ],
  [
    "Can I look for a co-founder, too?",
    "Yes. Co-founder connections are part of the vision, alongside full-time jobs, freelance work, and collaborations. Your profile can reflect the kinds of opportunities you’re interested in.",
  ],
  [
    "Do I need to be actively looking for work?",
    "No. Your profile is a home for what you’ve built, even when you’re happy where you are. You can choose when you’re open to conversations and which opportunities interest you.",
  ],
];

export default function Home() {
  return (
    <>
      <ScrollReveal />
      <Header />
      <main id="main-content">
        <section className="hero frame" aria-labelledby="hero-title">
          <span className="cross cross-tl" aria-hidden="true">
            +
          </span>
          <span className="cross cross-br" aria-hidden="true">
            +
          </span>
          <div className="hero-copy">
            <div className="eyebrow">
              <span className="status-dot" /> BUILT FOR PEOPLE WHO BUILD
            </div>
            <h1 id="hero-title">
              <span className="hero-line">Great work.</span>
              <span className="hero-line">Right people.</span>
              <span className="hero-line accent-line">More possibility.</span>
            </h1>
            <p>
              You build the things that matter.
              <br className="desktop-break" /> Let the right opportunities find
              you.
            </p>
            <div className="hero-actions">
              <Link className="button button-red" href="/signup">
                Create your profile <Arrow />
              </Link>
              <Link
                className="button button-outline"
                href="/signup?role=hiring"
              >
                Find your next builder <Arrow diagonal />
              </Link>
            </div>
            <div className="hero-footnote">
              <span className="tiny-check">✓</span> Your projects. Your
              potential. One profile.
            </div>
          </div>
          <div className="hero-art">
            <div className="orbital orbital-one" />
            <div className="orbital orbital-two" />
            <div className="art-grid" />
            <span className="art-label">
              GOOD THINGS HAPPEN WHEN BUILDERS CONNECT.
            </span>
            <ProfilePreview />
            <div className="ping-card">
              <span className="ping-icon">
                <Arrow diagonal />
              </span>
              <div>
                <strong>Your work caught our eye.</strong>
                <span>A new opportunity starts with a ping.</span>
              </div>
              <span className="ping-dot" />
            </div>
            <span className="art-coordinate">
              [ YOUR NEXT CHAPTER STARTS HERE ]
            </span>
          </div>
        </section>
        <section
          className="stack-strip frame"
          aria-label="A home for every kind of developer"
        >
          <span>
            WHATEVER YOUR STACK.
            <br />
            <strong>THERE’S A PLACE FOR YOU.</strong>
          </span>
          <div className="stack-list">
            <span>
              <b className="react-symbol">⚛</b> React
            </span>
            <span>
              <b className="next-symbol">N</b> Next.js
            </span>
            <span>
              <b className="ts-symbol">TS</b> TypeScript
            </span>
            <span>
              <CodeIcon /> Python
            </span>
            <span>
              <b className="node-symbol">⬡</b> Node.js
            </span>
            <span className="and-more">& beyond</span>
          </div>
        </section>
        <section className="section frame" id="for-developers">
          <div data-reveal className="section-heading">
            <div>
              <div className="eyebrow">01 / YOUR WORK, FRONT AND CENTER</div>
              <h2>
                More than a résumé.
                <br />A reason to reach out<span className="red-text">.</span>
              </h2>
            </div>
            <p>
              Your next chapter starts with what you’ve already built. Give it a
              place to be discovered.
            </p>
          </div>
          <div className="feature-grid">
            <article data-reveal className="feature-card">
              <div className="feature-visual">
                <div className="mini-window">
                  <div className="window-bar">
                    <i />
                    <i />
                    <i />
                    <span>your-next-big-thing.app</span>
                    <Arrow diagonal />
                  </div>
                  <div className="project-art">
                    <div className="project-art-mark">
                      <MatchMark />
                    </div>
                    <span>
                      From an idea.
                      <br />
                      <strong>To something real.</strong>
                    </span>
                    <span className="project-live">● LIVE PROJECT</span>
                  </div>
                </div>
                <div className="floating-tag">
                  <CodeIcon /> Made by you. Seen by the right people.
                </div>
              </div>
              <div className="feature-copy">
                <span className="feature-number">[ 01 ]</span>
                <h3>Let your work do the talking.</h3>
                <p>
                  Projects, code, and the story behind them. A living profile
                  that shows what you can actually build.
                </p>
              </div>
            </article>
            <article data-reveal className="feature-card">
              <div className="feature-visual opportunity-visual">
                <div className="opportunity-row">
                  <span className="opportunity-logo">↗</span>
                  <div>
                    <strong>A role that fits your craft</strong>
                    <small>Full-time · Remote</small>
                  </div>
                  <span className="notification-dot" />
                </div>
                <div className="opportunity-row">
                  <span className="opportunity-logo logo-purple">⌘</span>
                  <div>
                    <strong>Something worth building</strong>
                    <small>Freelance · Your next project</small>
                  </div>
                  <Arrow diagonal />
                </div>
                <div className="opportunity-row faded-row">
                  <span className="opportunity-logo logo-green">✳</span>
                  <div>
                    <strong>Your next great collaboration</strong>
                    <small>Co-founder · Start something</small>
                  </div>
                  <Arrow diagonal />
                </div>
              </div>
              <div className="feature-copy">
                <span className="feature-number">[ 02 ]</span>
                <h3>Less applying. More connecting.</h3>
                <p>
                  Get discovered by teams who value your skills. When the fit is
                  right, they make the first move.
                </p>
              </div>
            </article>
            <article data-reveal className="feature-card">
              <div className="feature-visual control-visual">
                <div className="availability-card">
                  <span className="mini-label">OPEN TO POSSIBILITIES</span>
                  <div>
                    <span>Full-time opportunities</span>
                    <span className="visual-switch on" />
                  </div>
                  <div>
                    <span>Freelance projects</span>
                    <span className="visual-switch on" />
                  </div>
                  <div>
                    <span>Co-founder connections</span>
                    <span className="visual-switch" />
                  </div>
                  <small>
                    <span className="status-dot" /> On your terms. Always.
                  </small>
                </div>
              </div>
              <div className="feature-copy">
                <span className="feature-number">[ 03 ]</span>
                <h3>Your career. Your call.</h3>
                <p>
                  Choose what you’re open to, who you connect with, and what
                  comes next. You’re in control.
                </p>
              </div>
            </article>
          </div>
        </section>
        <section className="section how-section frame" id="how-it-works">
          <div data-reveal className="section-heading">
            <div>
              <div className="eyebrow">02 / A BETTER WAY TO CONNECT</div>
              <h2>
                Build. Share. Get discovered<span className="red-text">.</span>
              </h2>
            </div>
            <Link href="/signup" className="text-link">
              Let’s get you out there <Arrow />
            </Link>
          </div>
          <div className="steps">
            {[
              [
                "01",
                "Make it yours.",
                "Bring your projects, stack, and experience together in one profile.",
              ],
              [
                "02",
                "Put your work out there.",
                "Show teams and founders what you build and what you’re open to.",
              ],
              [
                "03",
                "Let the right people find you.",
                "Get a ping. Start a conversation. See where it takes you.",
              ],
            ].map(([number, title, description]) => (
              <article data-reveal key={number}>
                <div className="step-number">
                  {number}
                  <span />
                  <Arrow />
                </div>
                <h3>{title}</h3>
                <p>{description}</p>
              </article>
            ))}
          </div>
        </section>
        <section className="founder-section frame" id="for-founders">
          <div data-reveal className="founder-art" aria-hidden="true">
            <div className="founder-circle">
              <CodeIcon />
            </div>
            <div className="connection-line">
              <span />
              <span />
              <span />
            </div>
            <div className="founder-circle founder-circle-red">
              <MatchMark />
            </div>
            <span className="builder-caption">THE BUILDER</span>
            <span className="idea-caption">THE BIG IDEA</span>
          </div>
          <div data-reveal className="founder-copy">
            <div className="eyebrow">03 / BETTER, TOGETHER</div>
            <h2>
              Your next big idea.
              <br />
              Your kind of people<span className="red-text">.</span>
            </h2>
            <p>
              Find the technical co-founder who gets your vision. Or the founder
              who gives your skills a new direction. Great things start with the
              right connection.
            </p>
            <Link className="button button-outline" href="/signup?role=founder">
              Find your co-founder <Arrow diagonal />
            </Link>
          </div>
        </section>
        <section data-reveal className="section faq-section frame" id="faq">
          <div>
            <div className="eyebrow">A FEW THINGS TO KNOW</div>
            <h2>
              Good questions.
              <br />
              Straight answers<span className="red-text">.</span>
            </h2>
          </div>
          <div className="faq-list">
            {questions.map(([question, answer]) => (
              <details key={question}>
                <summary>
                  {question}
                  <span className="faq-plus" aria-hidden="true">
                    +
                  </span>
                </summary>
                <p>{answer}</p>
              </details>
            ))}
          </div>
        </section>
        <section data-reveal className="final-cta frame">
          <div className="eyebrow">LESS SEARCHING. MORE BUILDING.</div>
          <h2>
            You make great things.
            <br />
            Let’s make sure people know<span>.</span>
          </h2>
          <Link className="button button-light" href="/signup">
            Create your DevMatch profile <Arrow />
          </Link>
          <div className="cta-decoration" aria-hidden="true">
            <MatchMark />
          </div>
        </section>
      </main>
      <footer className="footer frame">
        <div className="footer-top">
          <div>
            <Brand />
            <p>
              A home for your work.
              <br />A starting point for what’s next.
            </p>
          </div>
          <nav aria-label="Footer">
            <a href="#for-developers">For developers</a>
            <a href="#for-founders">For founders</a>
            <a href="#how-it-works">How it works</a>
            <a href="#faq">FAQs</a>
          </nav>
          <Link className="text-link" href="/login">
            Already one of us? Log in <Arrow diagonal />
          </Link>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} DevMatch</span>
          <span>MADE FOR THE ONES WHO MAKE.</span>
          <a href="#main-content">Back to top ↑</a>
        </div>
      </footer>
    </>
  );
}
