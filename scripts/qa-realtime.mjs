import { readFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import assert from "node:assert/strict";
import { createClient } from "@supabase/supabase-js";
const fixtures = JSON.parse(
  await readFile("/private/tmp/talentfound-browser-qa.json", "utf8"),
);
const config = { auth: { persistSession: false, autoRefreshToken: false } };
const clients = fixtures.map(() =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    config,
  ),
);
for (let i = 0; i < clients.length; i++) {
  const { error } = await clients[i].auth.signInWithPassword(fixtures[i]);
  assert.ifError(error);
}
const [sender, receiver] = clients;
const id = randomUUID();
let channel;
try {
  let received;
  const delivered = new Promise((resolve) => (received = resolve));
  await new Promise((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new Error("Realtime subscription timed out")),
      20000,
    );
    channel = receiver
      .channel("qa:" + id)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        (payload) => {
          if (payload.new.id === id) received(payload.new);
        },
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          clearTimeout(timer);
          resolve();
        } else if (status === "CHANNEL_ERROR") {
          clearTimeout(timer);
          reject(new Error("Realtime channel failed"));
        }
      });
  });
  const { data: cid, error } = await sender.rpc("send_message", {
    recipient: fixtures[1].id,
    body: "QA live delivery: this message arrived through Supabase Realtime.",
    client_id: id,
  });
  assert.ifError(error);
  let timer;
  const message = await Promise.race([
    delivered,
    new Promise((_, reject) => {
      timer = setTimeout(
        () => reject(new Error("Realtime message timed out")),
        20000,
      );
    }),
  ]);
  clearTimeout(timer);
  assert.equal(message.conversation_id, cid);
  assert.equal(message.sender_id, fixtures[0].id);
  await receiver.removeChannel(channel);
  channel = null;
  const missedId = randomUUID();
  assert.ifError(
    (
      await sender.rpc("send_message", {
        recipient: fixtures[1].id,
        body: "QA reconnect recovery: a message sent while the subscription was closed.",
        client_id: missedId,
      })
    ).error,
  );
  const rows = await receiver
    .from("messages")
    .select("id")
    .eq("conversation_id", cid);
  assert.ifError(rows.error);
  assert.ok(rows.data.some((m) => m.id === missedId));
  console.log(
    "PASS: authenticated realtime delivery and missed-message database reconciliation.",
  );
} finally {
  if (channel) await receiver.removeChannel(channel);
  for (const db of clients) await db.auth.signOut({ scope: "local" });
}
