import Link from "next/link";
import { Arrow, Brand } from "@/components/brand";
import { DevMatchHero } from "@/components/devmatch-hero";
import { ScrollReveal } from "@/components/scroll-reveal";
import {
  BuilderShowcase,
  ConnectionPlayground,
} from "@/components/landing-experience";
import {
  ProfileChapter,
  OpportunityChapter,
  CofounderChapter,
  QuestionsChapter,
} from "@/components/landing-chapters";
import "./landing.css";
import "./landing-chapters.css";
import "./hero.css";

export default function Home() {
  return (
    <div className="landing-v2">
      <ScrollReveal />
      <main id="main-content">
        <DevMatchHero />

        <section className="work-section" id="for-developers">
          <div className="work-heading" data-reveal>
            <div>
              <h2>
                Less résumé.
                <br />
                <span>More you.</span>
              </h2>
            </div>
            <div className="work-intro">
              <p>
                Projects. Experiments. That thing you stayed up to finish.
                <br />
                Give it a place to be found.
              </p>
              <span className="example-caption">A FEW PROFILE STUDIES ↙</span>
            </div>
          </div>
          <BuilderShowcase />
        </section>

        <ProfileChapter />

        <section className="people-section" id="for-founders">
          <div className="people-heading" data-reveal>
            <span className="section-kicker">
              DIFFERENT SKILLS. SHARED AMBITION.
            </span>
            <h2>
              Someone out there
              <br />
              is your <span>kind of person.</span>
            </h2>
          </div>
          <ConnectionPlayground />
        </section>

        <OpportunityChapter />
        <CofounderChapter />
        <QuestionsChapter />

        <section className="closing-section" data-reveal>
          <span className="section-kicker">
            YOUR NEXT CHAPTER IS A PERSON AWAY.
          </span>
          <h2>
            Let’s make
            <br />
            <span>something click.</span>
            <span className="closing-star" aria-hidden="true">
              ✳
            </span>
          </h2>
          <Link className="brand-button" href="/signup">
            Put yourself out there <Arrow diagonal />
          </Link>
        </section>
      </main>
      <footer className="brand-footer">
        <div className="footer-utility">
          <Brand />
          <nav aria-label="Footer">
            <a href="#for-developers">The people</a>
            <a href="#questions">Good to know</a>
            <Link href="/login">
              Log in <Arrow diagonal />
            </Link>
          </nav>
          <span>
            Independent minds.
            <br />
            Better, together.
          </span>
        </div>
        <div className="oversized-wordmark" aria-hidden="true">
          devmatch<span>✳</span>
        </div>
        <div className="footer-colophon">
          <span>© {new Date().getFullYear()} DEVMATCH</span>
          <span>MADE FOR THE ONES WHO MAKE.</span>
          <a href="#main-content">BACK TO TOP ↑</a>
        </div>
      </footer>
    </div>
  );
}
