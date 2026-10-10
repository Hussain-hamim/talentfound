import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "node:crypto";
import { writeFile, readFile, unlink } from "node:fs/promises";
const file = "/private/tmp/talentfound-browser-qa.json";
const db = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } },
);
if (
  new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname !==
  "zgpqyctyxozsvbjayhaf.supabase.co"
)
  throw new Error("Wrong project");
if (process.argv[2] === "cleanup") {
  const users = JSON.parse(await readFile(file, "utf8"));
  for (const u of users) {
    const { error } = await db.auth.admin.deleteUser(u.id);
    if (error) throw error;
  }
  await unlink(file);
  console.log("Temporary browser QA accounts removed.");
} else {
  const users = [];
  for (const label of ["Developer", "Recruiter"]) {
    const email = `tf-browser-${randomUUID()}@example.test`;
    const password = randomUUID() + "Aa!";
    const { data, error } = await db.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: `QA ${label}` },
    });
    if (error) throw error;
    users.push({ id: data.user.id, email, password, label });
  }
  await writeFile(file, JSON.stringify(users), { mode: 0o600 });
  console.log(JSON.stringify(users));
}
