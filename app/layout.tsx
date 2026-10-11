import type { Metadata } from "next";
import { siteUrl, siteDescription, canIndex } from "@/lib/seo/metadata";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "./buttons.css";
import "./brand.css";
import { LiveUpdates } from "@/components/platform/live-updates";
const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  applicationName: "TalentFound",
  robots: { index: canIndex(), follow: true },
  title: {
    default: "TalentFound — Discover Developers & Showcase Your Work",
    template: "%s | TalentFound",
  },
  description: siteDescription,
  icons: { icon: "/icon.svg" },
};
export default function RootLayout({
  children,
  modal,
}: {
  children: React.ReactNode;
  modal: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${geistSans.variable} ${geistMono.variable}`}
    >
      <body>
        <a className="skip-link" href="#main-content">
          Skip to content
        </a>
        <LiveUpdates>
          {children}
          {modal}
        </LiveUpdates>
      </body>
    </html>
  );
}
