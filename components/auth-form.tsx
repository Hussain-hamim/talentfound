"use client";
import Link from "next/link";
import {
  useState,
  useSyncExternalStore,
  Suspense,
  type FormEvent,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Code2, Eye, EyeOff } from "lucide-react";
import { Arrow, Brand } from "./brand";
import { createClient } from "@/lib/supabase/client";
import { safeNext } from "@/lib/supabase/config";
export type AuthMode =
  "login" | "signup" | "forgot-password" | "reset-password" | "verify-email";
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
  "verify-email": [
    "ONE MORE THING",
    "Check your inbox.",
    "Verify your email to finish setting up your TalentFound account.",
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
  const params = useSearchParams();
  const next = safeNext(params.get("next"));
  const storedEmail = useSyncExternalStore(
    subscribeStorage,
    readEmail,
    () => "",
  );
  const [visible, setVisible] = useState(false);
  const [emailInput, setEmail] = useState<string | null>(null);
  const email = emailInput ?? storedEmail;
  const [role, setRole] = useState(
    initialRole === "developer" ? "developer" : "recruiter",
  );

  function destination() {
    return mode === "signup"
      ? `/onboarding?role=${role}&next=${encodeURIComponent(next)}`
      : next;
  }
  async function social(provider: "google" | "github") {
    setPending(true);
    setError("");
    try {
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
            emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(destination())}`,
          },
        });
        if (error) throw error;
        try {
          sessionStorage.setItem("talentfound:signup-email", email);
        } catch {}
        router.push(
          data.session
            ? destination()
            : `/verify-email?next=${encodeURIComponent(destination())}`,
        );
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
      } else {
        const { error } = await db.auth.resend({
          type: "signup",
          email,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
          },
        });
        if (error) throw error;
        setMessage(
          "A new verification email has been requested. Please check your inbox.",
        );
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
              disabled={pending || !hydrated}
              onClick={() => social("github")}
            >
              <Code2 size={20} /> GitHub
            </button>
            <button
              disabled={pending || !hydrated}
              onClick={() => social("google")}
            >
              <span className="google-icon">G</span> Google
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
            {error ||
              "This sign-in link is invalid or expired. Please try again."}
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
          {pending
            ? "Working…"
            : {
                login: "Log in to TalentFound",
                signup: "Create your account",
                "forgot-password": "Send reset link",
                "reset-password": "Update password",
                "verify-email": "Resend verification email",
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
      {mode === "verify-email" && (
        <p className="auth-switch">
          Already verified? <Link href={next}>Continue to TalentFound ↗</Link>
        </p>
      )}
    </div>
  );
}

function subscribeStorage(callback: () => void) {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}
function readEmail() {
  try {
    return sessionStorage.getItem("talentfound:signup-email") || "";
  } catch {
    return "";
  }
}
export function AuthForm(props: { mode: AuthMode; initialRole?: string }) {
  return (
    <Suspense fallback={<div className="auth-form-wrap">Loading sign-in…</div>}>
      <AuthFormContent {...props} />
    </Suspense>
  );
}
