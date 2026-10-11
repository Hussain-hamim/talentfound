"use client";
import Link from "next/link";
import { useState, type FormEvent } from "react";
import { Plus, ArrowUp, ArrowDown, Layers3, ArrowUpRight } from "lucide-react";
import type { WorkspaceData, Row } from "@/lib/platform/types";
import { splitList } from "@/lib/platform/validation";
import { uploadImage } from "./workspace-profile";
import type { Save } from "./workspace";
import { Heading, Field, Empty, Status, Badge, Avatar, date } from "./ui";
export function ProjectsPanel({
  data,
  save,
  pending,
}: {
  data: WorkspaceData;
  save: Save;
  pending: boolean;
}) {
  const [editing, setEditing] = useState<
    Row<"portfolio_projects"> | null | undefined
  >(undefined);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const text = (k: string) => String(f.get(k) || "");
    setError("");
    setUploading(true);
    try {
      const file = f.get("image");
      let image_path = editing?.image_path || null;
      if (file instanceof File && file.size)
        image_path = await uploadImage(file, data.member.id, "project-media");
      const success = await save(
        "project",
        {
          ...(editing ? { id: editing.id } : {}),
          title: text("title"),
          description: text("description"),
          contribution: text("contribution"),
          stack: splitList(text("stack")),
          live_url: text("live_url"),
          repository_url: text("repository_url"),
          published: f.get("published") === "on",
          position: editing?.position ?? data.projects.length,
          image_path,
        },
        "Project saved.",
      );
      if (success) setEditing(undefined);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save project.");
    } finally {
      setUploading(false);
    }
  }
  async function move(index: number, direction: number) {
    const next = [...data.projects];
    const other = index + direction;
    if (other < 0 || other >= next.length) return;
    [next[index], next[other]] = [next[other], next[index]];
    await save(
      "reorderProjects",
      { ids: next.map((p) => p.id) },
      "Project order updated.",
    );
  }
  return (
    <>
      <Heading
        eyebrow="LET YOUR WORK DO THE TALKING"
        title="Things you’ve made."
        description="Projects, experiments, and the decisions behind them."
      >
        <button
          className="pf-button primary"
          onClick={() => {
            setEditing(null);
            setError("");
          }}
        >
          <Plus size={15} />
          Add a project
        </button>
      </Heading>
      <Status error={error} />
      {editing !== undefined ? (
        <form
          method="post"
          className="pf-panel pf-form"
          onSubmit={submit}
          key={editing?.id || "new"}
        >
          <h2>{editing ? "Edit project" : "Your next showcase"}</h2>
          <div className="pf-form-grid">
            <Field label="Project name">
              <input
                name="title"
                required
                maxLength={120}
                defaultValue={editing?.title}
              />
            </Field>
            <Field label="Tech stack" help="Separate technologies with commas.">
              <input name="stack" defaultValue={editing?.stack.join(", ")} />
            </Field>
            <Field label="What is it?" wide>
              <textarea
                name="description"
                rows={4}
                maxLength={4000}
                defaultValue={editing?.description}
                placeholder="The problem, the idea, and what you built."
              />
            </Field>
            <Field label="Your contribution" wide>
              <textarea
                name="contribution"
                maxLength={2000}
                defaultValue={editing?.contribution}
                placeholder="What did you personally design, build, or improve?"
              />
            </Field>
            <Field label="Live project URL">
              <input
                name="live_url"
                type="url"
                defaultValue={editing?.live_url}
                placeholder="https://"
              />
            </Field>
            <Field label="Repository URL">
              <input
                name="repository_url"
                type="url"
                defaultValue={editing?.repository_url}
                placeholder="https://github.com/"
              />
            </Field>
            <Field
              label="Cover image"
              help="JPEG, PNG, or WebP · up to 5 MB. Draft images stay private."
              wide
            >
              <input
                name="image"
                type="file"
                accept="image/jpeg,image/png,image/webp"
              />
            </Field>
            <label className="pf-checkbox">
              <input
                name="published"
                type="checkbox"
                defaultChecked={editing?.published ?? false}
              />
              Publish on my public profile
            </label>
          </div>
          <div className="pf-form-footer">
            <button
              type="button"
              className="pf-button"
              onClick={() => setEditing(undefined)}
            >
              Cancel
            </button>
            <button
              className="pf-button primary"
              disabled={pending || uploading}
            >
              {pending || uploading ? "Saving…" : "Save project"}
            </button>
          </div>
        </form>
      ) : data.projects.length ? (
        <div className="pf-project-list">
          {data.projects.map((p, index) => (
            <article className="pf-panel pf-project-card" key={p.id}>
              <div className="pf-project-image pf-project-placeholder">
                <Layers3 size={36} />
              </div>
              <div className="pf-panel-top">
                <h2>{p.title}</h2>
                <Badge status={p.published ? "published" : "draft"} />
              </div>
              <p>{p.description || "Add the story behind this project."}</p>
              <div className="pf-tags">
                {p.stack.map((t) => (
                  <span className="pf-tag" key={t}>
                    {t}
                  </span>
                ))}
              </div>
              <div className="pf-actions" style={{ marginTop: 20 }}>
                <button
                  className="pf-button small"
                  onClick={() => setEditing(p)}
                >
                  Edit project
                </button>
                <button
                  className="pf-button small"
                  aria-label={`Move ${p.title} up`}
                  disabled={pending || index === 0}
                  onClick={() => move(index, -1)}
                >
                  <ArrowUp size={13} />
                </button>
                <button
                  className="pf-button small"
                  aria-label={`Move ${p.title} down`}
                  disabled={pending || index === data.projects.length - 1}
                  onClick={() => move(index, 1)}
                >
                  <ArrowDown size={13} />
                </button>
                {confirmDelete === p.id ? (
                  <>
                    <button
                      className="pf-button small danger"
                      disabled={pending}
                      onClick={async () => {
                        if (
                          await save(
                            "deleteProject",
                            { id: p.id },
                            "Project removed.",
                          )
                        )
                          setConfirmDelete(null);
                      }}
                    >
                      Confirm removal
                    </button>
                    <button
                      className="pf-button small"
                      onClick={() => setConfirmDelete(null)}
                    >
                      Keep
                    </button>
                  </>
                ) : (
                  <button
                    className="pf-button small danger"
                    onClick={() => setConfirmDelete(p.id)}
                  >
                    Remove
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>
      ) : (
        <Empty
          title="Your work belongs here."
          description="Start with one project. Tell the story, add a link, and give someone a reason to say hello."
        />
      )}
    </>
  );
}
export function OpportunitiesPanel({
  data,
  save,
  pending,
}: {
  data: WorkspaceData;
  save: Save;
  pending: boolean;
}) {
  const [editing, setEditing] = useState<
    Row<"opportunities"> | null | undefined
  >(undefined);
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    if (
      await save(
        "opportunity",
        { ...Object.fromEntries(f), ...(editing ? { id: editing.id } : {}) },
        "Opportunity saved.",
      )
    )
      setEditing(undefined);
  }
  return (
    <>
      <Heading
        eyebrow="GOOD WORK NEEDS GOOD PEOPLE"
        title="Room for someone great."
        description="A clear brief is the beginning of a better conversation."
      >
        <button className="pf-button primary" onClick={() => setEditing(null)}>
          <Plus size={15} />
          New opportunity
        </button>
      </Heading>
      {editing !== undefined ? (
        <form
          method="post"
          className="pf-panel pf-form"
          onSubmit={submit}
          key={editing?.id || "new"}
        >
          <h2>{editing ? "Edit opportunity" : "What are you building?"}</h2>
          <div className="pf-form-grid">
            <Field label="Title">
              <input
                name="title"
                required
                maxLength={120}
                defaultValue={editing?.title}
                placeholder="Frontend engineer for our next chapter"
              />
            </Field>
            <Field label="Company or project">
              <input
                name="company"
                required
                maxLength={120}
                defaultValue={editing?.company || data.recruiter?.company || ""}
              />
            </Field>
            <Field label="Type of work">
              <select
                name="engagement"
                defaultValue={editing?.engagement || "Freelance"}
              >
                <option>Freelance</option>
                <option>Full-time</option>
                <option>Co-founder</option>
              </select>
            </Field>
            <Field label="Status">
              <select name="status" defaultValue={editing?.status || "active"}>
                <option value="active">Active</option>
                <option value="draft">Draft</option>
                <option value="closed">Closed</option>
              </select>
            </Field>
            <Field
              label="The brief"
              wide
              help="At least 20 characters. Share the problem, the goal, and what success looks like."
            >
              <textarea
                name="description"
                required
                minLength={20}
                maxLength={4000}
                rows={5}
                defaultValue={editing?.description}
              />
            </Field>
            <Field label="Skills or experience you need" wide>
              <textarea
                name="requirements"
                maxLength={2000}
                defaultValue={editing?.requirements}
              />
            </Field>
            <Field label="Budget, salary, or equity expectations">
              <input
                name="budget"
                maxLength={200}
                defaultValue={editing?.budget}
                placeholder="Include currency and hourly, annual, or project basis"
              />
            </Field>
            <Field label="Timeline">
              <input
                name="timeline"
                maxLength={200}
                defaultValue={editing?.timeline}
                placeholder="When would you like to get started?"
              />
            </Field>
          </div>
          <div className="pf-form-footer">
            <button
              className="pf-button"
              type="button"
              onClick={() => setEditing(undefined)}
            >
              Cancel
            </button>
            <button disabled={pending} className="pf-button primary">
              Save opportunity
            </button>
          </div>
        </form>
      ) : data.opportunities.length ? (
        <div className="pf-stack">
          {data.opportunities.map((o) => (
            <article className="pf-panel" key={o.id}>
              <div className="pf-panel-top">
                <div>
                  <h2>{o.title}</h2>
                  <p className="pf-note">
                    {o.company} · {o.engagement}
                  </p>
                </div>
                <Badge status={o.status} />
              </div>
              <p className="pf-muted pf-profile-body">{o.description}</p>
              <div className="pf-tags" style={{ margin: "20px 0" }}>
                {o.budget && <span className="pf-tag">{o.budget}</span>}
                {o.timeline && <span className="pf-tag">{o.timeline}</span>}
                <span className="pf-tag">
                  {
                    data.invitations.filter((i) => i.opportunity_id === o.id)
                      .length
                  }{" "}
                  invitations
                </span>
              </div>
              <div className="pf-actions">
                <button className="pf-button" onClick={() => setEditing(o)}>
                  Edit brief
                </button>
                <Link className="pf-button primary" href="/developers">
                  Find people to invite
                  <ArrowUpRight size={14} />
                </Link>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <Empty
          title="Your next idea starts here."
          description="Create an opportunity, then invite developers whose work feels like a good fit. Invitations are private."
        />
      )}
    </>
  );
}
export function ShortlistsPanel({
  data,
  save,
  pending,
}: {
  data: WorkspaceData;
  save: Save;
  pending: boolean;
}) {
  const [list, setList] = useState("all");
  const [editing, setEditing] = useState<string | null>(null);
  return (
    <>
      <Heading
        eyebrow="KEEP THE RIGHT PEOPLE CLOSE"
        title="Your shortlist, your way."
        description="Private notes and a simple pipeline to keep every conversation moving."
      >
        <Link className="pf-button primary" href="/developers">
          Explore talent
          <ArrowUpRight size={14} />
        </Link>
      </Heading>
      <form
        method="post"
        className="pf-inline-form"
        style={{ maxWidth: 460, marginBottom: 25 }}
        onSubmit={async (e) => {
          e.preventDefault();
          const form = e.currentTarget;
          if (
            await save(
              "shortlist",
              { name: String(new FormData(form).get("name")) },
              "Shortlist created.",
            )
          )
            form.reset();
        }}
      >
        <Field label="New shortlist">
          <input
            name="name"
            required
            maxLength={100}
            placeholder="e.g. Founding engineers"
          />
        </Field>
        <button className="pf-button" disabled={pending}>
          <Plus size={14} />
          Create
        </button>
      </form>
      <div className="pf-tabs">
        <button
          className={list === "all" ? "active" : ""}
          onClick={() => setList("all")}
        >
          All saved people
        </button>
        {data.shortlists.map((s) => (
          <button
            key={s.id}
            className={list === s.id ? "active" : ""}
            onClick={() => setList(s.id)}
          >
            {s.name}
          </button>
        ))}
      </div>
      {list !== "all" && (
        <div className="pf-actions" style={{ marginBottom: 20 }}>
          <button
            className="pf-button small danger"
            disabled={pending}
            onClick={async () => {
              if (
                await save(
                  "deleteShortlist",
                  { id: list },
                  "List removed. Saved candidates are still available in All saved people.",
                )
              )
                setList("all");
            }}
          >
            Remove this list
          </button>
        </div>
      )}
      <div className="pf-stack">
        {data.candidates
          .filter((c) => list === "all" || c.shortlist_id === list)
          .map((c) => {
            const person = data.people.find((p) => p.id === c.developer_id);
            return (
              <article key={c.id} className="pf-panel">
                <div className="pf-panel-top">
                  <div className="pf-row-main">
                    <Avatar
                      name={person?.name || "Developer"}
                      path={person?.avatar_path}
                    />
                    <div>
                      <h3>{person?.name || "Developer"}</h3>
                      <p className="pf-note">Saved {date(c.created_at)}</p>
                    </div>
                  </div>
                  <Badge status={c.stage} />
                </div>
                {editing === c.id ? (
                  <form
                    method="post"
                    className="pf-form"
                    onSubmit={async (e) => {
                      e.preventDefault();
                      const f = new FormData(e.currentTarget);
                      if (
                        await save("candidate", {
                          developer_id: c.developer_id,
                          stage: f.get("stage"),
                          notes: f.get("notes"),
                          shortlist_id: f.get("shortlist_id") || null,
                          opportunity_id: f.get("opportunity_id") || null,
                        })
                      )
                        setEditing(null);
                    }}
                  >
                    <div className="pf-form-grid">
                      <Field label="Stage">
                        <select name="stage" defaultValue={c.stage}>
                          {[
                            "shortlisted",
                            "contacted",
                            "interested",
                            "hired",
                            "closed",
                          ].map((x) => (
                            <option key={x}>{x}</option>
                          ))}
                        </select>
                      </Field>
                      <Field label="Shortlist">
                        <select
                          name="shortlist_id"
                          defaultValue={c.shortlist_id || ""}
                        >
                          <option value="">No list</option>
                          {data.shortlists.map((s) => (
                            <option value={s.id} key={s.id}>
                              {s.name}
                            </option>
                          ))}
                        </select>
                      </Field>
                      <Field label="Opportunity">
                        <select
                          name="opportunity_id"
                          defaultValue={c.opportunity_id || ""}
                        >
                          <option value="">No opportunity</option>
                          {data.opportunities.map((o) => (
                            <option value={o.id} key={o.id}>
                              {o.title}
                            </option>
                          ))}
                        </select>
                      </Field>
                      <Field label="Private notes" wide>
                        <textarea
                          name="notes"
                          maxLength={5000}
                          defaultValue={c.notes}
                        />
                      </Field>
                    </div>
                    <div className="pf-actions">
                      <button disabled={pending} className="pf-button primary">
                        Save
                      </button>
                      <button
                        type="button"
                        className="pf-button"
                        onClick={() => setEditing(null)}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <>
                    <p className="pf-muted pf-profile-body">
                      {c.notes ||
                        "A promising connection. Add a private note to remember what stood out."}
                    </p>
                    <div className="pf-actions" style={{ marginTop: 20 }}>
                      <button
                        className="pf-button small"
                        onClick={() => setEditing(c.id)}
                      >
                        Manage candidate
                      </button>
                      <Link
                        className="pf-button small"
                        href={`/messages/new?recipient=${c.developer_id}`}
                      >
                        Message
                      </Link>
                      <button
                        disabled={pending}
                        className="pf-button small danger"
                        onClick={() =>
                          save(
                            "deleteCandidate",
                            { id: c.id },
                            "Removed from saved people.",
                          )
                        }
                      >
                        Remove
                      </button>
                    </div>
                  </>
                )}
              </article>
            );
          })}
      </div>
      {!data.candidates.filter((c) => list === "all" || c.shortlist_id === list)
        .length && (
        <Empty
          title="Keep an eye on good people."
          description="Save developers as you explore. Your shortlists and notes are visible only to you."
          href="/developers"
          label="Find your people"
        />
      )}
      <section className="pf-panel" style={{ marginTop: 30 }}>
        <h2>Your saved searches</h2>
        {data.savedSearches.length ? (
          data.savedSearches.map((s) => (
            <div className="pf-row" key={s.id}>
              <Link
                href={`/developers?${new URLSearchParams(Object.entries(s.filters as Record<string, string | number>).map(([k, v]) => [k, String(v)]))}`}
              >
                {s.name} ↗
              </Link>
              <button
                className="pf-button small"
                onClick={() =>
                  save("deleteSearch", { id: s.id }, "Search removed.")
                }
              >
                Remove
              </button>
            </div>
          ))
        ) : (
          <p className="pf-muted">
            Save a search from the talent directory to pick it up again here.
          </p>
        )}
      </section>
    </>
  );
}
export function InvitationsPanel({
  data,
  save,
  pending,
}: {
  data: WorkspaceData;
  save: Save;
  pending: boolean;
}) {
  const [tab, setTab] = useState<"incoming" | "outgoing">("incoming");
  const items = data.invitations.filter((i) =>
    tab === "incoming"
      ? i.recipient_id === data.member.id
      : i.sender_id === data.member.id,
  );
  return (
    <>
      <Heading
        eyebrow="SOMETHING GOOD COULD START HERE"
        title="An invitation to build."
        description="Accepting an invitation expresses interest. Agree on the details together in your conversation."
      />
      <div className="pf-tabs">
        <button
          className={tab === "incoming" ? "active" : ""}
          onClick={() => setTab("incoming")}
        >
          Received
        </button>
        <button
          className={tab === "outgoing" ? "active" : ""}
          onClick={() => setTab("outgoing")}
        >
          Sent
        </button>
      </div>
      {items.length ? (
        <div className="pf-stack">
          {items.map((i) => {
            const brief = i.brief as {
              title: string;
              description: string;
              company: string;
              engagement: string;
              budget: string;
              timeline: string;
            };
            const person = data.people.find(
              (p) =>
                p.id === (tab === "incoming" ? i.sender_id : i.recipient_id),
            );
            return (
              <article className="pf-panel" key={i.id}>
                <div className="pf-panel-top">
                  <div>
                    <h2>{brief.title}</h2>
                    <p className="pf-note">
                      {tab === "incoming" ? "From" : "To"}{" "}
                      {person?.name || "Member"} · {date(i.created_at)}
                    </p>
                  </div>
                  <Badge status={i.status} />
                </div>
                <p className="pf-muted pf-profile-body">{brief.description}</p>
                <div className="pf-tags" style={{ margin: "20px 0" }}>
                  {[
                    brief.company,
                    brief.engagement,
                    brief.budget,
                    brief.timeline,
                  ]
                    .filter(Boolean)
                    .map((x, n) => (
                      <span className="pf-tag" key={n}>
                        {x}
                      </span>
                    ))}
                </div>
                <div className="pf-actions">
                  <Link
                    className="pf-button"
                    href={`/dashboard/messages/${i.conversation_id}`}
                  >
                    Open conversation
                  </Link>
                  {i.status === "pending" &&
                    (tab === "incoming" ? (
                      <>
                        <button
                          className="pf-button primary"
                          disabled={pending}
                          onClick={() =>
                            save(
                              "invitation",
                              { invitation: i.id, response: "accepted" },
                              "Invitation accepted. Say hello in the conversation.",
                            )
                          }
                        >
                          Accept invitation
                        </button>
                        <button
                          className="pf-button"
                          disabled={pending}
                          onClick={() =>
                            save(
                              "invitation",
                              { invitation: i.id, response: "declined" },
                              "Invitation declined.",
                            )
                          }
                        >
                          Decline
                        </button>
                      </>
                    ) : (
                      <button
                        className="pf-button"
                        disabled={pending}
                        onClick={() =>
                          save(
                            "invitation",
                            { invitation: i.id, response: "withdrawn" },
                            "Invitation withdrawn.",
                          )
                        }
                      >
                        Withdraw
                      </button>
                    ))}
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <Empty
          title={
            tab === "incoming"
              ? "Your next invitation is ahead."
              : "Start something together."
          }
          description={
            tab === "incoming"
              ? "When someone sees a fit, their invitation will appear here."
              : "Find a developer and invite them to an opportunity from their profile."
          }
          href="/developers"
          label="Explore the community"
        />
      )}
    </>
  );
}
