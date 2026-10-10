"use client";
import { useState, type FormEvent } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { splitList } from "@/lib/platform/validation";
import type { WorkspaceData } from "@/lib/platform/types";
import type { Save } from "./workspace";
import { Field, Heading, Status, Avatar } from "./ui";
import { supabaseConfig } from "@/lib/supabase/config";
export async function uploadImage(
  file: File,
  uid: string,
  bucket: "avatars" | "project-media",
) {
  if (
    !["image/jpeg", "image/png", "image/webp"].includes(file.type) ||
    file.size > 5 * 1024 * 1024
  )
    throw new Error("Choose a JPEG, PNG, or WebP image under 5 MB.");
  const extension = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
  }[file.type];
  const path = `${uid}/${crypto.randomUUID()}.${extension}`;
  const { error } = await createClient()
    .storage.from(bucket)
    .upload(path, file, { contentType: file.type, upsert: false });
  if (error) throw error;
  return path;
}
export function ProfileEditor({
  data,
  save,
  pending,
}: {
  data: WorkspaceData;
  save: Save;
  pending: boolean;
}) {
  const d = data.developer;
  const recruiter = data.account.active_workspace === "recruiter";
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const text = (k: string) => String(f.get(k) || "");
    const num = (k: string) => (text(k) === "" ? null : Number(text(k)));
    if (recruiter) {
      await save("recruiter", {
        name: text("name"),
        company: text("company"),
        intent: text("intent"),
        bio: text("bio"),
      });
      return;
    }
    await save("profile", {
      name: text("name"),
      headline: text("headline"),
      bio: text("bio"),
      location: text("location"),
      timezone: text("timezone"),
      category: text("category"),
      skills: splitList(text("skills")),
      experience_years: num("experience_years"),
      availability: text("availability"),
      engagements: f.getAll("engagements"),
      work_style: text("work_style"),
      hours_per_week: num("hours_per_week"),
      start_weeks: num("start_weeks"),
      utc_start: num("utc_start"),
      utc_end: num("utc_end"),
      hourly_usd: num("hourly_usd"),
      salary_usd: num("salary_usd"),
      website: text("website"),
      github: text("github"),
      linkedin: text("linkedin"),
    });
  }
  return (
    <>
      <Heading
        eyebrow={
          recruiter
            ? "THE PEOPLE BEHIND THE OPPORTUNITY"
            : "MAKE YOURSELF KNOWN"
        }
        title={recruiter ? "Tell your story." : "A little more you."}
        description={
          recruiter
            ? "Help developers understand who they’re speaking with."
            : "Your profile is public. Give people a clear sense of what you bring."
        }
      />
      <form method="post" className="pf-form" onSubmit={submit}>
        <section className="pf-panel">
          <h2>The introduction</h2>
          <div className="pf-form-grid">
            <Field label="Full name">
              <input
                name="name"
                required
                maxLength={100}
                defaultValue={data.member.name}
              />
            </Field>
            {recruiter ? (
              <>
                <Field label="Company or project">
                  <input
                    name="company"
                    required
                    defaultValue={data.recruiter?.company}
                  />
                </Field>
                <Field label="Your intent">
                  <select name="intent" defaultValue={data.recruiter?.intent}>
                    <option>Hiring</option>
                    <option>Co-founder</option>
                    <option>Collaboration</option>
                  </select>
                </Field>
              </>
            ) : (
              <>
                <Field label="Headline">
                  <input
                    name="headline"
                    required
                    maxLength={120}
                    defaultValue={d?.headline}
                  />
                </Field>
                <Field label="Specialty">
                  <select name="category" defaultValue={d?.category}>
                    {[
                      "Frontend",
                      "Full-stack",
                      "Backend",
                      "Mobile",
                      "Data & AI",
                      "DevOps",
                      "Other",
                    ].map((x) => (
                      <option key={x}>{x}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Skills" help="Separate skills with commas.">
                  <input name="skills" defaultValue={d?.skills.join(", ")} />
                </Field>
              </>
            )}
            <Field label="About you" wide>
              <textarea
                name="bio"
                maxLength={3000}
                rows={5}
                defaultValue={recruiter ? data.recruiter?.bio : d?.bio}
                placeholder="The work you care about. The problems you like solving. What makes working with you, you."
              />
            </Field>
          </div>
        </section>
        {!recruiter && (
          <>
            <section className="pf-panel">
              <h2>Working together</h2>
              <div className="pf-form-grid">
                <Field label="City and country">
                  <input name="location" required defaultValue={d?.location} />
                </Field>
                <Field label="Time zone">
                  <select name="timezone" defaultValue={d?.timezone}>
                    {Intl.supportedValuesOf("timeZone").map((z) => (
                      <option key={z}>{z}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Years of experience">
                  <input
                    name="experience_years"
                    type="number"
                    min={0}
                    max={70}
                    defaultValue={d?.experience_years ?? ""}
                  />
                </Field>
                <Field label="Availability">
                  <select name="availability" defaultValue={d?.availability}>
                    {[
                      "Available now",
                      "Open to conversations",
                      "Not currently available",
                    ].map((v) => (
                      <option key={v}>{v}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Work style">
                  <select name="work_style" defaultValue={d?.work_style}>
                    <option>Remote</option>
                    <option>Hybrid</option>
                    <option>On-site</option>
                    <option>Flexible</option>
                  </select>
                </Field>
                <Field label="Hours available per week">
                  <input
                    name="hours_per_week"
                    type="number"
                    min={0}
                    max={168}
                    defaultValue={d?.hours_per_week ?? ""}
                  />
                </Field>
                <Field label="Can start in · weeks">
                  <input
                    name="start_weeks"
                    type="number"
                    min={0}
                    max={104}
                    defaultValue={d?.start_weeks ?? ""}
                  />
                </Field>
                <div className="pf-field">
                  <span>Open to</span>
                  <div className="pf-actions">
                    {["Freelance", "Full-time", "Co-founder"].map((x) => (
                      <label className="pf-checkbox" key={x}>
                        <input
                          type="checkbox"
                          name="engagements"
                          value={x}
                          defaultChecked={d?.engagements.includes(x)}
                        />
                        {x}
                      </label>
                    ))}
                  </div>
                </div>
                <Field label="Working day starts · UTC hour">
                  <input
                    name="utc_start"
                    type="number"
                    min={0}
                    max={23}
                    defaultValue={d?.utc_start ?? ""}
                  />
                </Field>
                <Field label="Working day ends · UTC hour">
                  <input
                    name="utc_end"
                    type="number"
                    min={1}
                    max={24}
                    defaultValue={d?.utc_end ?? ""}
                  />
                </Field>
                <Field
                  label="Starting hourly rate · USD"
                  help="Optional. Public when provided."
                >
                  <input
                    name="hourly_usd"
                    type="number"
                    min={0}
                    defaultValue={d?.hourly_usd ?? ""}
                  />
                </Field>
                <Field
                  label="Starting annual salary · USD"
                  help="Optional. Public when provided."
                >
                  <input
                    name="salary_usd"
                    type="number"
                    min={0}
                    defaultValue={d?.salary_usd ?? ""}
                  />
                </Field>
              </div>
            </section>
            <section className="pf-panel">
              <h2>Elsewhere online</h2>
              <div className="pf-form-grid">
                {[
                  ["website", "Website / portfolio"],
                  ["github", "GitHub"],
                  ["linkedin", "LinkedIn"],
                ].map(([key, label]) => (
                  <Field label={label} key={key}>
                    <input
                      type="url"
                      name={key}
                      placeholder="https://"
                      defaultValue={
                        d?.[key as "website" | "github" | "linkedin"]
                      }
                    />
                  </Field>
                ))}
              </div>
            </section>
          </>
        )}
        <div className="pf-form-footer">
          <span className="pf-note">
            Changes appear on your profile as soon as you save.
          </span>
          <button className="pf-button primary" disabled={pending}>
            {pending ? "Saving…" : "Save profile"}
          </button>
        </div>
      </form>
    </>
  );
}
export function SettingsPanel({
  data,
  save,
  pending,
}: {
  data: WorkspaceData;
  save: Save;
  pending: boolean;
}) {
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  async function upload(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const file = new FormData(e.currentTarget).get("avatar");
      if (!(file instanceof File) || !file.size)
        throw new Error("Choose an image first.");
      const path = await uploadImage(file, data.member.id, "avatars");
      await save("avatar", { path }, "Your new avatar is ready.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not upload.");
    } finally {
      setBusy(false);
    }
  }
  async function account(
    e: FormEvent<HTMLFormElement>,
    kind: "email" | "password",
  ) {
    e.preventDefault();
    setError("");
    setMessage("");
    setBusy(true);
    const f = new FormData(e.currentTarget);
    try {
      const value = String(f.get(kind) || "");
      const { error } = await createClient().auth.updateUser(
        kind === "email" ? { email: value } : { password: value },
        { emailRedirectTo: `${window.location.origin}/auth/callback` },
      );
      if (error) throw error;
      setMessage(
        kind === "email"
          ? "Check your inbox to confirm your new email address."
          : "Password updated.",
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not update account.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <Heading
        eyebrow="MAKE YOURSELF AT HOME"
        title="Your account, your preferences."
        description="A few controls to keep TalentFound working the way you like."
      />
      <Status error={error} message={message} />
      <div className="pf-stack">
        <section className="pf-panel">
          <h2>A face to the name</h2>
          <div className="pf-row">
            <Avatar
              name={data.member.name}
              src={
                data.member.avatar_path
                  ? `${supabaseConfig().url}/storage/v1/object/public/avatars/${data.member.avatar_path}`
                  : null
              }
            />
            <form method="post" className="pf-inline-form" onSubmit={upload}>
              <Field
                label="Profile photo"
                help="JPEG, PNG, or WebP · up to 5 MB"
              >
                <input
                  name="avatar"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  required
                />
              </Field>
              <button className="pf-button" disabled={busy || pending}>
                Upload photo
              </button>
            </form>
          </div>
        </section>
        <form
          method="post"
          className="pf-panel"
          onSubmit={(e) => {
            e.preventDefault();
            const f = new FormData(e.currentTarget);
            void save(
              "settings",
              {
                email_notifications: f.get("email_notifications") === "on",
                identify_visits: f.get("identify_visits") === "on",
              },
              "Preferences saved.",
            );
          }}
        >
          <h2>Notifications & privacy</h2>
          <label className="pf-toggle-row">
            <div>
              <h3>Email notifications</h3>
              <p>
                Grouped notifications for unread messages and invitations. We’ll
                include the message text and a link to reply in TalentFound.
              </p>
            </div>
            <input
              type="checkbox"
              name="email_notifications"
              defaultChecked={data.account.email_notifications}
            />
          </label>
          <label className="pf-toggle-row">
            <div>
              <h3>Let developers know you visited</h3>
              <p>
                Show your name when you view someone’s profile. With this off,
                your visits only appear in anonymous totals.
              </p>
            </div>
            <input
              type="checkbox"
              name="identify_visits"
              defaultChecked={data.account.identify_visits}
            />
          </label>
          <div className="pf-actions" style={{ marginTop: 20 }}>
            <button className="pf-button primary" disabled={pending}>
              Save preferences
            </button>
          </div>
        </form>
        <div className="pf-form-grid">
          <form
            method="post"
            className="pf-panel pf-form"
            onSubmit={(e) => account(e, "email")}
          >
            <h2>Update email</h2>
            <Field label="New email address">
              <input type="email" name="email" required autoComplete="email" />
            </Field>
            <button className="pf-button" disabled={busy}>
              Send confirmation
            </button>
          </form>
          <form
            method="post"
            className="pf-panel pf-form"
            onSubmit={(e) => account(e, "password")}
          >
            <h2>Update password</h2>
            <Field label="New password">
              <input
                type="password"
                name="password"
                minLength={8}
                required
                autoComplete="new-password"
              />
            </Field>
            <button className="pf-button" disabled={busy}>
              Update password
            </button>
          </form>
        </div>
        <section className="pf-panel">
          <h2>Blocked members</h2>
          <p className="pf-note">
            Blocking stops messages, invitations, and their email notifications
            in both directions.
          </p>
          {data.blocks.length ? (
            data.blocks.map((b) => (
              <div className="pf-row" key={b.blocked_id}>
                <span>
                  {data.people.find((p) => p.id === b.blocked_id)?.name ||
                    "Member"}
                </span>
                <button
                  className="pf-button small"
                  disabled={pending}
                  onClick={() =>
                    save(
                      "block",
                      { member: b.blocked_id, blocked: false },
                      "Member unblocked.",
                    )
                  }
                >
                  Unblock
                </button>
              </div>
            ))
          ) : (
            <p className="pf-muted" style={{ marginTop: 20 }}>
              You haven’t blocked anyone.
            </p>
          )}
        </section>
        <section className="pf-panel">
          <h2>Your workspaces</h2>
          <p className="pf-muted">
            You can build things and find people to build with. Enable both
            sides of TalentFound under one account.
          </p>
          <div className="pf-actions" style={{ marginTop: 20 }}>
            {!data.developer && (
              <Link className="pf-button" href="/onboarding?role=developer">
                Enable developer workspace
              </Link>
            )}
            {!data.recruiter && (
              <Link className="pf-button" href="/onboarding?role=recruiter">
                Enable recruiter workspace
              </Link>
            )}
            {data.developer && data.recruiter && (
              <span className="pf-tag">Both workspaces enabled</span>
            )}
          </div>
        </section>
      </div>
    </>
  );
}
