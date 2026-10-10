import { createClient } from "npm:@supabase/supabase-js@2.117.2";
import { renderNotification } from "./template.ts";
Deno.serve(async (request: Request) => {
  const cronSecret = Deno.env.get("NOTIFICATIONS_CRON_SECRET");
  if (!cronSecret || request.headers.get("x-cron-secret") !== cronSecret)
    return new Response("Unauthorized", { status: 401 });
  const apiKey = Deno.env.get("RESEND_API_KEY");
  const from = Deno.env.get("NOTIFICATION_FROM");
  const origin = Deno.env.get("APP_URL");
  if (!apiKey || !from || !origin || !origin.startsWith("https://"))
    return new Response("Email delivery is not configured", { status: 503 });
  const db = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { persistSession: false } },
  );
  const { data: jobs, error } = await db.rpc("claim_notification_batches");
  if (error) {
    console.error("notification_claim_failed", { code: error.code });
    return new Response("Queue unavailable", { status: 503 });
  }
  let sent = 0;
  let skipped = 0;
  let failed = 0;
  for (const job of jobs || []) {
    const { data: allowed, error: checkError } = await db.rpc(
      "notification_batch_allowed",
      { batch: job.id },
    );
    if (checkError) {
      failed++;
      continue;
    }
    if (!allowed) {
      skipped++;
      continue;
    }
    try {
      const content = renderNotification(job.payload, origin);
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "Idempotency-Key": `talentfound/${job.id}`,
        },
        body: JSON.stringify({ from, to: [job.payload.to], ...content }),
        signal: AbortSignal.timeout(15000),
      });
      if (!response.ok)
        throw new Error(`Email provider returned ${response.status}`);
      const { error: finishError } = await db.rpc("finish_notification_batch", {
        batch: job.id,
        success: true,
      });
      if (finishError) throw new Error("Delivery acknowledgement unavailable");
      sent++;
    } catch (e) {
      failed++;
      await db.rpc("finish_notification_batch", {
        batch: job.id,
        success: false,
        failure: e instanceof Error ? e.message : "Delivery failed",
      });
    }
  }
  return Response.json({ sent, skipped, failed });
});
