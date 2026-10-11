import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";

const ok = (result) => {
  assert.ifError(result.error);
  return result.data;
};

test(
  "avatar upload persists through the API and rejects missing or foreign objects",
  {
    skip: process.env.TALENTFOUND_DB_TESTS !== "1",
    timeout: 120000,
  },
  async () => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    assert.equal(new URL(url).hostname, "zgpqyctyxozsvbjayhaf.supabase.co");
    const app = process.env.TALENTFOUND_TEST_APP_URL || "http://127.0.0.1:3000";
    assert.ok(["localhost", "127.0.0.1"].includes(new URL(app).hostname));
    const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    const options = {
      auth: { persistSession: false, autoRefreshToken: false },
    };
    const admin = createClient(
      url,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      options,
    );
    const anonymous = createClient(url, key, options);
    const cookies = new Map();
    const db = createServerClient(url, key, {
      cookies: {
        getAll: () => Array.from(cookies, ([name, value]) => ({ name, value })),
        setAll: (values) =>
          values.forEach(({ name, value }) => cookies.set(name, value)),
      },
    });
    const save = (path, authenticated = true) =>
      fetch(`${app}/api/platform`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Origin: new URL(app).origin,
          ...(authenticated
            ? {
                Cookie: Array.from(
                  cookies,
                  ([name, value]) => `${name}=${encodeURIComponent(value)}`,
                ).join("; "),
              }
            : {}),
        },
        body: JSON.stringify({ action: "avatar", input: { path } }),
      });
    let uid, path;
    try {
      const email = `tf-avatar-api-${randomUUID()}@example.test`;
      const password = randomUUID() + "Aa!";
      uid = ok(
        await admin.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
        }),
      ).user.id;
      ok(await db.auth.signInWithPassword({ email, password }));
      ok(
        await db.rpc("complete_onboarding", {
          payload: {
            role: "developer",
            name: "Avatar API Test",
            headline: "Temporary test profile",
            location: "Test",
            timezone: "UTC",
            skills: ["Testing"],
          },
        }),
      );
      path = `${uid}/${randomUUID()}.png`;
      const png = Buffer.from(
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aB1sAAAAASUVORK5CYII=",
        "base64",
      );
      ok(
        await db.storage
          .from("avatars")
          .upload(path, png, { contentType: "image/png" }),
      );
      const saved = await save(path);
      assert.equal(saved.status, 200, await saved.clone().text());
      assert.deepEqual((await saved.json()).data, { avatar_path: path });
      const persisted = () =>
        anonymous.from("members").select("avatar_path").eq("id", uid).single();
      assert.equal(ok(await persisted()).avatar_path, path);
      assert.equal(
        (
          await fetch(
            anonymous.storage.from("avatars").getPublicUrl(path).data.publicUrl,
          )
        ).status,
        200,
      );
      assert.equal((await save(`${uid}/missing.png`)).status, 400);
      assert.equal((await save(`${randomUUID()}/foreign.png`)).status, 400);
      assert.equal((await save(path, false)).status, 401);
      assert.equal(
        ok(await persisted()).avatar_path,
        path,
        "Rejected saves must preserve the existing avatar",
      );
    } finally {
      await db.auth.signOut();
      if (path) ok(await admin.storage.from("avatars").remove([path]));
      if (uid) ok(await admin.auth.admin.deleteUser(uid));
    }
  },
);
