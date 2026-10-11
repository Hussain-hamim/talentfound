import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
const options = { auth: { persistSession: false, autoRefreshToken: false } };
const enabled = process.env.TALENTFOUND_DB_TESTS === "1";
const ok = (r) => {
  assert.ifError(r.error);
  return r.data;
};
test(
  "immediate signup, onboarding, recovery, session refresh, and logout with disposable accounts",
  { skip: !enabled, timeout: 120000 },
  async () => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    assert.equal(new URL(url).hostname, "zgpqyctyxozsvbjayhaf.supabase.co");
    const admin = createClient(
      url,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      options,
    );
    const db = createClient(
      url,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
      options,
    );
    const email = `tf-auth-qa-${randomUUID()}@example.test`,
      password = randomUUID() + "Aa!";
    let uid;
    try {
      // Fail before signup if the hosted setting would send a confirmation email.
      const settingsResponse = await fetch(`${url}/auth/v1/settings`, {
        headers: { apikey: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY },
      });
      assert.ok(settingsResponse.ok);
      const settings = await settingsResponse.json();
      assert.equal(
        settings.mailer_autoconfirm,
        true,
        "Disable Confirm email in Supabase before running this test.",
      );
      const signup = ok(await db.auth.signUp({ email, password }));
      uid = signup.user?.id;
      assert.ok(uid);
      assert.ok(signup.session, "Signup must immediately establish a session");
      assert.ok(signup.user.email_confirmed_at);
      const oldToken = signup.session.access_token;
      ok(
        await db.rpc("complete_onboarding", {
          payload: {
            role: "developer",
            name: "Auth QA",
            headline: "Temporary QA account",
            location: "Test location",
            timezone: "UTC",
            skills: ["TypeScript"],
          },
        }),
      );
      const profile = ok(
        await db.from("developer_profiles").select("id").eq("id", uid).single(),
      );
      assert.equal(profile.id, uid);
      const refreshed = ok(await db.auth.refreshSession());
      assert.ok(refreshed.session.refresh_token);
      assert.ok(refreshed.session.access_token);
      const recovery = ok(
        await admin.auth.admin.generateLink({ type: "recovery", email }),
      );
      ok(
        await db.auth.verifyOtp({
          token_hash: recovery.properties.hashed_token,
          type: "recovery",
        }),
      );
      const replacement = randomUUID() + "Bb!";
      ok(await db.auth.updateUser({ password: replacement }));
      assert.ok(
        (
          await createClient(
            url,
            process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
            options,
          ).auth.signInWithPassword({ email, password })
        ).error,
      );
      ok(await db.auth.signInWithPassword({ email, password: replacement }));
      const refreshToken = ok(await db.auth.getSession()).session.refresh_token;
      ok(await db.auth.signOut());
      assert.equal(ok(await db.auth.getSession()).session, null);
      assert.ok(
        (await db.auth.refreshSession({ refresh_token: refreshToken })).error,
      );
      assert.ok(oldToken);
    } finally {
      if (uid) ok(await admin.auth.admin.deleteUser(uid));
    }
  },
);
