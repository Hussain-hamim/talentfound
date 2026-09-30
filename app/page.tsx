import Link from "next/link";
import { Arrow, Brand } from "@/components/brand";
import { DevMatchHero } from "@/components/devmatch-hero";
import { FooterWordmark } from "@/components/footer-wordmark";
import { ScrollReveal } from "@/components/scroll-reveal";
import {
  BuilderShowcase,
  ConnectionPlayground,
} from "@/components/landing-experience";
import {
  OpportunityChapter,
  CofounderChapter,
  QuestionsChapter,
} from "@/components/landing-chapters";
import "./landing.css";
import "./landing-chapters.css";
import "./hero.css";
import "./people.css";
import "./faq.css";

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
            </div>
          </div>
          <BuilderShowcase />
        </section>

        <section className="people-section people-section-redesign" id="for-founders" aria-labelledby="match-title">
          <ConnectionPlayground />
        </section>

        <OpportunityChapter />
        <CofounderChapter />
        <QuestionsChapter />

        <section className="closing-section" aria-labelledby="closing-title" data-reveal>
          <h2 id="closing-title">
            Let’s make
            <br />
            <span>something click.</span>
          </h2>
          <p className="closing-description">
            Bring your work. Find your people.<br />
            See what you can build together.
          </p>
          <Link className="brand-button" href="/signup">
            Create your profile <Arrow diagonal />
          </Link>
        </section>
      </main>
      <footer className="brand-footer">
        <div className="footer-utility">
          <div className="footer-brand">
            <Brand />
            <p className="footer-tagline">Good work. Great company.</p>
            <p className="footer-description">
              A home for independent minds to share their work, find their people,
              and build what comes next.
            </p>
            <Link className="brand-button footer-invitation" href="/signup">
              Find your people <Arrow diagonal />
            </Link>
          </div>
          <nav className="footer-navigation" aria-label="Footer">
            <div className="footer-link-group">
              <h2>For talent</h2>
              <Link href="/signup?role=developer">Create your profile</Link>
              <a href="#for-developers">Show your work</a>
              <a href="#possibilities">Explore opportunities</a>
              <Link href="/login">Log in</Link>
            </div>
            <div className="footer-link-group">
              <h2>For teams</h2>
              <Link href="/signup?role=hiring">Hire developers</Link>
              <a href="#for-developers">Meet the builders</a>
              <a href="#build-together">Find a co-founder</a>
              <Link href="/signup?role=founder">Bring your idea</Link>
            </div>
            <div className="footer-link-group">
              <h2>Explore</h2>
              <a href="#for-founders">Find your match</a>
              <a href="#possibilities">Ways to work</a>
              <a href="#questions">FAQs</a>
              <Link href="/signup">Join the network</Link>
            </div>
          </nav>
        </div>
        <FooterWordmark />
        <div className="footer-colophon">
          <span>© {new Date().getFullYear()} TALENTFOUND</span>
          <span>MADE FOR THE ONES WHO MAKE.</span>
          <a href="#main-content">BACK TO TOP ↑</a>
        </div>
      </footer>
    </div>
  );
}
