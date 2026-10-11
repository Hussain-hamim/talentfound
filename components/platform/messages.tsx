"use client";
import Link from "next/link";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";
import { Send, ArrowLeft, ShieldBan, Flag } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { load, mutate } from "@/lib/platform/api";
import { loadMessageWindow } from "@/lib/platform/message-window";
import type { Row, WorkspaceData } from "@/lib/platform/types";
import { Avatar, Empty, Heading, Status, Badge } from "./ui";
function ordered(messages: Row<"messages">[]) {
  return [...new Map(messages.map((m) => [m.id, m])).values()].sort(
    (a, b) =>
      a.created_at.localeCompare(b.created_at) || a.id.localeCompare(b.id),
  );
}
export function MessagesPanel({
  data,
  conversationId,
  refresh,
}: {
  data: WorkspaceData;
  conversationId?: string;
  refresh: () => Promise<void>;
}) {
  const current = data.inbox.find((c) => c.id === conversationId);
  const [messages, setMessages] = useState<Row<"messages">[]>([]);
  const [body, setBody] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [more, setMore] = useState(false);
  const [offline, setOffline] = useState(false);
  const [report, setReport] = useState(false);
  const clientId = useRef(crypto.randomUUID());
  const end = useRef<HTMLDivElement>(null);
  const newest = useRef<Row<"messages"> | null>(null);
  const refreshRef = useRef(refresh);
  useEffect(() => {
    refreshRef.current = refresh;
  }, [refresh]);
  const markRead = useCallback(async () => {
    if (
      conversationId &&
      document.visibilityState === "visible" &&
      document.hasFocus()
    ) {
      await mutate("read", { conversation: conversationId });
      await refreshRef.current();
    }
  }, [conversationId]);
  useEffect(() => {
    if (!conversationId) return;
    let alive = true;
    async function sync() {
      try {
        const known = newest.current;
        const rows = await loadMessageWindow<Row<"messages">>(
          (before) =>
            load<Row<"messages">[]>(
              `view=messages&conversation=${conversationId}${before ? `&before=${encodeURIComponent(before.created_at)}&beforeId=${before.id}` : ""}`,
            ),
          known,
        );
        if (!alive) return;
        if (rows[0] && (!known || rows[0].created_at >= known.created_at))
          newest.current = rows[0];
        setMessages((previous) => ordered([...previous, ...rows]));
        if (!known) setMore(rows.length === 40);
        setLoading(false);
        await markRead();
      } catch (e) {
        if (alive) {
          setError(e instanceof Error ? e.message : "Could not load messages.");
          setLoading(false);
        }
      }
    }
    void sync();
    const db = createClient();
    const channel = db
      .channel(`conversation:${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        () => {
          void sync();
        },
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "invitations",
          filter: `conversation_id=eq.${conversationId}`,
        },
        () => {
          void refreshRef.current();
        },
      )
      .subscribe((status) => {
        if (!alive) return;
        setOffline(status === "CHANNEL_ERROR" || status === "TIMED_OUT");
        if (status === "SUBSCRIBED") void sync();
      });
    const interval = setInterval(() => {
      if (document.visibilityState === "visible") void sync();
    }, 15000);
    const onVisible = () => {
      if (document.visibilityState === "visible") void sync();
    };
    window.addEventListener("focus", onVisible);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      alive = false;
      clearInterval(interval);
      void db.removeChannel(channel);
      window.removeEventListener("focus", onVisible);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [conversationId, markRead]);
  useEffect(() => {
    end.current?.scrollIntoView({ block: "nearest" });
  }, [messages.length]);
  async function send(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!current) return;
    setPending(true);
    setError("");
    try {
      await mutate("message", {
        recipient: current.other_id,
        body,
        client_id: clientId.current,
      });
      clientId.current = crypto.randomUUID();
      setBody("");
      const rows = await load<Row<"messages">[]>(
        `view=messages&conversation=${current.id}`,
      );
      setMessages((previous) => ordered([...previous, ...rows]));
      await markRead();
      await refresh();
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Message not sent. Retry when you’re ready.",
      );
    } finally {
      setPending(false);
    }
  }
  async function older() {
    const first = messages[0];
    if (!first || !conversationId) return;
    try {
      const rows = await load<Row<"messages">[]>(
        `view=messages&conversation=${conversationId}&before=${encodeURIComponent(first.created_at)}&beforeId=${first.id}`,
      );
      setMessages((old) => ordered([...rows, ...old]));
      setMore(rows.length === 40);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Could not load older messages.",
      );
    }
  }
  async function block() {
    if (!current) return;
    setPending(true);
    try {
      await mutate("block", { member: current.other_id, blocked: true });
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not block member.");
    } finally {
      setPending(false);
    }
  }
  return (
    <>
      <Heading
        eyebrow="A GOOD CONVERSATION GOES A LONG WAY"
        title="Your people, one hello away."
        description="Private conversations and possibilities worth exploring."
      />
      <Status error={error} />
      {offline && (
        <p className="pf-note">
          Reconnecting to live updates. Messages will refresh automatically.
        </p>
      )}
      <div className={`pf-message-layout ${current ? "has-conversation" : ""}`}>
        <aside className="pf-inbox">
          <h2>
            Messages <span className="pf-note">({data.inbox.length})</span>
          </h2>
          {data.inbox.length ? (
            data.inbox.map((c) => (
              <Link
                href={`/dashboard/messages/${c.id}`}
                key={c.id}
                className={conversationId === c.id ? "active" : ""}
              >
                <div className="pf-row-main">
                  <Avatar name={c.name} path={c.avatar_path} />
                  <div style={{ flex: 1 }}>
                    {c.name}
                    {c.unread > 0 && (
                      <span className="pf-count" style={{ float: "right" }}>
                        {c.unread}
                      </span>
                    )}
                  </div>
                </div>
                <p>{c.last_message || "Start a conversation"}</p>
              </Link>
            ))
          ) : (
            <Empty
              title="An open door."
              description="Your conversations will live here."
              href="/developers"
              label="Meet someone"
            />
          )}
        </aside>
        {current ? (
          <section className="pf-conversation">
            <header className="pf-conversation-header">
              <div className="pf-row-main">
                <Link
                  href="/dashboard/messages"
                  className="pf-mobile-nav"
                  aria-label="Back to inbox"
                >
                  <ArrowLeft size={18} />
                </Link>
                <Avatar name={current.name} path={current.avatar_path} />
                <div>
                  <h2 style={{ fontSize: 15 }}>{current.name}</h2>
                  <span className="pf-note">
                    {current.blocked
                      ? "Conversation blocked"
                      : "A TalentFound conversation"}
                  </span>
                </div>
              </div>
              <div className="pf-actions">
                <button
                  className="pf-button small"
                  aria-label="Report member"
                  onClick={() => setReport(!report)}
                >
                  <Flag size={13} />
                </button>
                {!current.blocked && (
                  <button
                    className="pf-button small"
                    disabled={pending}
                    onClick={block}
                    title="Block this member"
                  >
                    <ShieldBan size={13} />
                    Block
                  </button>
                )}
              </div>
            </header>
            {report && (
              <form
                method="post"
                className="pf-panel pf-form"
                onSubmit={async (e) => {
                  e.preventDefault();
                  try {
                    await mutate("report", {
                      target_type: "member",
                      target_id: current.other_id,
                      reason: String(
                        new FormData(e.currentTarget).get("reason"),
                      ),
                    });
                    setReport(false);
                  } catch (e) {
                    setError(
                      e instanceof Error
                        ? e.message
                        : "Could not submit report.",
                    );
                  }
                }}
              >
                <label className="pf-field">
                  What happened?
                  <textarea
                    name="reason"
                    required
                    minLength={10}
                    maxLength={2000}
                  />
                </label>
                <button className="pf-button">Submit report</button>
              </form>
            )}
            <div className="pf-messages" aria-live="polite" aria-busy={loading}>
              {more && (
                <button className="pf-button small" onClick={older}>
                  Load earlier messages
                </button>
              )}
              {loading && <p className="pf-note">Loading your conversation…</p>}
              {messages.map((m) => {
                const invitation = m.invitation_id
                  ? data.invitations.find((i) => i.id === m.invitation_id)
                  : null;
                const brief = invitation?.brief as
                  | { title: string; description: string; budget: string }
                  | undefined;
                return (
                  <article
                    className={`pf-bubble ${m.sender_id === data.member.id ? "mine" : ""}`}
                    key={m.id}
                  >
                    <p>{m.body}</p>
                    {invitation && brief && (
                      <div className="pf-brief">
                        <h3>{brief.title}</h3>
                        <p>{brief.description}</p>
                        <p>{brief.budget}</p>
                        <div className="pf-actions" style={{ marginTop: 10 }}>
                          <Badge status={invitation.status} />
                          <Link
                            className="pf-link"
                            href="/dashboard/invitations"
                          >
                            View invitation ↗
                          </Link>
                        </div>
                      </div>
                    )}
                    <small>
                      {new Date(m.created_at).toLocaleString("en", {
                        month: "short",
                        day: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </small>
                  </article>
                );
              })}
              <div ref={end} />
            </div>
            {current.blocked ? (
              <p className="pf-note" style={{ padding: 20 }}>
                Messaging is unavailable while either member has blocked the
                other. Manage your blocks in Settings.
              </p>
            ) : (
              <form method="post" className="pf-composer" onSubmit={send}>
                <label className="sr-only" htmlFor="chat-message">
                  Your message
                </label>
                <textarea
                  id="chat-message"
                  required
                  maxLength={4000}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Keep the conversation going…"
                />
                <button
                  disabled={pending || !body.trim()}
                  className="pf-button primary"
                  aria-label="Send message"
                >
                  <Send size={16} />
                </button>
              </form>
            )}
          </section>
        ) : (
          <div style={{ display: "grid", placeItems: "center", padding: 30 }}>
            <Empty
              title={
                conversationId
                  ? "Conversation unavailable."
                  : "A little hello. A lot of possibility."
              }
              description={
                conversationId
                  ? "This conversation isn’t available to your account."
                  : "Choose a conversation, or meet someone new in the community."
              }
              href="/developers"
              label="Explore talent"
            />
          </div>
        )}
      </div>
    </>
  );
}
