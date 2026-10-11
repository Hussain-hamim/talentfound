import type { MetadataRoute } from "next";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import { supabaseConfig } from "@/lib/supabase/config";
import { siteUrl } from "@/lib/seo/metadata";
import { isDemoProfile } from "@/lib/platform/demo-profiles";
export const revalidate = 3600;
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { url, key } = supabaseConfig();
  // Always anonymous: a crawler must never receive session-specific profile visibility.
  const db = createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const entries: MetadataRoute.Sitemap = [
    { url: siteUrl(), changeFrequency: "weekly", priority: 1 },
    { url: `${siteUrl()}/developers`, changeFrequency: "daily", priority: 0.9 },
  ];
  const pageSize = 1000;
  for (let offset = 0; ; offset += pageSize) {
    const { data, error } = await db
      .from("developer_profiles")
      .select("handle")
      .eq("published", true)
      .order("id")
      .range(offset, offset + pageSize - 1);
    if (error) throw error;
    for (const profile of data || []) {
      if (!isDemoProfile(profile.handle))
        entries.push({
          url: `${siteUrl()}/developers/${encodeURIComponent(profile.handle)}`,
          changeFrequency: "weekly",
          priority: 0.8,
        });
    }
    if (!data || data.length < pageSize) break;
  }
  // No lastModified until the schema tracks actual profile edits; creation is not modification.
  return entries;
}
