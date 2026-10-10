import "server-only";
import { createClient } from "@/lib/supabase/server";
import { adminClient } from "@/lib/supabase/admin";
import { requireMember } from "./session";
import type { Developer, WorkspaceData } from "./types";
import { filterSchema } from "./validation";
import { supabaseConfig } from "@/lib/supabase/config";
export function avatarUrl(path: string | null) {
  return path
    ? `${supabaseConfig().url}/storage/v1/object/public/avatars/${path}`
    : null;
}
export async function searchDevelopers(
  params: Record<string, string | string[] | undefined>,
) {
  const filters = filterSchema.parse(params);
  const db = await createClient();
  const { data, error } = await db.rpc("search_developers", { filters });
  if (error) throw error;
  const result = data as unknown as { total: number; people: Developer[] };
  // Only aggregate counts for profiles already visible to this visitor.
  // Raw analytics and visitor identities stay private on the server.
  const viewCounts = new Map<string, number>();
  if (result.people.length) {
    const { data: counts, error: countError } = await adminClient()
      .from("developer_profiles")
      .select("id, analytics_events(count)")
      .in(
        "id",
        result.people.map((person) => person.id),
      )
      .eq("published", true)
      .eq("analytics_events.kind", "profile_view")
      .gte(
        "analytics_events.created_at",
        new Date(Date.now() - 90 * 86400000).toISOString(),
      );
    if (countError) {
      console.error("Could not load profile view counts", countError.code);
    } else {
      for (const profile of counts || []) {
        viewCounts.set(profile.id, profile.analytics_events[0]?.count ?? 0);
      }
    }
  }
  const paths = result.people.flatMap((p) =>
    p.projects.flatMap((project) =>
      project.image_path ? [project.image_path] : [],
    ),
  );
  const covers = paths.length
    ? await db.storage.from("project-media").createSignedUrls(paths, 3600)
    : null;
  const coverUrls = new Map(
    (covers?.data || []).map((image) => [image.path, image.signedUrl]),
  );
  return {
    ...result,
    people: result.people.map((p) => ({
      ...p,
      viewCount: viewCounts.get(p.id) ?? null,
      avatarUrl: avatarUrl(p.member.avatar_path),
      coverUrl: coverUrls.get(p.projects[0]?.image_path || "") || null,
      projects: p.projects.map((project) => ({
        ...project,
        imageUrl: coverUrls.get(project.image_path || "") || null,
      })),
    })),
    filters,
  };
}
export async function getDeveloper(handle: string) {
  const db = await createClient();
  const { data: profile, error } = await db
    .from("developer_profiles")
    .select("*")
    .eq("handle", handle)
    .eq("published", true)
    .maybeSingle();
  if (error) throw error;
  if (!profile) return null;
  const [member, projects, reviews] = await Promise.all([
    db.from("members").select("*").eq("id", profile.id).single(),
    db
      .from("portfolio_projects")
      .select("*")
      .eq("owner_id", profile.id)
      .eq("published", true)
      .order("position"),
    db
      .from("reviews")
      .select(
        "*, reviewer:members!reviews_reviewer_id_fkey(*), reply:review_replies(*)",
      )
      .eq("developer_id", profile.id)
      .order("created_at", { ascending: false }),
  ]);
  for (const r of [member, projects, reviews]) if (r.error) throw r.error;
  return {
    profile,
    member: member.data!,
    projects: projects.data || [],
    reviews: reviews.data || [],
    avatarUrl: avatarUrl(member.data!.avatar_path),
  };
}
export async function mediaUrl(path: string | null) {
  if (!path) return null;
  const db = await createClient();
  const { data } = await db.storage
    .from("project-media")
    .createSignedUrl(path, 3600);
  return data?.signedUrl || null;
}
export async function workspaceData(): Promise<WorkspaceData> {
  const s = await requireMember();
  const { data, error } = await s.db.rpc("workspace_snapshot");
  if (error) throw error;
  return {
    ...(data as unknown as Omit<
      WorkspaceData,
      "member" | "account" | "developer" | "recruiter"
    >),
    member: s.member,
    account: s.account!,
    developer: s.developer,
    recruiter: s.recruiter,
  };
}
