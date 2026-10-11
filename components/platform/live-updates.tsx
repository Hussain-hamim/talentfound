"use client";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { load } from "@/lib/platform/api";

const LiveContext = createContext({
  userId: null as string | null,
  revision: 0,
  unread: 0,
  refreshNotifications: async () => {},
});
export const useLiveUpdates = () => useContext(LiveContext);
export function LiveUpdates({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const path = useRef(pathname);
  const [userId, setUserId] = useState<string | null>(null);
  const [revision, setRevision] = useState(0);
  const [unread, setUnread] = useState(0);
  const countVersion = useRef(0);
  const authUser = useRef<string | null>(null);
  useEffect(() => {
    path.current = pathname;
  }, [pathname]);
  const refreshNotifications = useCallback(async () => {
    const version = ++countVersion.current;
    if (!userId) {
      setUnread(0);
      return;
    }
    try {
      const result = await load<{ unread: number }>("view=notificationCount");
      if (version === countVersion.current) setUnread(result.unread);
    } catch {
      /* Reconcile on reconnect/focus; never interrupt the current task. */
    }
  }, [userId]);
  useEffect(() => {
    const db = createClient();
    const version = countVersion;
    const {
      data: { subscription },
    } = db.auth.onAuthStateChange((_event, session) => {
      const nextUser = session?.user.id || null;
      if (authUser.current === nextUser) return;
      authUser.current = nextUser;
      ++countVersion.current;
      setUserId(nextUser);
      setUnread(0);
    });
    return () => {
      ++version.current;
      subscription.unsubscribe();
    };
  }, []);
  useEffect(() => {
    const db = createClient();
    let alive = true;
    let publicDirty = false;
    let privateDirty = true;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const flush = () => {
      timer = undefined;
      if (!alive || document.visibilityState !== "visible") return;
      if (publicDirty) {
        publicDirty = false;
        // RSC refresh preserves React state, scroll, open dialogs and unsent forms.
        if (
          path.current === "/" ||
          path.current === "/developers" ||
          /^\/developers\/[^/]+$/.test(path.current) ||
          path.current === "/dashboard/talent"
        )
          router.refresh();
      }
      if (privateDirty) {
        privateDirty = false;
        setRevision((v) => v + 1);
        void refreshNotifications();
      }
    };
    const schedule = () => {
      if (!timer) timer = setTimeout(flush, 300);
    };
    const reconcile = () => {
      publicDirty = true;
      privateDirty = true;
      schedule();
    };
    let channel = db
      .channel(`talentfound-live:${userId || "guest"}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "realtime_signals",
          filter: "scope=eq.discovery",
        },
        () => {
          publicDirty = true;
          schedule();
        },
      );
    if (userId)
      channel = channel.on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "realtime_signals",
          filter: `owner_id=eq.${userId}`,
        },
        () => {
          privateDirty = true;
          schedule();
        },
      );
    channel.subscribe((status) => {
      if (status === "SUBSCRIBED") reconcile();
    });
    schedule();
    const fallback = setInterval(reconcile, 60000);
    window.addEventListener("online", reconcile);
    window.addEventListener("focus", reconcile);
    document.addEventListener("visibilitychange", reconcile);
    return () => {
      alive = false;
      if (timer) clearTimeout(timer);
      clearInterval(fallback);
      window.removeEventListener("online", reconcile);
      window.removeEventListener("focus", reconcile);
      document.removeEventListener("visibilitychange", reconcile);
      void db.removeChannel(channel);
    };
  }, [userId, router, refreshNotifications]);
  return (
    <LiveContext.Provider
      value={{ userId, revision, unread, refreshNotifications }}
    >
      {children}
    </LiveContext.Provider>
  );
}
