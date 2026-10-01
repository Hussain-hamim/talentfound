import Link from "next/link";
import { Instrument_Serif } from "next/font/google";
import localFont from "next/font/local";
import { Header } from "@/components/header";
import { HeroFilm } from "@/components/hero-film";

const display = Instrument_Serif({ weight: "400", subsets: ["latin"], variable: "--font-hero-display", display: "swap" });
const body = localFont({ src: "../public/fonts/inter-latin.woff2", weight: "400 500", style: "normal", variable: "--font-hero-body", display: "swap" });

export function DevMatchHero() {
  return (
    <section className={`devmatch-cinematic-hero ${display.variable} ${body.variable}`} aria-labelledby="hero-title">
      <HeroFilm />
      <Header />
      <div className="devmatch-hero-content">
        <h1 id="hero-title" className="devmatch-fade-rise">
          Good work. <em>Great company.</em>
        </h1>
        <p className="devmatch-fade-rise devmatch-rise-delay">
          A home for developers, their work, and whatever comes next.{" "}
          <br className="hero-desktop-break" />
          Find your people. Build something that matters.
        </p>
        <div className="devmatch-hero-actions devmatch-fade-rise devmatch-rise-delay-2">
          <Link className="devmatch-glass devmatch-hero-cta" href="/signup">
            Find your people
          </Link>
          <Link className="devmatch-glass devmatch-hero-cta button-outline" href="/signup?role=hiring">
            Hire talent
          </Link>
        </div>
      </div>
    </section>
  );
}
