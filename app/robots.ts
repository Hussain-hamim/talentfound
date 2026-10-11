import type { MetadataRoute } from "next";
import { canIndex, siteUrl } from "@/lib/seo/metadata";
export default function robots(): MetadataRoute.Robots {
  return {
    // Let crawlers read noindex on account and demo pages. Auth still protects private data.
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: canIndex() ? ["/api/", "/auth/"] : ["/"],
    },
    sitemap: `${siteUrl()}/sitemap.xml`,
    host: siteUrl(),
  };
}
