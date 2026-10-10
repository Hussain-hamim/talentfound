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
  "verification, recovery, session refresh, and logout with disposable accounts",
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
      // Generate a signup link without sending to an invented email address.
      const signup = ok(
        await admin.auth.admin.generateLink({
          type: "signup",
          email,
          password,
        }),
      );
      uid = signup.user.id;
      assert.ok(!signup.user.email_confirmed_at);
      const blocked = await db.auth.signInWithPassword({ email, password });
      assert.equal(blocked.error?.code, "email_not_confirmed");
      const verified = ok(
        await db.auth.verifyOtp({
          token_hash: signup.properties.hashed_token,
          type: "signup",
        }),
      );
      assert.ok(verified.user.email_confirmed_at);
      const oldToken = verified.session.access_token;
      const refreshed = ok(await db.auth.refreshSession());
      assert.ok(refreshed.session.refresh_token);
      assert.ok(refreshed.session.access_token);
      assert.ok(
        (
          await db.auth.verifyOtp({
            token_hash: signup.properties.hashed_token,
            type: "signup",
          })
        ).error,
        "verification links must be single-use",
      );
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
