"use client";
import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bookmark, Flag } from "lucide-react";
import { mutate } from "@/lib/platform/api";
import { Field, Status } from "./ui";
export function SavePerson({
  id,
  signedIn,
  handle,
  iconOnly = false,
}: {
  id: string;
  signedIn: boolean;
  handle: string;
  iconOnly?: boolean;
}) {
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const router = useRouter();
  return (
    <>
      <button
        disabled={pending}
        className={iconOnly ? "developer-save" : "pf-button"}
        aria-label={
          saved ? "Saved to your shortlist" : "Save developer to shortlist"
        }
        aria-pressed={saved}
        onClick={async () => {
          if (!signedIn) {
            router.push(
              `/login?next=${encodeURIComponent(`/developers/${handle}`)}`,
            );
            return;
          }
          setPending(true);
          try {
            await mutate("savePerson", { developer_id: id });
            setSaved(true);
          } catch (e) {
            setError(e instanceof Error ? e.message : "Could not save.");
          } finally {
            setPending(false);
          }
        }}
      >
        <Bookmark size={14} />
        {!iconOnly && (saved ? "Saved to your shortlist" : "Save to shortlist")}
      </button>
      <Status error={error} />
    </>
  );
}
export function ReviewEditor({
  developerId,
  signedIn,
  handle,
  initial,
}: {
  developerId: string;
  signedIn: boolean;
  handle: string;
  initial?: { rating: number; body: string };
}) {
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);
  const router = useRouter();
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setPending(true);
    setError("");
    try {
      await mutate("review", {
        developer_id: developerId,
        rating: Number(f.get("rating")),
        body: String(f.get("body")),
      });
      setMessage("Your community review is published.");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not publish review.");
    } finally {
      setPending(false);
    }
  }
  return (
    <section className="pf-panel" style={{ marginTop: 25 }}>
      <h3>
        {initial ? "Update your community review" : "Share your perspective"}
      </h3>
      <p className="pf-note">
        Reviews are community opinions. A review does not verify a hire,
        identity, or completed project.
      </p>
      {signedIn ? (
        <form
          method="post"
          className="pf-form"
          style={{ marginTop: 20 }}
          onSubmit={submit}
        >
          <Status error={error} message={message} />
          <Field label="Your rating">
            <select name="rating" defaultValue={initial?.rating || 5}>
              {[5, 4, 3, 2, 1].map((n) => (
                <option value={n} key={n}>
                  {n} {n === 1 ? "star" : "stars"}
                </option>
              ))}
            </select>
          </Field>
          <Field
            label="Your review"
            help="Be specific and respectful. At least 10 characters."
          >
            <textarea
              name="body"
              required
              minLength={10}
              maxLength={2000}
              defaultValue={initial?.body}
            />
          </Field>
          <button className="pf-button primary" disabled={pending}>
            {pending
              ? "Publishing…"
              : initial
                ? "Update review"
                : "Publish review"}
          </button>
        </form>
      ) : (
        <Link
          className="pf-button"
          style={{ marginTop: 20 }}
          href={`/login?next=${encodeURIComponent(`/developers/${handle}`)}`}
        >
          Log in to write a review
        </Link>
      )}
    </section>
  );
}
export function ReviewControls({
  id,
  owner,
  developer,
  reply,
}: {
  id: string;
  owner: boolean;
  developer: boolean;
  reply?: string;
}) {
  const [open, setOpen] = useState<"reply" | "report" | null>(null);
  const isReply = open === "reply";
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const router = useRouter();
  return (
    <>
      <div className="pf-actions">
        {developer && (
          <button
            className="pf-button small"
            onClick={() => setOpen(isReply ? null : "reply")}
          >
            Reply
          </button>
        )}
        <button
          className="pf-button small"
          onClick={() => setOpen(open === "report" ? null : "report")}
        >
          <Flag size={11} />
          Report
        </button>
        {owner && (
          <button
            className="pf-button small danger"
            onClick={async () => {
              try {
                await mutate("deleteReview", { id });
                router.refresh();
              } catch (e) {
                setError(
                  e instanceof Error ? e.message : "Could not remove review.",
                );
              }
            }}
          >
            Remove my review
          </button>
        )}
      </div>
      <Status error={error} message={message} />
      {open && (
        <form
          method="post"
          className="pf-form"
          style={{ marginTop: 15 }}
          onSubmit={async (e) => {
            e.preventDefault();
            const body = String(new FormData(e.currentTarget).get("body"));
            try {
              await mutate(
                isReply ? "reply" : "report",
                isReply
                  ? { review_id: id, body }
                  : { target_type: "review", target_id: id, reason: body },
              );
              setOpen(null);
              setMessage(
                isReply ? "Reply published." : "Report submitted for review.",
              );
              router.refresh();
            } catch (e) {
              setError(e instanceof Error ? e.message : "Could not save.");
            }
          }}
        >
          <Field
            label={
              isReply ? "Your reply" : "Why are you reporting this review?"
            }
          >
            <textarea
              name="body"
              required
              minLength={isReply ? 1 : 10}
              maxLength={2000}
              defaultValue={isReply ? reply : ""}
            />
          </Field>
          <button className="pf-button">
            {isReply ? "Publish reply" : "Submit report"}
          </button>
        </form>
      )}
    </>
  );
}
