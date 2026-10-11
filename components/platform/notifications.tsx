"use client";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Bell,
  Check,
  CheckCheck,
  MessageCircle,
  Mail,
  Star,
} from "lucide-react";
import { useLiveUpdates } from "./live-updates";
import { load, mutate } from "@/lib/platform/api";
import type { Row } from "@/lib/platform/types";
import { Empty, Heading, Status } from "./ui";
import "@/app/notifications.css";
export type NotificationItem = Row<"notifications"> & { href: string };
export function NotificationBell() {
  const { userId, unread } = useLiveUpdates();
  if (!userId) return null;
  return (
    <Link
      className="notification-bell"
      href="/dashboard/notifications"
      aria-label={`Notifications${unread ? `, ${unread} unread` : ""}`}
    >
      <Bell size={20} aria-hidden="true" />
      {unread > 0 && (
        <span className="notification-badge" aria-hidden="true">
          {unread > 99 ? "99+" : unread}
        </span>
      )}
    </Link>
  );
}
export function NotificationsPanel() {
  const { revision, refreshNotifications } = useLiveUpdates();
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [more, setMore] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const limit = useRef(30);
  const version = useRef(0);
  const refresh = useCallback(async () => {
    const current = ++version.current;
    try {
      const result = await load<{ items: NotificationItem[]; more: boolean }>(
        `view=notifications&limit=${limit.current}`,
      );
      if (current !== version.current) return;
      setItems(result.items);
      setMore(result.more);
      setError("");
    } catch (e) {
      if (current === version.current)
        setError(
          e instanceof Error ? e.message : "Could not load notifications.",
        );
    } finally {
      if (current === version.current) setLoading(false);
    }
  }, []);
  useEffect(() => {
    const requestVersion = version;
    void refresh();
    return () => {
      ++requestVersion.current;
    };
  }, [revision, refresh]);
  async function markRead(id?: string) {
    setBusy(true);
    try {
      await mutate("readNotifications", id ? { id } : {});
      await Promise.all([refresh(), refreshNotifications()]);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Could not update notifications.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <Heading
        eyebrow="KEEP UP WITH YOUR PEOPLE"
        title="Your notifications."
        description="Conversations, invitations, and community feedback, all in one place."
      />
      <div className="pf-search-results">
        <span className="pf-note">Updates appear here as they happen.</span>
        <button
          className="pf-button small"
          disabled={busy || !items.some((n) => !n.read_at)}
          onClick={() => void markRead()}
        >
          <CheckCheck size={16} /> Mark all as read
        </button>
      </div>
      <Status error={error} />
      {loading ? (
        <p role="status">Loading notifications…</p>
      ) : items.length ? (
        <div className="notification-list">
          {items.map((n) => {
            const Icon =
              n.kind === "message"
                ? MessageCircle
                : n.kind.startsWith("review")
                  ? Star
                  : Mail;
            return (
              <article
                key={n.id}
                className={`notification-item ${n.read_at ? "" : "unread"}`}
              >
                <span className="notification-icon">
                  <Icon size={20} aria-hidden="true" />
                </span>
                <Link
                  href={n.href}
                  onClick={() => {
                    if (!n.read_at) void markRead(n.id);
                  }}
                >
                  <h2>{n.title}</h2>
                  <p>{n.body}</p>
                  <time dateTime={n.created_at}>
                    {new Date(n.created_at).toLocaleString(undefined, {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </time>
                </Link>
                {!n.read_at && (
                  <button
                    className="pf-button small"
                    disabled={busy}
                    onClick={() => void markRead(n.id)}
                    aria-label={`Mark as read: ${n.title}`}
                  >
                    <Check size={16} />
                  </button>
                )}
              </article>
            );
          })}
        </div>
      ) : (
        <Empty
          title="You’re all caught up."
          description="New messages, project invitations, and community feedback will appear here."
          href="/developers"
          label="Explore talent"
        />
      )}
      {more && (
        <button
          className="pf-button"
          style={{ marginTop: 24 }}
          disabled={busy}
          onClick={async () => {
            setBusy(true);
            limit.current += 30;
            await refresh();
            setBusy(false);
          }}
        >
          Show more notifications
        </button>
      )}
    </>
  );
}
