import { publicMetadata, siteUrl, siteDescription } from "@/lib/seo/metadata";
import { StructuredData } from "@/components/seo/structured-data";
import Link from "next/link";
import { Arrow, Brand } from "@/components/brand";
import { HomePeople } from "@/components/platform/home-people";
import { DevMatchHero } from "@/components/devmatch-hero";
import { FooterWordmark } from "@/components/footer-wordmark";
import { ScrollReveal } from "@/components/scroll-reveal";
import { ConnectionPlayground } from "@/components/landing-experience";
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
import "./developer-profiles.css";
import "./hiring.css";
import "./landing-layout.css";

export const metadata = publicMetadata({
  title: "Discover Developers & Showcase Your Work",
  description: siteDescription,
  path: "/",
});

export default function Home() {
  return (
    <div className="landing-v2">
      <StructuredData
        data={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "Organization",
              "@id": `${siteUrl()}/#organization`,
              name: "TalentFound",
              url: siteUrl(),
              logo: `${siteUrl()}/icon.svg`,
            },
            {
              "@type": "WebSite",
              "@id": `${siteUrl()}/#website`,
              name: "TalentFound",
              url: siteUrl(),
              description: siteDescription,
              publisher: { "@id": `${siteUrl()}/#organization` },
            },
          ],
        }}
      />
      <ScrollReveal />
      <main id="main-content">
        <DevMatchHero />
        <HomePeople />

        <section
          className="people-section people-section-redesign"
          id="for-founders"
          aria-labelledby="match-title"
        >
          <ConnectionPlayground />
        </section>

        <OpportunityChapter />
        <CofounderChapter />
        <QuestionsChapter />

        <section
          className="closing-section"
          aria-labelledby="closing-title"
          data-reveal
        >
          <h2 id="closing-title">
            Let’s make
            <br />
            <span>something click.</span>
          </h2>
          <p className="closing-description">
            Bring your work. Find your people.
            <br />
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
              A home for independent minds to share their work, find their
              people, and build what comes next.
            </p>
            <Link className="brand-button footer-invitation" href="/signup">
              Find your people <Arrow diagonal />
            </Link>
          </div>
          <nav className="footer-navigation" aria-label="Footer">
            <div className="footer-link-group">
              <h2>For talent</h2>
              <Link href="/signup?role=developer">Create your profile</Link>
              <Link href="/signup?role=developer">Show your work</Link>
              <a href="#possibilities">Explore opportunities</a>
              <Link href="/login">Log in</Link>
            </div>
            <div className="footer-link-group">
              <h2>For teams</h2>
              <Link href="/developers">Hire developers</Link>
              <a href="#developers">Meet the builders</a>
              <Link href="/developers?engagement=Co-founder">
                Find a co-founder
              </Link>
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
