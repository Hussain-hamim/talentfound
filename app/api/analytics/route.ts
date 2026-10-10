import { createHmac, randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { adminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { validRequestOrigin } from "@/lib/supabase/config";
const schema = z.object({
  developerId: z.string().uuid(),
  kind: z.enum(["profile_view", "project_click"]),
  projectId: z.string().uuid().optional(),
});
export async function POST(request: NextRequest) {
  if (!validRequestOrigin(request.headers.get("origin")))
    return new NextResponse(null, { status: 403 });
  const secret = process.env.ANALYTICS_HASH_SECRET;
  if (!secret) return new NextResponse(null, { status: 503 });
  try {
    const body = await request.text();
    if (body.length > 1000) return new NextResponse(null, { status: 413 });
    const value = schema.parse(JSON.parse(body));
    const db = await createClient();
    const {
      data: { user },
    } = await db.auth.getUser();
    const stored = request.cookies.get("tf_visitor")?.value;
    const visitor = z.string().uuid().safeParse(stored);
    const browser = visitor.success ? visitor.data : randomUUID();
    const hash = (value: string) =>
      createHmac("sha256", secret).update(value).digest("hex");
    const ip =
      request.headers.get("x-vercel-forwarded-for") ||
      request.headers.get("x-forwarded-for")?.split(",")[0] ||
      "local";
    const { error } = await adminClient().rpc("record_profile_event", {
      developer: value.developerId,
      visitor: user?.id || "00000000-0000-0000-0000-000000000000",
      visitor_key: hash(user?.id || browser),
      rate_key: hash(ip.trim()),
      event_kind: value.kind,
      project: value.projectId,
    });
    if (error) {
      console.error("analytics_write_failed", { code: error.code });
      return new NextResponse(null, { status: 503 });
    }
    const response = new NextResponse(null, { status: 204 });
    if (!visitor.success)
      response.cookies.set("tf_visitor", browser, {
        httpOnly: true,
        sameSite: "lax",
        secure: request.nextUrl.protocol === "https:",
        path: "/",
        maxAge: 90 * 86400,
      });
    return response;
  } catch {
    return new NextResponse(null, { status: 400 });
  }
}
