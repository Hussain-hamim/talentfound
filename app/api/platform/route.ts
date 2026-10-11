import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/platform/session";
import { workspaceData } from "@/lib/platform/data";
import { validRequestOrigin } from "@/lib/supabase/config";
import {
  onboardingSchema,
  profileSchema,
  projectSchema,
  opportunitySchema,
  messageSchema,
  candidateSchema,
  reviewSchema,
  id,
  filterSchema,
} from "@/lib/platform/validation";
const envelope = z.object({ action: z.string(), input: z.unknown() });
function fail(error: unknown, status = 400) {
  return NextResponse.json(
    {
      error:
        error instanceof z.ZodError
          ? error.issues.map((x) => x.message).join(". ")
          : error instanceof Error
            ? error.message
            : "The request could not be completed.",
    },
    { status },
  );
}
function check<T>(result: { data: T; error: { message: string } | null }): T {
  if (result.error) throw new Error(result.error.message);
  return result.data;
}
export async function GET(request: NextRequest) {
  try {
    const s = await getSession();
    if (!s.user) return fail(new Error("Please log in."), 401);
    if (!s.developer && !s.recruiter)
      return fail(new Error("Please complete onboarding."), 403);
    const view = request.nextUrl.searchParams.get("view");
    if (view === "workspace")
      return NextResponse.json({ data: await workspaceData() });
    if (view === "analytics") {
      const days = request.nextUrl.searchParams.get("days") === "7" ? 7 : 30;
      return NextResponse.json({
        data: check(await s.db.rpc("profile_analytics", { days })),
      });
    }
    if (view === "messages") {
      const cid = id.parse(request.nextUrl.searchParams.get("conversation"));
      let query = s.db
        .from("messages")
        .select("*")
        .eq("conversation_id", cid)
        .order("created_at", { ascending: false })
        .order("id", { ascending: false })
        .limit(40);
      const before = request.nextUrl.searchParams.get("before");
      const beforeId = request.nextUrl.searchParams.get("beforeId");
      if (before && beforeId) {
        z.iso.datetime({ offset: true }).parse(before);
        id.parse(beforeId);
        query = query.or(
          `created_at.lt.${before},and(created_at.eq.${before},id.lt.${beforeId})`,
        );
      }
      return NextResponse.json({ data: check(await query) });
    }
    return fail(new Error("Unknown view"), 404);
  } catch (e) {
    return fail(e);
  }
}
export async function POST(request: NextRequest) {
  try {
    if (!validRequestOrigin(request.headers.get("origin")))
      return fail(new Error("Invalid request origin."), 403);
    if (Number(request.headers.get("content-length") || 0) > 60000)
      return fail(new Error("Request too large"), 413);
    const raw = await request.text();
    if (raw.length > 60000) return fail(new Error("Request too large"), 413);
    const { action, input } = envelope.parse(JSON.parse(raw));
    const s = await getSession();
    const uid = s.user?.id;
    if (!uid || !s.user) return fail(new Error("Please log in."), 401);
    if (action === "onboard")
      return NextResponse.json({
        data: check(
          await s.db.rpc("complete_onboarding", {
            payload: onboardingSchema.parse(input),
          }),
        ),
      });
    // Reviews are available to any signed-in member; onboarding establishes their public identity.
    if (!s.member || (!s.developer && !s.recruiter))
      return fail(new Error("Please complete onboarding."), 403);
    let result: unknown = null;
    switch (action) {
      case "profile": {
        const { name, ...profile } = profileSchema.parse(input);
        if (!s.developer)
          throw new Error("Enable your developer workspace first.");
        check(await s.db.from("members").update({ name }).eq("id", uid));
        result = check(
          await s.db
            .from("developer_profiles")
            .update(profile)
            .eq("id", uid)
            .select()
            .single(),
        );
        break;
      }
      case "recruiter": {
        const value = z
          .object({
            name: z.string().trim().min(1).max(100),
            company: z.string().trim().min(1).max(120),
            intent: z.enum(["Hiring", "Co-founder", "Collaboration"]),
            bio: z.string().max(3000),
          })
          .parse(input);
        const { name, ...profile } = value;
        check(await s.db.from("members").update({ name }).eq("id", uid));
        result = check(
          await s.db
            .from("recruiter_profiles")
            .update(profile)
            .eq("id", uid)
            .select()
            .single(),
        );
        break;
      }
      case "settings": {
        const value = z
          .object({
            email_notifications: z.boolean(),
            identify_visits: z.boolean(),
          })
          .parse(input);
        result = check(await s.db.from("accounts").update(value).eq("id", uid));
        break;
      }
      case "workspace": {
        const { role } = z
          .object({ role: z.enum(["developer", "recruiter"]) })
          .parse(input);
        if (role === "developer" ? !s.developer : !s.recruiter)
          throw new Error("Complete onboarding for this workspace first.");
        result = check(
          await s.db
            .from("accounts")
            .update({ active_workspace: role })
            .eq("id", uid),
        );
        break;
      }
      case "project": {
        const project = projectSchema.parse(input);
        if (project.image_path && !project.image_path.startsWith(`${uid}/`))
          throw new Error("Choose an image you uploaded.");
        result = check(
          await s.db
            .from("portfolio_projects")
            .upsert({ ...project, owner_id: uid })
            .select()
            .single(),
        );
        break;
      }
      case "reorderProjects": {
        const value = z.object({ ids: z.array(id).max(500) }).parse(input);
        result = check(
          await s.db.rpc("reorder_projects", { project_ids: value.ids }),
        );
        break;
      }
      case "deleteProject": {
        const value = z.object({ id }).parse(input);
        const project = check(
          await s.db
            .from("portfolio_projects")
            .select("image_path")
            .eq("id", value.id)
            .eq("owner_id", uid)
            .maybeSingle(),
        );
        result = check(
          await s.db
            .from("portfolio_projects")
            .delete()
            .eq("id", value.id)
            .eq("owner_id", uid),
        );
        if (project?.image_path)
          await s.db.storage.from("project-media").remove([project.image_path]);
        break;
      }
      case "opportunity": {
        result = check(
          await s.db
            .from("opportunities")
            .upsert({ ...opportunitySchema.parse(input), owner_id: uid })
            .select()
            .single(),
        );
        break;
      }
      case "shortlist": {
        const value = z
          .object({
            id: id.optional(),
            name: z.string().trim().min(1).max(100),
          })
          .parse(input);
        result = check(
          await s.db
            .from("shortlists")
            .upsert({ ...value, owner_id: uid })
            .select()
            .single(),
        );
        break;
      }
      case "deleteShortlist": {
        const value = z.object({ id }).parse(input);
        result = check(
          await s.db
            .from("shortlists")
            .delete()
            .eq("id", value.id)
            .eq("owner_id", uid),
        );
        break;
      }
      case "savePerson": {
        const value = z.object({ developer_id: id }).parse(input);
        result = check(
          await s.db
            .from("candidates")
            .upsert(
              { ...value, owner_id: uid },
              { onConflict: "owner_id,developer_id", ignoreDuplicates: true },
            ),
        );
        break;
      }
      case "candidate": {
        result = check(
          await s.db
            .from("candidates")
            .upsert(
              { ...candidateSchema.parse(input), owner_id: uid },
              { onConflict: "owner_id,developer_id" },
            )
            .select()
            .single(),
        );
        break;
      }
      case "deleteCandidate": {
        const value = z.object({ id }).parse(input);
        result = check(
          await s.db
            .from("candidates")
            .delete()
            .eq("id", value.id)
            .eq("owner_id", uid),
        );
        break;
      }
      case "saveSearch": {
        const value = z
          .object({
            name: z.string().trim().min(1).max(100),
            filters: filterSchema,
          })
          .parse(input);
        result = check(
          await s.db
            .from("saved_searches")
            .insert({ ...value, owner_id: uid })
            .select()
            .single(),
        );
        break;
      }
      case "deleteSearch": {
        const value = z.object({ id }).parse(input);
        result = check(
          await s.db
            .from("saved_searches")
            .delete()
            .eq("id", value.id)
            .eq("owner_id", uid),
        );
        break;
      }
      case "message": {
        const value = messageSchema.parse(input);
        result = check(
          await s.db.rpc("send_message", {
            ...value,
            opportunity: value.opportunity || undefined,
          }),
        );
        break;
      }
      case "invitation": {
        const value = z
          .object({
            invitation: id,
            response: z.enum(["accepted", "declined", "withdrawn"]),
          })
          .parse(input);
        result = check(await s.db.rpc("respond_invitation", value));
        break;
      }
      case "read": {
        const value = z.object({ conversation: id }).parse(input);
        result = check(await s.db.rpc("mark_read", value));
        break;
      }
      case "block": {
        const value = z
          .object({ member: id, blocked: z.boolean() })
          .parse(input);
        if (value.member === uid) throw new Error("You cannot block yourself.");
        result = value.blocked
          ? check(
              await s.db
                .from("blocks")
                .upsert({ owner_id: uid, blocked_id: value.member }),
            )
          : check(
              await s.db
                .from("blocks")
                .delete()
                .eq("owner_id", uid)
                .eq("blocked_id", value.member),
            );
        break;
      }
      case "review": {
        const value = reviewSchema.parse(input);
        if (value.developer_id === uid)
          throw new Error("You cannot review yourself.");
        result = check(
          await s.db
            .from("reviews")
            .upsert(
              { ...value, reviewer_id: uid },
              { onConflict: "reviewer_id,developer_id" },
            )
            .select()
            .single(),
        );
        break;
      }
      case "deleteReview": {
        const value = z.object({ id }).parse(input);
        result = check(
          await s.db
            .from("reviews")
            .delete()
            .eq("id", value.id)
            .eq("reviewer_id", uid),
        );
        break;
      }
      case "reply": {
        const value = z
          .object({ review_id: id, body: z.string().trim().min(1).max(2000) })
          .parse(input);
        result = check(
          await s.db
            .from("review_replies")
            .upsert({ ...value, developer_id: uid })
            .select()
            .single(),
        );
        break;
      }
      case "report": {
        const value = z
          .object({
            target_type: z.enum(["member", "review", "message"]),
            target_id: id,
            reason: z.string().trim().min(10).max(2000),
          })
          .parse(input);
        result = check(
          await s.db.from("reports").insert({ ...value, reporter_id: uid }),
        );
        break;
      }
      case "avatar": {
        const value = z.object({ path: z.string().max(500) }).parse(input);
        if (!value.path.startsWith(`${uid}/`))
          throw new Error("Choose an image you uploaded.");
        result = check(
          await s.db
            .from("members")
            .update({ avatar_path: value.path })
            .eq("id", uid),
        );
        break;
      }
      default:
        return fail(new Error("Unknown action"), 404);
    }
    return NextResponse.json({ data: result });
  } catch (e) {
    return fail(e);
  }
}
