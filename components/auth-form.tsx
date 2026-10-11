"use client";
import Link from "next/link";
import {
  useState,
  useSyncExternalStore,
  Suspense,
  type FormEvent,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { Arrow, Brand } from "./brand";
import { createClient } from "@/lib/supabase/client";
import { safeNext, supabaseConfig } from "@/lib/supabase/config";
type SocialProvider = "google" | "github";
function authErrorMessage(code: string | null) {
  if (code === "oauth_cancelled")
    return "Sign-in was cancelled. You can try again or continue with email.";
  if (code === "sign_in_failed")
    return "We couldn’t complete sign-in. Please try again in the same browser.";
  return "This sign-in link is invalid or expired. Please try again.";
}
export type AuthMode =
  "login" | "signup" | "forgot-password" | "reset-password";
const copy = {
  login: [
    "GOOD TO SEE YOU AGAIN",
    "Welcome back.",
    "Log in to find your people and pick up where you left off.",
  ],
  signup: [
    "YOUR NEXT CHAPTER STARTS HERE",
    "Find your people.",
    "One account. Your work, your conversations, your next opportunity.",
  ],
  "forgot-password": [
    "LET’S GET YOU BACK IN",
    "Forgot your password?",
    "Enter your email and we’ll send a secure reset link.",
  ],
  "reset-password": [
    "A FRESH START",
    "Set a new password.",
    "At least eight characters. Make it uniquely yours.",
  ],
};
function AuthFormContent({
  mode,
  initialRole = "developer",
}: {
  mode: AuthMode;
  initialRole?: string;
}) {
  const hydrated = useSyncExternalStore(
    subscribeStorage,
    () => true,
    () => false,
  );
  const router = useRouter();
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);
  const [pendingSocial, setPendingSocial] = useState<SocialProvider | null>(
    null,
  );
  const params = useSearchParams();
  const next = safeNext(params.get("next"));
  const [visible, setVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState(
    initialRole === "developer" ? "developer" : "recruiter",
  );

  function destination() {
    return mode === "signup"
      ? `/onboarding?role=${role}&next=${encodeURIComponent(next)}`
      : next;
  }
  async function social(provider: SocialProvider) {
    setPending(true);
    setPendingSocial(provider);
    setError("");
    setMessage("");
    try {
      // A disabled provider otherwise redirects visitors to a raw Auth API error.
      const { url, key } = supabaseConfig();
      const response = await fetch(`${url}/auth/v1/settings`, {
        headers: { apikey: key },
        cache: "no-store",
        signal: AbortSignal.timeout(8000),
      });
      if (!response.ok)
        throw new Error(
          "Sign-in is temporarily unavailable. Please try again.",
        );
      const settings = await response.json();
      if (settings.external?.[provider] !== true)
        throw new Error(
          `${provider === "github" ? "GitHub" : "Google"} sign-in isn’t available yet. Please continue with email.`,
        );
      const { error } = await createClient().auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(destination())}`,
        },
      });
      if (error) throw error;
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Sign-in failed. Please try again.",
      );
      setPending(false);
      setPendingSocial(null);
    }
  }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    setPending(true);
    const form = new FormData(event.currentTarget);
    const db = createClient();
    try {
      const password = String(form.get("password") || "");
      if (mode === "signup") {
        const { data, error } = await db.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: String(form.get("name") || "") },
          },
        });
        if (error) throw error;
        if (!data.session)
          throw new Error(
            "Your account was created, but automatic sign-in is unavailable. Please try logging in. If this continues, contact support.",
          );
        router.push(destination());
        router.refresh();
      } else if (mode === "login") {
        const { error } = await db.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.push(next);
        router.refresh();
      } else if (mode === "forgot-password") {
        const { error } = await db.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
        });
        if (error) throw error;
        setMessage(
          "If an account exists for this email, a reset link is on its way.",
        );
      } else if (mode === "reset-password") {
        if (password !== String(form.get("confirm-password")))
          throw new Error("Your passwords don’t match.");
        const {
          data: { user },
        } = await db.auth.getUser();
        if (!user)
          throw new Error("Open the secure reset link from your email first.");
        const { error } = await db.auth.updateUser({ password });
        if (error) throw error;
        setMessage("Your password has been updated.");
        router.push("/dashboard");
        router.refresh();
      }
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      setPending(false);
    }
  }
  const socialMode = mode === "login" || mode === "signup";
  return (
    <div className={`auth-form-wrap auth-form-${mode}`}>
      <div className="auth-form-brand">
        <Brand />
      </div>
      {!socialMode && (
        <Link className="back-link" href="/login">
          ← Back to log in
        </Link>
      )}
      <div className="eyebrow">{copy[mode][0]}</div>
      <h1>{copy[mode][1]}</h1>
      <p className="auth-description">{copy[mode][2]}</p>
      {mode === "signup" && (
        <fieldset className="role-picker">
          <legend>I’m here to</legend>
          <div>
            {[
              ["developer", "Get discovered"],
              ["recruiter", "Hire or collaborate"],
            ].map(([value, label]) => (
              <label
                className={`role-option ${role === value ? "selected" : ""}`}
                key={value}
              >
                <input
                  type="radio"
                  name="role"
                  value={value}
                  checked={role === value}
                  onChange={() => setRole(value)}
                />
                <span>{label}</span>
              </label>
            ))}
          </div>
        </fieldset>
      )}
      {socialMode && (
        <>
          <div className="social-buttons">
            <button
              type="button"
              disabled={pending || !hydrated}
              aria-label="Continue with GitHub"
              aria-busy={pendingSocial === "github"}
              onClick={() => social("github")}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M12 .75a11.25 11.25 0 0 0-3.558 21.923c.562.104.768-.244.768-.542 0-.267-.01-.975-.015-1.914-3.13.68-3.79-1.51-3.79-1.51-.512-1.3-1.25-1.646-1.25-1.646-1.022-.699.077-.685.077-.685 1.13.08 1.725 1.16 1.725 1.16 1.005 1.723 2.637 1.225 3.28.937.103-.728.394-1.225.715-1.507-2.498-.284-5.124-1.25-5.124-5.566 0-1.23.44-2.234 1.16-3.021-.117-.285-.503-1.43.11-2.98 0 0 .945-.302 3.095 1.154a10.79 10.79 0 0 1 5.634 0c2.148-1.456 3.09-1.154 3.09-1.154.615 1.55.229 2.695.113 2.98.722.787 1.158 1.791 1.158 3.021 0 4.327-2.63 5.279-5.136 5.558.404.349.764 1.04.764 2.096 0 1.513-.014 2.734-.014 3.105 0 .3.203.65.774.54A11.252 11.252 0 0 0 12 .75Z" />
              </svg>
              {pendingSocial === "github" ? "Connecting…" : "GitHub"}
            </button>
            <button
              type="button"
              disabled={pending || !hydrated}
              aria-label="Continue with Google"
              aria-busy={pendingSocial === "google"}
              onClick={() => social("google")}
            >
              <span className="google-icon" aria-hidden="true">
                G
              </span>
              {pendingSocial === "google" ? "Connecting…" : "Google"}
            </button>
          </div>
          <div className="form-divider">
            <span />
            or continue with email
            <span />
          </div>
        </>
      )}
      <form method="post" onSubmit={submit}>
        {mode === "signup" && (
          <div className="form-field">
            <label htmlFor="name">Full name</label>
            <input
              id="name"
              name="name"
              required
              maxLength={100}
              autoComplete="name"
              placeholder="Your name"
            />
          </div>
        )}
        {mode !== "reset-password" && (
          <div className="form-field">
            <label htmlFor="email">Email address</label>
            <input
              id="email"
              name="email"
              required
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </div>
        )}
        {(socialMode || mode === "reset-password") && (
          <div className="form-field">
            <div className="field-label">
              <label htmlFor="password">
                {mode === "reset-password" ? "New password" : "Password"}
              </label>
              {mode === "login" && (
                <Link href="/forgot-password">Forgot password?</Link>
              )}
            </div>
            <div className="password-input">
              <input
                id="password"
                name="password"
                type={visible ? "text" : "password"}
                required
                minLength={mode === "login" ? undefined : 8}
                autoComplete={
                  mode === "login" ? "current-password" : "new-password"
                }
              />
              <button
                type="button"
                aria-label={visible ? "Hide password" : "Show password"}
                onClick={() => setVisible(!visible)}
              >
                {visible ? <EyeOff size={19} /> : <Eye size={19} />}
              </button>
            </div>
          </div>
        )}
        {mode === "reset-password" && (
          <div className="form-field">
            <label htmlFor="confirm-password">Confirm new password</label>
            <input
              id="confirm-password"
              name="confirm-password"
              type={visible ? "text" : "password"}
              required
              minLength={8}
              autoComplete="new-password"
            />
          </div>
        )}
        {(error || params.has("error")) && (
          <p className="form-error" role="alert">
            {error || authErrorMessage(params.get("error"))}
          </p>
        )}
        {message && (
          <p className="form-message" role="status">
            {message}
          </p>
        )}
        <button
          disabled={pending || !hydrated}
          className="button button-red full-width"
        >
          {pending && !pendingSocial
            ? "Working…"
            : {
                login: "Log in to TalentFound",
                signup: "Create your account",
                "forgot-password": "Send reset link",
                "reset-password": "Update password",
              }[mode]}
          <Arrow />
        </button>
      </form>
      {socialMode && (
        <p className="auth-switch">
          {mode === "login"
            ? "New around here?"
            : "Already part of TalentFound?"}{" "}
          <Link
            href={`${mode === "login" ? "/signup" : "/login"}?next=${encodeURIComponent(next)}`}
          >
            {mode === "login" ? "Create an account" : "Log in"} ↗
          </Link>
        </p>
      )}
    </div>
  );
}

function subscribeStorage(callback: () => void) {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}
export function AuthForm(props: { mode: AuthMode; initialRole?: string }) {
  return (
    <Suspense fallback={<div className="auth-form-wrap">Loading sign-in…</div>}>
      <AuthFormContent {...props} />
    </Suspense>
  );
}
