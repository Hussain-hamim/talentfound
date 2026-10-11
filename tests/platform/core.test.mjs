import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import {
  parseDraft,
  onboardingSchema,
  messageSchema,
  reviewSchema,
  filterSchema,
} from "../../lib/platform/validation.ts";
import { safeNext } from "../../lib/supabase/config.ts";
import { squareCrop } from "../../lib/platform/image-crop.ts";
import { renderNotification } from "../../supabase/functions/talentfound-notifications/template.ts";
test("profile crops start centered for landscape and portrait photos", () => {
  assert.deepEqual(squareCrop(1200, 800, 1, { x: 0.5, y: 0.5 }), {
    x: 200,
    y: 0,
    size: 800,
  });
  assert.deepEqual(squareCrop(800, 1200, 1, { x: 0.5, y: 0.5 }), {
    x: 0,
    y: 200,
    size: 800,
  });
});
test("zoomed profile crops can reach each edge without empty space", () => {
  assert.deepEqual(squareCrop(1200, 800, 2, { x: 0.75, y: 0.25 }), {
    x: 700,
    y: 0,
    size: 400,
  });
  assert.deepEqual(squareCrop(1200, 800, 2, { x: -1, y: -1 }), {
    x: 0,
    y: 0,
    size: 400,
  });
  assert.deepEqual(squareCrop(1200, 800, 2, { x: 2, y: 2 }), {
    x: 800,
    y: 400,
    size: 400,
  });
  assert.deepEqual(squareCrop(800, 1200, 4, { x: 1, y: 1 }), {
    x: 600,
    y: 1000,
    size: 200,
  });
});
test("zooming out clamps a previous crop to the photo boundaries", () => {
  assert.deepEqual(squareCrop(1000, 1000, 1, { x: 0.9, y: 0.1 }), {
    x: 0,
    y: 0,
    size: 1000,
  });
  assert.deepEqual(squareCrop(160, 80, 0.5, { x: 1, y: 0 }), {
    x: 80,
    y: 0,
    size: 80,
  });
});
test("return paths reject external and backslash redirects", () => {
  for (const path of [
    "https://evil.example",
    "//evil.example",
    "/\\evil.example",
    "/\n/evil",
    "/login?next=/login",
    "/auth/callback",
    "/verify-email?next=/verify-email",
  ])
    assert.equal(safeNext(path), "/dashboard");
  assert.equal(
    safeNext("/developers/alex/message?draft=1"),
    "/developers/alex/message?draft=1",
  );
});
test("guest drafts expire after 24 hours and reject malformed recipients", () => {
  const now = Date.now();
  const draft = {
    version: 1,
    recipient: randomUUID(),
    handle: "qa-builder",
    body: "An introduction",
    createdAt: now,
  };
  assert.equal(parseDraft(JSON.stringify(draft), now).body, draft.body);
  assert.equal(parseDraft(JSON.stringify(draft), now + 86400001), null);
  assert.equal(
    parseDraft(JSON.stringify({ ...draft, recipient: "evil" }), now),
    null,
  );
  assert.equal(parseDraft("not json"), null);
  assert.equal(
    parseDraft(JSON.stringify({ ...draft, createdAt: now + 1 }), now),
    null,
  );
});
test("onboarding is minimal but validates each role", () => {
  assert.ok(
    onboardingSchema.safeParse({
      role: "developer",
      name: "QA",
      headline: "Builder",
      location: "London",
      timezone: "Europe/London",
      skills: ["React"],
    }).success,
  );
  assert.ok(
    !onboardingSchema.safeParse({ role: "developer", name: "QA", skills: [] })
      .success,
  );
  assert.ok(
    onboardingSchema.safeParse({
      role: "recruiter",
      name: "QA",
      company: "Independent recruiter",
      intent: "Hiring",
    }).success,
  );
});
test("message and review boundaries reject invalid inputs", () => {
  assert.ok(
    !messageSchema.safeParse({
      recipient: randomUUID(),
      client_id: randomUUID(),
      body: " ".repeat(5),
    }).success,
  );
  assert.ok(
    !messageSchema.safeParse({
      recipient: randomUUID(),
      client_id: randomUUID(),
      body: "x".repeat(4001),
    }).success,
  );
  assert.ok(
    !reviewSchema.safeParse({
      developer_id: randomUUID(),
      rating: 6,
      body: "Community perspective",
    }).success,
  );
  assert.ok(!filterSchema.safeParse({ page: -1 }).success);
});
test("notification templates escape untrusted content and link to protected conversations", () => {
  const result = renderNotification(
    {
      conversation: "123",
      messages: [
        {
          sender: "<script>bad</script>",
          body: "Hello <img src=x onerror=alert(1)> & welcome",
          brief: { title: "A <project>", description: "Build together" },
        },
      ],
    },
    "https://talentfound.example",
  );
  assert.ok(!result.html.includes("<script>"));
  assert.ok(result.html.includes("&lt;img"));
  assert.ok(
    result.html.includes("https://talentfound.example/dashboard/messages/123"),
  );
  assert.ok(result.text.includes("Hello <img"));
  assert.ok(result.text.includes("Build together"));
});

import { loadMessageWindow } from "../../lib/platform/message-window.ts";
test("reconnect recovers gaps larger than one page and keeps cursor ties", async () => {
  const rows = Array.from({ length: 125 }, (_, i) => ({
    id: String(125 - i).padStart(4, "0"),
    created_at: "2026-10-02T12:00:00+00:00",
  }));
  let calls = 0;
  const fetchPage = async (before) => {
    calls++;
    return rows.filter((row) => !before || row.id < before.id).slice(0, 40);
  };
  const recovered = await loadMessageWindow(fetchPage, rows[95]);
  assert.equal(calls, 3);
  assert.equal(recovered.length, 120);
  for (const row of rows.slice(0, 96))
    assert.ok(recovered.some((item) => item.id === row.id));
  calls = 0;
  assert.equal((await loadMessageWindow(fetchPage, null)).length, 40);
  assert.equal(calls, 1);
});
