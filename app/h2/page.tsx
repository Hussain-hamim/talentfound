import type { Metadata } from "next";
import { Almarai, Instrument_Serif } from "next/font/google";
import { PrismaHero } from "./prisma-hero";
import { PrismaSections } from "./prisma-sections";
import "./prisma.css";

const almarai = Almarai({
  weight: ["300", "400", "700", "800"],
  subsets: ["latin"],
  variable: "--font-prisma",
  display: "swap",
});

const instrumentSerif = Instrument_Serif({ weight: "400", style: "italic", subsets: ["latin"], variable: "--font-prisma-serif", display: "swap" });

export const metadata: Metadata = {
  title: "Prisma — Hero exploration",
  description: "A cinematic creative collective hero exploration.",
  robots: { index: false, follow: false },
};

export default function HeroTwoPage() {
  return <main id="main-content" className={`prisma-demo ${almarai.variable} ${instrumentSerif.variable}`}><PrismaHero /><PrismaSections /></main>;
}
