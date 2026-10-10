"use client";
import { useSyncExternalStore, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Send } from "lucide-react";
import { mutate } from "@/lib/platform/api";
import { parseDraft, type PendingDraft } from "@/lib/platform/validation";
import type { Row } from "@/lib/platform/types";
import { Heading, Field, Status, Avatar } from "./ui";
const draftKey = "talentfound:pending-contact:v1";
function ComposeEditor({
  recipient,
  name,
  handle,
  signedIn,
  invite = false,
  opportunities = [],
  draft,
}: {
  recipient: string;
  name: string;
  handle: string;
  signedIn: boolean;
  invite?: boolean;
  opportunities?: Row<"opportunities">[];
  draft: PendingDraft | null;
}) {
  const [body, setBody] = useState(draft?.body || "");
  const [brief, setBrief] = useState(
    draft?.invitation || {
      title: "",
      company: "",
      engagement: "Freelance" as "Freelance" | "Full-time" | "Co-founder",
      description: "",
      budget: "",
      timeline: "",
    },
  );
  const [selected, setSelected] = useState("");
  const [error, setError] = useState("");
  const restored = !!draft;
  const [pending, setPending] = useState(false);
  const [clientId] = useState(() => draft?.clientId || crypto.randomUUID());
  const [opportunityId] = useState(
    () => draft?.opportunityId || crypto.randomUUID(),
  );
  const router = useRouter();

  function storeDraft() {
    const draft: PendingDraft = {
      version: 1,
      recipient,
      handle,
      body,
      createdAt: Date.now(),
      clientId,
      opportunityId,
      ...(invite ? { invitation: brief } : {}),
    };
    localStorage.setItem(draftKey, JSON.stringify(draft));
  }
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setPending(true);
    try {
      if (!signedIn) {
        storeDraft();
        const path = `/developers/${handle}/${invite ? "invite" : "message"}`;
        router.push(`/login?next=${encodeURIComponent(path)}`);
        return;
      }
      let opportunity: string | undefined;
      if (invite) {
        if (selected) opportunity = selected;
        else {
          const saved = await mutate<Row<"opportunities">>("opportunity", {
            id: opportunityId,
            ...brief,
            requirements: "",
            status: "active",
          });
          opportunity = saved.id;
        }
      }
      const cid = await mutate<string>("message", {
        recipient,
        body:
          body.trim() ||
          (invite
            ? `I'd like to invite you to ${selected ? opportunities.find((o) => o.id === selected)?.title : brief.title}.`
            : ""),
        client_id: clientId,
        opportunity,
      });
      try {
        localStorage.removeItem(draftKey);
      } catch {}
      router.push(`/dashboard/messages/${cid}`);
      router.refresh();
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Could not send. Your draft is still here.",
      );
    } finally {
      setPending(false);
    }
  }
  function update(key: keyof typeof brief, value: string) {
    setBrief((old) => ({ ...old, [key]: value }));
  }
  return (
    <div className="pf-compose">
      <Heading
        eyebrow="GOOD THINGS START WITH HELLO"
        title={
          invite
            ? `Build something with ${name.split(" ")[0]}.`
            : `Say hello to ${name.split(" ")[0]}.`
        }
        description={
          signedIn
            ? "A thoughtful introduction goes a long way."
            : "Write your introduction first. We’ll help you sign in before anything is sent."
        }
      />
      <Status
        error={error}
        message={
          restored
            ? "Your draft is back. Review it, then send when you’re ready."
            : undefined
        }
      />
      <form method="post" className="pf-panel pf-form" onSubmit={submit}>
        <div className="pf-row-main">
          <Avatar name={name} />
          <div>
            <h3>{name}</h3>
            <p className="pf-note">A conversation on TalentFound</p>
          </div>
        </div>
        {invite && (
          <>
            {signedIn && opportunities.length > 0 && (
              <Field label="Use an opportunity">
                <select
                  value={selected}
                  onChange={(e) => setSelected(e.target.value)}
                >
                  <option value="">Create a new brief</option>
                  {opportunities
                    .filter((o) => o.status === "active")
                    .map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.title}
                      </option>
                    ))}
                </select>
              </Field>
            )}
            {!selected && (
              <div className="pf-form-grid">
                <Field label="Project or role title">
                  <input
                    required
                    maxLength={120}
                    value={brief.title}
                    onChange={(e) => update("title", e.target.value)}
                  />
                </Field>
                <Field label="Company or project">
                  <input
                    required
                    maxLength={120}
                    value={brief.company}
                    onChange={(e) => update("company", e.target.value)}
                  />
                </Field>
                <Field label="Type of work">
                  <select
                    value={brief.engagement}
                    onChange={(e) => update("engagement", e.target.value)}
                  >
                    <option>Freelance</option>
                    <option>Full-time</option>
                    <option>Co-founder</option>
                  </select>
                </Field>
                <Field label="Budget, salary, or equity">
                  <input
                    maxLength={200}
                    value={brief.budget}
                    onChange={(e) => update("budget", e.target.value)}
                  />
                </Field>
                <Field label="The brief" wide>
                  <textarea
                    required
                    minLength={20}
                    maxLength={4000}
                    value={brief.description}
                    onChange={(e) => update("description", e.target.value)}
                    placeholder="What are you building, and where could they help?"
                  />
                </Field>
                <Field label="Timeline" wide>
                  <input
                    maxLength={200}
                    value={brief.timeline}
                    onChange={(e) => update("timeline", e.target.value)}
                  />
                </Field>
              </div>
            )}
          </>
        )}
        <Field label={invite ? "Add a personal note" : "Your message"}>
          <textarea
            autoFocus={!invite}
            required={!invite}
            maxLength={4000}
            rows={6}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder={`Hi ${name.split(" ")[0]}, I came across your work…`}
          />
        </Field>
        <div className="pf-form-footer">
          <button
            type="button"
            className="pf-button"
            onClick={() => {
              try {
                localStorage.removeItem(draftKey);
              } catch {}
              router.back();
            }}
          >
            Cancel
          </button>
          <button className="pf-button primary" disabled={pending}>
            {pending
              ? "Working…"
              : signedIn
                ? invite
                  ? "Send invitation"
                  : "Send message"
                : "Continue to sign in"}
            <Send size={14} />
          </button>
        </div>
        <p className="pf-note">
          {signedIn
            ? "The recipient may receive your message in an email notification."
            : "Your draft stays in this browser for up to 24 hours. Nothing is sent until you finish signing in and confirm."}
        </p>
      </form>
    </div>
  );
}

const hydrationSubscribe = () => () => {};
export function Compose(props: {
  recipient: string;
  name: string;
  handle: string;
  signedIn: boolean;
  invite?: boolean;
  opportunities?: Row<"opportunities">[];
}) {
  const hydrated = useSyncExternalStore(
    hydrationSubscribe,
    () => true,
    () => false,
  );
  if (!hydrated) return <p className="pf-note">Opening your introduction…</p>;
  return <LoadedCompose {...props} />;
}
function LoadedCompose(props: {
  recipient: string;
  name: string;
  handle: string;
  signedIn: boolean;
  invite?: boolean;
  opportunities?: Row<"opportunities">[];
}) {
  const [draft] = useState(() => {
    try {
      const value = parseDraft(localStorage.getItem(draftKey));
      if (!value) localStorage.removeItem(draftKey);
      return value?.recipient === props.recipient ? value : null;
    } catch {
      return null;
    }
  });
  return <ComposeEditor {...props} draft={draft} />;
}
