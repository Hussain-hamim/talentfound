import { readFile } from "node:fs/promises";
import { randomUUID, createHash } from "node:crypto";
import { createRequire } from "node:module";
import { createClient } from "@supabase/supabase-js";
const require = createRequire(import.meta.url);
const sharp = createRequire(require.resolve("next/package.json"))("sharp");
const people = JSON.parse(
  await readFile(
    new URL("./data/demo-developers.json", import.meta.url),
    "utf8",
  ),
);
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
if (new URL(url).hostname !== "zgpqyctyxozsvbjayhaf.supabase.co")
  throw new Error("Incorrect project");
const db = createClient(url, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});
const ok = (r) => {
  if (r.error) throw new Error(r.error.message);
  return r.data;
};
const uuid = (s) => {
  const h = createHash("sha256").update(s).digest("hex");
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-4${h.slice(13, 16)}-a${h.slice(17, 20)}-${h.slice(20, 32)}`;
};
const users = [];
for (let page = 1; ; page++) {
  const batch = ok(
    await db.auth.admin.listUsers({ page, perPage: 1000 }),
  ).users;
  users.push(...batch);
  if (batch.length < 1000) break;
}
for (const p of people) {
  const email = `${p.handle}@talentfound.example`;
  let user = users.find((u) => u.email === email);
  if (user && !user.app_metadata.talentfound_demo)
    throw new Error("Refusing to modify a non-demo account");
  if (!user)
    user = ok(
      await db.auth.admin.createUser({
        email,
        password: randomUUID() + randomUUID(),
        email_confirm: true,
        ban_duration: "876000h",
        app_metadata: { talentfound_demo: true },
        user_metadata: { full_name: p.name },
      }),
    ).user;
  const uid = user.id;
  const avatar = `${uid}/demo-avatar.png`;
  ok(
    await db.storage.from("avatars").upload(
      avatar,
      await sharp("public" + p.avatar)
        .resize(192, 192)
        .png()
        .toBuffer(),
      { contentType: "image/png", upsert: true },
    ),
  );
  ok(
    await db
      .from("members")
      .upsert({ id: uid, name: p.name, avatar_path: avatar }),
  );
  ok(
    await db
      .from("accounts")
      .upsert({
        id: uid,
        active_workspace: "developer",
        email_notifications: false,
        identify_visits: false,
      }),
  );
  ok(
    await db
      .from("developer_profiles")
      .upsert({
        id: uid,
        handle: p.handle,
        headline: p.role,
        bio: p.bio,
        location: p.location,
        timezone: p.timezone,
        category: p.category,
        skills: p.skills,
        experience_years: parseInt(p.experience),
        availability: p.availability,
        engagements: p.fit.engagements,
        work_style: p.workStyle,
        hours_per_week: p.fit.hoursPerWeek,
        start_weeks: p.fit.startWeeks,
        utc_start: p.fit.utcHours[0],
        utc_end: p.fit.utcHours[1],
        hourly_usd: p.fit.hourlyUsd,
        salary_usd: p.fit.salaryUsd,
        website: `https://${p.id}.example`,
        github: `https://example.com/demo/${p.id}/github`,
        linkedin: `https://example.com/demo/${p.id}/linkedin`,
        published: true,
      }),
  );
  for (const [position, project] of p.projects.entries()) {
    const imagePath = `${uid}/demo-${position}.webp`;
    const source = "public" + project.image.src;
    const meta = await sharp(source).metadata();
    const tile = project.image.sampleTile;
    const width = Math.floor(meta.width / 3),
      height = Math.floor(meta.height / 2);
    const image = await sharp(source)
      .extract({
        left: (tile % 3) * width,
        top: Math.floor(tile / 3) * height,
        width,
        height,
      })
      .webp({ quality: 88 })
      .toBuffer();
    ok(
      await db.storage
        .from("project-media")
        .upload(imagePath, image, { contentType: "image/webp", upsert: true }),
    );
    ok(
      await db
        .from("portfolio_projects")
        .upsert({
          id: uuid(`${uid}:${project.name}`),
          owner_id: uid,
          title: project.name,
          description: project.description,
          contribution: project.contribution,
          stack: project.stack.split(" · "),
          image_path: imagePath,
          published: true,
          position,
          live_url: "",
          repository_url: "",
        }),
    );
  }
  console.log(
    `Seeded ${p.name}: /developers/${p.handle} (${p.projects.length} published projects).`,
  );
}
console.log(
  "Demo logins are disabled; notifications are off. Sample testimonials are presentation-only, not real community reviews.",
);
