import type { MetadataRoute } from "next";
import { appUrl } from "@/lib/supabase/config";
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/developers"],
      disallow: [
        "/dashboard/",
        "/api/",
        "/auth/",
        "/onboarding",
        "/messages",
        "/login",
        "/signup",
      ],
    },
    sitemap: `${appUrl()}/sitemap.xml`,
  };
}
