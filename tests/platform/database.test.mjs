import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID, createHash } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
const enabled = process.env.TALENTFOUND_DB_TESTS === "1";
const options = { auth: { persistSession: false, autoRefreshToken: false } };
function ok(result) {
  assert.ifError(result.error);
  return result.data;
}
test(
  "TalentFound live permissions, messages, invitations, reviews, and analytics",
  { skip: !enabled, timeout: 180000 },
  async (t) => {
    assert.equal(new URL(url).hostname, "zgpqyctyxozsvbjayhaf.supabase.co");
    const admin = createClient(url, service, options);
    const anon = createClient(url, key, options);
    const accounts = [];
    async function user(label, role, verified = true) {
      const password = randomUUID() + "aA!";
      const email = `tf-qa-${randomUUID()}@example.test`;
      const u = ok(
        await admin.auth.admin.createUser({
          email,
          password,
          email_confirm: verified,
          user_metadata: { full_name: `TalentFound QA ${label}` },
        }),
      ).user;
      accounts.push(u.id);
      const db = createClient(url, key, options);
      if (verified) ok(await db.auth.signInWithPassword({ email, password }));
      if (verified)
        ok(
          await db.rpc("complete_onboarding", {
            payload:
              role === "developer"
                ? {
                    role,
                    name: `TalentFound QA ${label}`,
                    headline: "QA fixture — temporary",
                    location: "Test location",
                    timezone: "UTC",
                    skills: ["TypeScript"],
                  }
                : {
                    role,
                    name: `TalentFound QA ${label}`,
                    company: "QA fixture",
                    intent: "Hiring",
                  },
          }),
        );
      if (verified)
        ok(
          await db
            .from("accounts")
            .update({ email_notifications: false })
            .eq("id", u.id),
        );
      return { id: u.id, db, email, password };
    }
    try {
      const a = await user("Developer", "developer"),
        b = await user("Recruiter", "recruiter"),
        c = await user("Unrelated", "developer");
      await t.test(
        "public discovery has no private account fields",
        async () => {
          const profiles = ok(
            await anon.from("developer_profiles").select("*").eq("id", a.id),
          );
          assert.equal(profiles.length, 1);
          assert.ok(!("email" in profiles[0]));
          assert.ok((await anon.from("accounts").select("*")).error);
          assert.equal(
            ok(await b.db.from("accounts").select("*").eq("id", a.id)).length,
            0,
          );
        },
      );
      await t.test(
        "other users cannot edit profiles and private notes",
        async () => {
          assert.equal(
            ok(
              await b.db
                .from("developer_profiles")
                .update({ bio: "Not mine" })
                .eq("id", a.id)
                .select(),
            ).length,
            0,
          );
          ok(
            await b.db.from("candidates").insert({
              owner_id: b.id,
              developer_id: a.id,
              notes: "Private hiring note",
            }),
          );
          assert.equal(
            ok(await c.db.from("candidates").select("*").eq("owner_id", b.id))
              .length,
            0,
          );
        },
      );
      await t.test(
        "portfolio drafts and cross-owner media are protected",
        async () => {
          const p = ok(
            await a.db
              .from("portfolio_projects")
              .insert({
                owner_id: a.id,
                title: "Private QA draft",
                published: false,
                image_path: null,
              })
              .select()
              .single(),
          );
          assert.equal(
            ok(await anon.from("portfolio_projects").select("*").eq("id", p.id))
              .length,
            0,
          );
          assert.ok(
            (
              await a.db
                .from("portfolio_projects")
                .update({ image_path: `${b.id}/other.png` })
                .eq("id", p.id)
            ).error,
          );
          ok(
            await a.db
              .from("portfolio_projects")
              .update({ published: true })
              .eq("id", p.id),
          );
          assert.equal(
            ok(await anon.from("portfolio_projects").select("*").eq("id", p.id))
              .length,
            1,
          );
        },
      );
      let conversation;
      const messageId = randomUUID();
      await t.test(
        "messages authenticate, deduplicate, and isolate conversations",
        async () => {
          assert.ok(
            (
              await anon.rpc("send_message", {
                recipient: a.id,
                body: "Guest attempt",
                client_id: randomUUID(),
              })
            ).error,
          );
          conversation = ok(
            await b.db.rpc("send_message", {
              recipient: a.id,
              body: "A real QA test message",
              client_id: messageId,
            }),
          );
          assert.equal(
            ok(
              await b.db.rpc("send_message", {
                recipient: a.id,
                body: "A real QA test message",
                client_id: messageId,
              }),
            ),
            conversation,
          );
          assert.equal(
            ok(await a.db.from("messages").select("*").eq("id", messageId))
              .length,
            1,
          );
          assert.equal(
            ok(
              await c.db
                .from("messages")
                .select("*")
                .eq("conversation_id", conversation),
            ).length,
            0,
          );
          assert.ok((await c.db.rpc("mark_read", { conversation })).error);
          assert.ok(
            (
              await c.db.from("messages").insert({
                id: randomUUID(),
                conversation_id: conversation,
                sender_id: b.id,
                body: "spoof",
              })
            ).error,
          );
          const inbox = ok(await a.db.rpc("talentfound_inbox"));
          assert.equal(inbox.find((x) => x.id === conversation).unread, 1);
          ok(await a.db.rpc("mark_read", { conversation }));
          assert.equal(
            ok(await a.db.rpc("talentfound_inbox")).find(
              (x) => x.id === conversation,
            ).unread,
            0,
          );
        },
      );
      await t.test(
        "invitations snapshot the brief and authorize transitions",
        async () => {
          const opportunity = ok(
            await b.db
              .from("opportunities")
              .insert({
                owner_id: b.id,
                title: "Original brief",
                engagement: "Freelance",
                company: "QA",
                description:
                  "A sufficiently detailed temporary QA opportunity.",
              })
              .select()
              .single(),
          );
          ok(
            await b.db.rpc("send_message", {
              recipient: a.id,
              body: "Please join this QA opportunity.",
              client_id: randomUUID(),
              opportunity: opportunity.id,
            }),
          );
          const invitation = ok(
            await a.db
              .from("invitations")
              .select("*")
              .eq("opportunity_id", opportunity.id)
              .single(),
          );
          ok(
            await b.db
              .from("opportunities")
              .update({ title: "Changed brief" })
              .eq("id", opportunity.id),
          );
          assert.equal(
            ok(
              await a.db
                .from("invitations")
                .select("*")
                .eq("id", invitation.id)
                .single(),
            ).brief.title,
            "Original brief",
          );
          assert.ok(
            (
              await c.db.rpc("respond_invitation", {
                invitation: invitation.id,
                response: "accepted",
              })
            ).error,
          );
          ok(
            await a.db.rpc("respond_invitation", {
              invitation: invitation.id,
              response: "accepted",
            }),
          );
          assert.equal(
            ok(
              await b.db
                .from("candidates")
                .select("*")
                .eq("developer_id", a.id)
                .single(),
            ).stage,
            "shortlisted",
          );
          assert.ok(
            (
              await a.db.rpc("respond_invitation", {
                invitation: invitation.id,
                response: "declined",
              })
            ).error,
          );
        },
      );
      await t.test(
        "community reviews prevent self-review and permit one editable review",
        async () => {
          assert.ok(
            (
              await a.db.from("reviews").insert({
                reviewer_id: a.id,
                developer_id: a.id,
                rating: 5,
                body: "Self review should fail",
              })
            ).error,
          );
          const review = ok(
            await b.db
              .from("reviews")
              .upsert(
                {
                  reviewer_id: b.id,
                  developer_id: a.id,
                  rating: 4,
                  body: "An independent community perspective.",
                },
                { onConflict: "reviewer_id,developer_id" },
              )
              .select()
              .single(),
          );
          ok(
            await b.db.from("reviews").upsert(
              {
                reviewer_id: b.id,
                developer_id: a.id,
                rating: 5,
                body: "An updated community perspective.",
              },
              { onConflict: "reviewer_id,developer_id" },
            ),
          );
          assert.equal(
            ok(await anon.from("reviews").select("*").eq("reviewer_id", b.id))
              .length,
            1,
          );
          assert.ok(
            (
              await c.db.from("review_replies").insert({
                review_id: review.id,
                developer_id: c.id,
                body: "Not the owner",
              })
            ).error,
          );
          ok(
            await a.db.from("review_replies").insert({
              review_id: review.id,
              developer_id: a.id,
              body: "Thank you for sharing.",
            }),
          );
        },
      );
      await t.test("blocking prevents contact in both directions", async () => {
        ok(
          await a.db
            .from("blocks")
            .insert({ owner_id: a.id, blocked_id: b.id }),
        );
        assert.ok(
          (
            await b.db.rpc("send_message", {
              recipient: a.id,
              body: "Should be blocked",
              client_id: randomUUID(),
            })
          ).error,
        );
        assert.ok(
          (
            await a.db.rpc("send_message", {
              recipient: b.id,
              body: "Also blocked",
              client_id: randomUUID(),
            })
          ).error,
        );
        ok(
          await a.db
            .from("blocks")
            .delete()
            .eq("owner_id", a.id)
            .eq("blocked_id", b.id),
        );
      });
      await t.test(
        "analytics deduplicate, exclude self, and respect opt-out",
        async () => {
          const hash = (v) => createHash("sha256").update(v).digest("hex");
          ok(
            await b.db
              .from("accounts")
              .update({ identify_visits: true })
              .eq("id", b.id),
          );
          const event = {
            developer: a.id,
            visitor: b.id,
            visitor_key: hash(b.id),
            rate_key: hash("qa"),
            event_kind: "profile_view",
          };
          ok(await admin.rpc("record_profile_event", event));
          ok(await admin.rpc("record_profile_event", event));
          ok(
            await admin.rpc("record_profile_event", {
              ...event,
              visitor: a.id,
              visitor_key: hash(a.id),
            }),
          );
          let analytics = ok(await a.db.rpc("profile_analytics", { days: 7 }));
          assert.equal(analytics.views, 1);
          assert.equal(analytics.visitors.length, 1);
          assert.equal(
            ok(await c.db.rpc("profile_analytics", { days: 7 })).views,
            0,
          );
          assert.ok((await b.db.from("analytics_events").select("*")).error);
          ok(
            await b.db
              .from("accounts")
              .update({ identify_visits: false })
              .eq("id", b.id),
          );
          analytics = ok(await a.db.rpc("profile_analytics", { days: 7 }));
          assert.equal(analytics.visitors.length, 0);
          assert.equal(analytics.views, 1);
        },
      );
      await t.test(
        "second workspace preserves identity and conversation history",
        async () => {
          ok(
            await a.db.rpc("complete_onboarding", {
              payload: {
                role: "recruiter",
                name: "TalentFound QA Developer",
                company: "QA second workspace",
                intent: "Collaboration",
              },
            }),
          );
          assert.equal(
            ok(await a.db.from("accounts").select("*").eq("id", a.id).single())
              .active_workspace,
            "recruiter",
          );
          assert.equal(
            ok(await a.db.from("developer_profiles").select("*").eq("id", a.id))
              .length,
            1,
          );
          assert.equal(ok(await a.db.rpc("talentfound_inbox")).length, 1);
        },
      );
    } finally {
      for (const uid of accounts.reverse())
        ok(await admin.auth.admin.deleteUser(uid));
    }
  },
);
