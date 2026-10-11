import type { Metadata } from "next";

export const siteName = "TalentFound";
export const siteDescription =
  "Discover developers through their work. Explore portfolios, find freelance and full-time talent, and connect with your next team or co-founder on TalentFound.";

export function siteUrl() {
  const configured = process.env.NEXT_PUBLIC_APP_URL;
  return new URL(configured || "https://talent-found-os.vercel.app").origin;
}

export function canIndex() {
  const host = new URL(siteUrl()).hostname;
  return (
    process.env.VERCEL_ENV !== "preview" &&
    process.env.VERCEL_ENV !== "development" &&
    host !== "localhost" &&
    host !== "127.0.0.1"
  );
}

export function publicMetadata({
  title,
  description,
  path,
  image = "/share-image",
  index = true,
}: {
  title: string;
  description: string;
  path: string;
  image?: string;
  index?: boolean;
}): Metadata {
  const url = new URL(path, siteUrl()).href;
  const images = [
    {
      url: new URL(image, siteUrl()).href,
      width: 1200,
      height: 630,
      alt: `${title} | ${siteName}`,
    },
  ];
  return {
    title,
    description,
    alternates: { canonical: url },
    robots: {
      index: canIndex() && index,
      follow: true,
      googleBot: {
        index: canIndex() && index,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
    openGraph: {
      type: "website",
      locale: "en_US",
      siteName,
      url,
      title: `${title} | ${siteName}`,
      description,
      images,
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | ${siteName}`,
      description,
      images,
    },
  };
}

export function jsonLd(value: unknown) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}
