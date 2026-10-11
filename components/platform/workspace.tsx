"use client";
import Link from "next/link";
import {
  useState,
  useEffect,
  useCallback,
  useRef,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  UserRound,
  Layers3,
  Search,
  Bookmark,
  BriefcaseBusiness,
  Mail,
  MessageCircle,
  ChartNoAxesCombined,
  Settings,
  ArrowUpRight,
  Check,
  Plus,
  LogOut,
  Bell,
} from "lucide-react";
import { Brand } from "@/components/brand";
import type { Analytics, WorkspaceData } from "@/lib/platform/types";
import { load, mutate } from "@/lib/platform/api";
import { createClient } from "@/lib/supabase/client";
import { supabaseConfig } from "@/lib/supabase/config";
import { Avatar, Empty, Heading, Status, date } from "./ui";
import { ProfileEditor, SettingsPanel } from "./workspace-profile";
import {
  ProjectsPanel,
  OpportunitiesPanel,
  ShortlistsPanel,
  InvitationsPanel,
} from "./workspace-work";
import { MessagesPanel } from "./messages";
import { NotificationBell, NotificationsPanel } from "./notifications";
import { useLiveUpdates } from "./live-updates";
export type Save = (
  action: string,
  input: unknown,
  message?: string,
) => Promise<boolean>;
export function Workspace({
  initialData,
  section = "overview",
  conversationId,
  children,
}: {
  initialData: WorkspaceData;
  section?: string;
  conversationId?: string;
  children?: ReactNode;
}) {
  const [data, setData] = useState(initialData);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);
  const router = useRouter();
  const role = data.account.active_workspace;
  const recruiter = role === "recruiter";
  const unread = data.inbox.reduce((n, c) => n + c.unread, 0);
  const refreshVersion = useRef(0);
  const refresh = useCallback(async () => {
    const version = ++refreshVersion.current;
    const snapshot = await load<WorkspaceData>("view=workspace");
    if (version === refreshVersion.current) setData(snapshot);
  }, []);
  const { revision } = useLiveUpdates();
  useEffect(() => {
    void refresh().catch(() => {});
  }, [revision, refresh]);
  const save: Save = async (action, input, success = "Changes saved.") => {
    setPending(true);
    setError("");
    setMessage("");
    try {
      const result = await mutate<{ avatar_path?: string } | null>(
        action,
        input,
      );
      if (action === "avatar" && result?.avatar_path) {
        const avatarPath = result.avatar_path;
        // Render the confirmed database value without waiting for unrelated workspace queries.
        ++refreshVersion.current;
        setData((current) => ({
          ...current,
          member: { ...current.member, avatar_path: avatarPath },
        }));
      } else {
        await refresh();
      }
      setMessage(success);
      return true;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save.");
      return false;
    } finally {
      setPending(false);
    }
  };
  async function switchRole(value: string) {
    if (value === "developer" ? !data.developer : !data.recruiter) {
      router.push(`/onboarding?role=${value}`);
      return;
    }
    if (await save("workspace", { role: value }, "")) {
      router.push("/dashboard");
      router.refresh();
    }
  }
  const nav = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    ...(!recruiter
      ? [
          { id: "profile", label: "My profile", icon: UserRound },
          { id: "projects", label: "My projects", icon: Layers3 },
        ]
      : [{ id: "talent", label: "Explore talent", icon: Search }]),
    {
      id: "shortlists",
      label: recruiter ? "Shortlists" : "Saved people",
      icon: Bookmark,
    },
    {
      id: "opportunities",
      label: recruiter ? "Opportunities" : "Collaborations",
      icon: BriefcaseBusiness,
    },
    { id: "invitations", label: "Invitations", icon: Mail },
    { id: "messages", label: "Messages", icon: MessageCircle },
    { id: "notifications", label: "Notifications", icon: Bell },
    ...(!recruiter
      ? [
          {
            id: "analytics",
            label: "Profile analytics",
            icon: ChartNoAxesCombined,
          },
        ]
      : [{ id: "profile", label: "Company / project", icon: UserRound }]),
    { id: "settings", label: "Settings", icon: Settings },
  ];
  return (
    <div className="platform platform-shell">
      <aside className="workspace-sidebar">
        <Brand />
        <div className="workspace-selector">
          <label htmlFor="workspace">Your workspace</label>
          <select
            id="workspace"
            value={role}
            disabled={pending}
            onChange={(e) => switchRole(e.target.value)}
          >
            <option value="developer">
              Developer{!data.developer ? " · enable" : ""}
            </option>
            <option value="recruiter">
              Recruiter{!data.recruiter ? " · enable" : ""}
            </option>
          </select>
        </div>
        <nav className="workspace-nav" aria-label="Workspace navigation">
          {nav.map((item) => (
            <Link
              className={section === item.id ? "active" : ""}
              aria-current={section === item.id ? "page" : undefined}
              key={item.id}
              href={
                item.id === "overview" ? "/dashboard" : `/dashboard/${item.id}`
              }
            >
              <item.icon size={17} />
              {item.label}
              {item.id === "messages" && unread > 0 && (
                <span className="pf-count">{unread}</span>
              )}
            </Link>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <Link href="/developers">Meet the community ↗</Link>
          {data.developer && (
            <Link href={`/developers/${data.developer.handle}`}>
              View my public profile ↗
            </Link>
          )}
          <Link href="/">Back to TalentFound</Link>
        </div>
      </aside>
      <div className="workspace-body">
        <header className="workspace-topbar">
          <span>
            {recruiter
              ? "Find the people who move your ideas forward."
              : "A little progress. A new possibility."}
          </span>
          <div className="workspace-account">
            <NotificationBell />
            <Avatar
              name={data.member.name}
              src={
                data.member.avatar_path
                  ? `${supabaseConfig().url}/storage/v1/object/public/avatars/${data.member.avatar_path}`
                  : null
              }
            />
            <span>{data.member.name.split(" ")[0]}</span>
            <button
              className="pf-button small"
              aria-label="Log out"
              onClick={async () => {
                const { error } = await createClient().auth.signOut();
                if (error) {
                  setError(error.message);
                  return;
                }
                router.push("/login");
                router.refresh();
              }}
            >
              <LogOut size={14} />
            </button>
          </div>
        </header>
        <main id="main-content" className="workspace-main">
          <Status error={error} message={message} />
          {section === "overview" && <Overview data={data} />}
          {section === "notifications" && <NotificationsPanel />}
          {section === "profile" && (
            <ProfileEditor
              key={role}
              data={data}
              save={save}
              pending={pending}
            />
          )}
          {section === "projects" && (
            <ProjectsPanel data={data} save={save} pending={pending} />
          )}
          {section === "opportunities" && (
            <OpportunitiesPanel data={data} save={save} pending={pending} />
          )}
          {section === "shortlists" && (
            <ShortlistsPanel data={data} save={save} pending={pending} />
          )}
          {section === "invitations" && (
            <InvitationsPanel data={data} save={save} pending={pending} />
          )}
          {section === "messages" && (
            <MessagesPanel
              key={conversationId || "inbox"}
              data={data}
              conversationId={conversationId}
              refresh={refresh}
            />
          )}
          {section === "analytics" && (
            <AnalyticsPanel initial={data.analytics} />
          )}
          {section === "settings" && (
            <SettingsPanel data={data} save={save} pending={pending} />
          )}
          {section === "talent" && children}
        </main>
      </div>
    </div>
  );
}
function Overview({ data }: { data: WorkspaceData }) {
  const recruiter = data.account.active_workspace === "recruiter";
  const d = data.developer;
  const checks = [
    {
      label: "Write your introduction",
      done: !!d?.bio,
      href: "/dashboard/profile",
    },
    {
      label: "Add your first project",
      done: data.projects.some((p) => p.published),
      href: "/dashboard/projects",
    },
    {
      label: "Put a face to your name",
      done: !!data.member.avatar_path,
      href: "/dashboard/profile",
    },
    {
      label: "Share your availability",
      done: d?.start_weeks !== null && d?.start_weeks !== undefined,
      href: "/dashboard/profile",
    },
    {
      label: "Add a link to your work",
      done: !!(d?.website || d?.github),
      href: "/dashboard/profile",
    },
  ];
  const percent = Math.round(
    ((checks.filter((c) => c.done).length + 1) / 6) * 100,
  );
  const stats = recruiter
    ? [
        [
          "Active opportunities",
          data.opportunities.filter((o) => o.status === "active").length,
          "Ideas ready for the right people",
        ],
        ["Saved people", data.candidates.length, "Your own curated shortlist"],
        ["Conversations", data.inbox.length, "A good place to start"],
        [
          "Hired",
          data.candidates.filter((c) => c.stage === "hired").length,
          "Your private pipeline",
        ],
      ]
    : [
        ["Profile views", data.analytics.views, "Over the last 30 days"],
        [
          "Project clicks",
          data.analytics.projectClicks,
          "Interest in your work",
        ],
        [
          "Conversations",
          data.analytics.conversations,
          "New in the last 30 days",
        ],
        ["Invitations", data.analytics.invitations, "New in the last 30 days"],
      ];
  return (
    <>
      <Heading
        eyebrow={
          recruiter
            ? "YOUR NEXT GREAT TEAM STARTS HERE"
            : "YOUR WORK. YOUR NEXT CHAPTER."
        }
        title={`Good to see you, ${data.member.name.split(" ")[0]}.`}
        description={
          recruiter
            ? "A clear view of your search, conversations, and next steps."
            : "Make a little room for the opportunities ahead."
        }
      >
        <Link
          className="pf-button primary"
          href={
            recruiter
              ? "/dashboard/talent"
              : d
                ? `/developers/${d.handle}`
                : "/onboarding"
          }
        >
          {recruiter ? "Find your people" : "View public profile"}
          <ArrowUpRight size={15} />
        </Link>
      </Heading>
      <div className="pf-stats">
        {stats.map(([label, value, help]) => (
          <div className="pf-stat" key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
            <small>{help}</small>
          </div>
        ))}
      </div>
      <div className="pf-grid">
        <div className="pf-stack">
          {!recruiter ? (
            <section className="pf-panel">
              <div className="pf-panel-top">
                <h2>A profile that feels like you.</h2>
                <span className="pf-tag red">{percent}% complete</span>
              </div>
              <p className="pf-muted">
                You’re already discoverable. A few details help the right people
                understand what you bring.
              </p>
              <div className="pf-progress">
                <span style={{ width: `${percent}%` }} />
              </div>
              <div className="pf-checklist">
                {checks.map((c) => (
                  <Link
                    key={c.label}
                    href={c.href}
                    className={c.done ? "done" : ""}
                  >
                    {c.done ? <Check size={15} /> : <Plus size={15} />}
                    <span>{c.label}</span>
                    <ArrowUpRight size={13} style={{ marginLeft: "auto" }} />
                  </Link>
                ))}
              </div>
            </section>
          ) : (
            <section className="pf-panel">
              <div className="pf-panel-top">
                <h2>Your active opportunities</h2>
                <Link className="pf-link" href="/dashboard/opportunities">
                  Manage ↗
                </Link>
              </div>
              {data.opportunities.filter((o) => o.status === "active")
                .length ? (
                data.opportunities
                  .filter((o) => o.status === "active")
                  .slice(0, 4)
                  .map((o) => (
                    <div className="pf-row" key={o.id}>
                      <div>
                        <h3>{o.title}</h3>
                        <small>
                          {o.engagement} · {o.company}
                        </small>
                      </div>
                      <span className="pf-tag">
                        {
                          data.invitations.filter(
                            (i) => i.opportunity_id === o.id,
                          ).length
                        }{" "}
                        invited
                      </span>
                    </div>
                  ))
              ) : (
                <Empty
                  title="Make the first introduction."
                  description="A clear brief helps a developer see where they can make a difference."
                  href="/dashboard/opportunities"
                  label="Create an opportunity"
                />
              )}
            </section>
          )}
          <section className="pf-panel">
            <div className="pf-panel-top">
              <h2>Recent invitations</h2>
              <Link className="pf-link" href="/dashboard/invitations">
                View all ↗
              </Link>
            </div>
            {data.invitations.length ? (
              data.invitations.slice(0, 3).map((i) => (
                <div className="pf-row" key={i.id}>
                  <div>
                    <h3>{(i.brief as { title: string }).title}</h3>
                    <small>
                      {date(i.created_at)} ·{" "}
                      {i.sender_id === data.member.id ? "Sent" : "Received"}
                    </small>
                  </div>
                  <span className="pf-tag">{i.status}</span>
                </div>
              ))
            ) : (
              <p className="pf-muted">
                When a collaboration starts taking shape, you’ll find it here.
              </p>
            )}
          </section>
        </div>
        <div className="pf-stack">
          <section className="pf-panel">
            <div className="pf-panel-top">
              <h2>Your conversations</h2>
              <Link className="pf-link" href="/dashboard/messages">
                Open inbox ↗
              </Link>
            </div>
            {data.inbox.length ? (
              data.inbox.slice(0, 5).map((c) => (
                <Link
                  href={`/dashboard/messages/${c.id}`}
                  key={c.id}
                  className="pf-row"
                >
                  <div className="pf-row-main">
                    <Avatar name={c.name} path={c.avatar_path} />
                    <div>
                      <h3>{c.name}</h3>
                      <small>{c.last_message?.slice(0, 65)}</small>
                    </div>
                  </div>
                  {c.unread > 0 && <span className="pf-count">{c.unread}</span>}
                </Link>
              ))
            ) : (
              <Empty
                title="Good things start with hello."
                description="Find someone whose work speaks to you and start a conversation."
                href="/developers"
                label="Meet the builders"
              />
            )}
          </section>
          {!(data.developer && data.recruiter) && (
            <section
              className="pf-panel"
              style={{ background: "linear-gradient(140deg,#30201e,#1c1a1c)" }}
            >
              <span className="pf-eyebrow">
                ONE ACCOUNT. MORE POSSIBILITIES.
              </span>
              <h2 style={{ font: "400 26px Georgia,serif", margin: "18px 0" }}>
                Your next chapter can look different.
              </h2>
              <p className="pf-muted">
                {recruiter
                  ? "You can share your own work, too. Add a developer profile whenever you’re ready."
                  : "Building a team or exploring an idea? Your recruiter workspace is a switch away."}
              </p>
              <Link
                className="pf-link"
                style={{ display: "inline-block", marginTop: 20 }}
                href={`/onboarding?role=${recruiter ? "developer" : "recruiter"}`}
              >
                Explore another side of you ↗
              </Link>
            </section>
          )}
        </div>
      </div>
    </>
  );
}
function AnalyticsPanel({ initial }: { initial: Analytics }) {
  const [data, setData] = useState(initial);
  const [days, setDays] = useState(30);
  const [error, setError] = useState("");
  const { revision } = useLiveUpdates();
  useEffect(() => {
    let active = true;
    void load<Analytics>(`view=analytics&days=${days}`)
      .then((snapshot) => {
        if (active) {
          setData(snapshot);
          setError("");
        }
      })
      .catch((e) => {
        if (active)
          setError(
            e instanceof Error ? e.message : "Could not load analytics.",
          );
      });
    return () => {
      active = false;
    };
  }, [days, revision]);
  const max = Math.max(1, ...data.daily.map((d) => d.views));
  function change(n: number) {
    setDays(n);
  }
  return (
    <>
      <Heading
        eyebrow="A WINDOW INTO YOUR REACH"
        title="Your work is finding people."
        description="Understand what’s getting noticed, one introduction at a time."
      />
      <div className="pf-tabs">
        {[7, 30].map((n) => (
          <button
            className={days === n ? "active" : ""}
            onClick={() => change(n)}
            key={n}
          >
            Last {n} days
          </button>
        ))}
      </div>
      <Status error={error} />
      <div className="pf-stats">
        {[
          ["Profile views", data.views],
          ["Project clicks", data.projectClicks],
          ["New conversations", data.conversations],
          ["Invitations", data.invitations],
        ].map(([name, count]) => (
          <div className="pf-stat" key={name}>
            <span>{name}</span>
            <strong>{count}</strong>
          </div>
        ))}
      </div>
      <div className="pf-grid">
        <section className="pf-panel">
          <h2>Profile views over time</h2>
          {data.daily.length ? (
            <>
              <div
                className="pf-chart"
                role="img"
                aria-label={data.daily
                  .map(
                    (d) =>
                      `${d.day}: ${d.views} views, ${d.visitors} daily unique visitors`,
                  )
                  .join("; ")}
              >
                {data.daily.map((d) => (
                  <div
                    key={d.day}
                    className="pf-bar"
                    style={{ height: `${Math.max(2, (d.views / max) * 100)}%` }}
                    title={`${d.day}: ${d.views} views · ${d.visitors} visitors`}
                  />
                ))}
              </div>
              <div
                className="pf-actions"
                style={{ justifyContent: "space-between" }}
              >
                <span className="pf-note">{data.daily[0]?.day}</span>
                <span className="pf-note">{data.daily.at(-1)?.day}</span>
              </div>
            </>
          ) : (
            <Empty
              title="A fresh start."
              description="Your profile views will appear here as people discover your work."
            />
          )}
          <p className="pf-note" style={{ marginTop: 20 }}>
            Repeat visits within 30 minutes count once. Your own visits are
            excluded. Daily unique visitors are distinct browsers or signed-in
            accounts within each day.
          </p>
        </section>
        <section className="pf-panel">
          <h2>People who stopped by</h2>
          <p className="pf-note">
            Only members who choose to share their identity appear here.
            Everyone else contributes to aggregate counts.
          </p>
          {data.visitors.length ? (
            data.visitors.map((v) => (
              <div className="pf-row" key={v.id}>
                <div className="pf-row-main">
                  <Avatar name={v.name} path={v.avatar_path} />
                  <div>
                    <h3>{v.name}</h3>
                    <small>{date(v.viewed_at)}</small>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="pf-muted" style={{ marginTop: 24 }}>
              No identifiable visitors in this period.
            </p>
          )}
        </section>
      </div>
    </>
  );
}
