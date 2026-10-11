import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
const enabled = process.env.TALENTFOUND_DB_TESTS === "1";
const options = { auth: { persistSession: false, autoRefreshToken: false } };
const ok = (r) => {
  assert.ifError(r.error);
  return r.data;
};
const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
async function eventually(check, label) {
  const end = Date.now() + 20000;
  while (Date.now() < end) {
    if (await check()) return;
    await pause(150);
  }
  throw new Error(label);
}
test(
  "live discovery, private workspace signals, notifications, and reconnect recovery",
  { skip: !enabled, timeout: 180000 },
  async () => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL,
      key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    assert.equal(new URL(url).hostname, "zgpqyctyxozsvbjayhaf.supabase.co");
    const admin = createClient(
      url,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      options,
    );
    const guest = createClient(url, key, options);
    const users = [];
    const channels = [];
    async function user(label) {
      const email = `tf-live-${randomUUID()}@example.test`,
        password = randomUUID() + "Aa!";
      const u = ok(
        await admin.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
        }),
      ).user;
      const db = createClient(url, key, options);
      users.push({ id: u.id, db });
      ok(await db.auth.signInWithPassword({ email, password }));
      ok(
        await db.rpc("complete_onboarding", {
          payload: {
            role: "developer",
            name: `Temporary live QA ${label}`,
            headline: "QA only",
            location: "Test",
            timezone: "UTC",
            skills: ["TypeScript"],
          },
        }),
      );
      ok(
        await db
          .from("accounts")
          .update({ email_notifications: false })
          .eq("id", u.id),
      );
      return { id: u.id, db };
    }
    async function subscribe(db, name, table, filter, receive) {
      const c = db
        .channel("qa:" + randomUUID())
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table,
            ...(filter ? { filter } : {}),
          },
          receive,
        );
      channels.push([db, c]);
      await new Promise((resolve, reject) => {
        const timeout = setTimeout(
          () => reject(new Error(name + " subscription timeout")),
          20000,
        );
        c.subscribe((status) => {
          if (status === "SUBSCRIBED") {
            clearTimeout(timeout);
            resolve();
          } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
            clearTimeout(timeout);
            reject(new Error(name + " channel failed"));
          }
        });
      });
      return c;
    }
    try {
      const a = await user("sender"),
        b = await user("recipient"),
        c = await user("unrelated");
      let publicChanges = 0,
        privateChanges = 0;
      const notifications = [],
        leaks = [];
      await Promise.all([
        subscribe(
          guest,
          "public discovery",
          "realtime_signals",
          "scope=eq.discovery",
          () => publicChanges++,
        ),
        subscribe(
          b.db,
          "private workspace",
          "realtime_signals",
          `owner_id=eq.${b.id}`,
          () => privateChanges++,
        ),
        subscribe(b.db, "notification inbox", "notifications", null, (p) =>
          notifications.push(p),
        ),
        subscribe(c.db, "unrelated", "notifications", null, (p) =>
          leaks.push(p),
        ),
      ]);
      const baseline = publicChanges;
      const project = ok(
        await a.db
          .from("portfolio_projects")
          .insert({
            owner_id: a.id,
            title: "Realtime QA portfolio",
            published: true,
          })
          .select()
          .single(),
      );
      await eventually(
        () => publicChanges > baseline,
        "Published project not delivered to anonymous subscriber",
      );
      const beforeDelete = publicChanges;
      ok(await a.db.from("portfolio_projects").delete().eq("id", project.id));
      await eventually(
        () => publicChanges > beforeDelete,
        "Project deletion not delivered",
      );
      const mid = randomUUID();
      const cid = ok(
        await a.db.rpc("send_message", {
          recipient: b.id,
          body: "Temporary realtime QA message",
          client_id: mid,
        }),
      );
      await eventually(
        () => notifications.some((p) => p.new.source_key === "message:" + mid),
        "Notification not delivered live",
      );
      await eventually(
        () => privateChanges > 0,
        "Workspace invalidation not delivered",
      );
      ok(
        await a.db.rpc("send_message", {
          recipient: b.id,
          body: "Temporary realtime QA message",
          client_id: mid,
        }),
      );
      assert.equal(
        ok(
          await b.db
            .from("notifications")
            .select("*")
            .eq("source_key", "message:" + mid),
        ).length,
        1,
      );
      assert.equal(
        ok(
          await c.db
            .from("notifications")
            .select("*")
            .eq("conversation_id", cid),
        ).length,
        0,
      );
      assert.equal(leaks.length, 0);
      ok(await b.db.rpc("mark_read", { conversation: cid }));
      await eventually(
        () =>
          notifications.some(
            (p) =>
              p.eventType === "UPDATE" &&
              p.new.source_key === "message:" + mid &&
              p.new.read_at,
          ),
        "Read state did not update live",
      );
      for (const [db, ch] of channels.splice(0)) await db.removeChannel(ch);
      const missed = randomUUID();
      ok(
        await a.db.rpc("send_message", {
          recipient: b.id,
          body: "Sent while receiver disconnected",
          client_id: missed,
        }),
      );
      // Subscription recovery must reload persisted rows, not rely on missed websocket events.
      const inbox = ok(
        await b.db.from("notifications").select("*").is("read_at", null),
      );
      assert.ok(inbox.some((n) => n.source_key === "message:" + missed));
      assert.equal(
        ok(await guest.from("realtime_signals").select("*")).filter(
          (s) => s.owner_id,
        ).length,
        0,
      );
      console.log(
        "PASS: public insert/delete, recipient-only realtime, retry deduplication, read propagation, missed-event recovery.",
      );
    } finally {
      for (const [db, ch] of channels) await db.removeChannel(ch);
      for (const u of users) {
        await u.db.auth.signOut({ scope: "local" });
        ok(await admin.auth.admin.deleteUser(u.id));
      }
      for (const db of [guest, admin, ...users.map(u => u.db)]) {
        await db.realtime.disconnect();
        await db.auth.dispose();
      }
    }
  },
);
