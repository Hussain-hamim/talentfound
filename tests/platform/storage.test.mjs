import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
const ok = (r) => {
  assert.ifError(r.error);
  return r.data;
};
const options = { auth: { persistSession: false, autoRefreshToken: false } };
test(
  "private draft storage, published images, and owner deletion",
  { skip: process.env.TALENTFOUND_DB_TESTS !== "1", timeout: 120000 },
  async () => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    assert.equal(new URL(url).hostname, "zgpqyctyxozsvbjayhaf.supabase.co");
    const admin = createClient(
        url,
        process.env.SUPABASE_SERVICE_ROLE_KEY,
        options,
      ),
      db = createClient(
        url,
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
        options,
      ),
      anon = createClient(
        url,
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
        options,
      );
    let uid, path;
    try {
      const email = `tf-media-${randomUUID()}@example.test`,
        password = randomUUID() + "Aa!";
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
            name: "QA Media",
            headline: "Temporary fixture",
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
          .from("project-media")
          .upload(path, png, { contentType: "image/png" }),
      );
      const project = ok(
        await db
          .from("portfolio_projects")
          .insert({
            owner_id: uid,
            title: "QA image fixture",
            image_path: path,
            published: false,
          })
          .select()
          .single(),
      );
      assert.ok(
        (await anon.storage.from("project-media").createSignedUrl(path, 60))
          .error,
      );
      assert.ok(
        (
          await db.storage
            .from("project-media")
            .upload(`${randomUUID()}/wrong.png`, png, {
              contentType: "image/png",
            })
        ).error,
      );
      ok(
        await db
          .from("portfolio_projects")
          .update({ published: true })
          .eq("id", project.id),
      );
      const signed = ok(
        await anon.storage.from("project-media").createSignedUrl(path, 60),
      );
      assert.equal((await fetch(signed.signedUrl)).status, 200);
      ok(await db.storage.from("project-media").remove([path]));
      assert.ok((await db.storage.from("project-media").download(path)).error);
    } finally {
      if (path) await admin.storage.from("project-media").remove([path]);
      if (uid) ok(await admin.auth.admin.deleteUser(uid));
    }
  },
);
