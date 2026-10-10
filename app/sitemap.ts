import type { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";
import { appUrl } from "@/lib/supabase/config";
import { isDemoProfile } from "@/lib/platform/demo-profiles";
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const db = await createClient();
  const { data, error } = await db
    .from("developer_profiles")
    .select("handle,created_at")
    .eq("published", true);
  if (error) throw error;
  return [
    { url: appUrl(), changeFrequency: "weekly", priority: 1 },
    { url: `${appUrl()}/developers`, changeFrequency: "daily", priority: 0.9 },
    ...(data || [])
      .filter((p) => !isDemoProfile(p.handle))
      .map((p) => ({
        url: `${appUrl()}/developers/${p.handle}`,
        lastModified: p.created_at,
        changeFrequency: "weekly" as const,
        priority: 0.8,
      })),
  ];
}
