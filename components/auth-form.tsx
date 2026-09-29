"use client";

import Link from "next/link";
import { useState, useSyncExternalStore, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Arrow, CodeIcon } from "./brand";

export type AuthMode =
  "login" | "signup" | "forgot-password" | "reset-password" | "verify-email";
const subscribeToHydration = () => () => {};
const clientSnapshot = () => true;
const serverSnapshot = () => false;
const content = {
  login: {
    label: "GOOD TO SEE YOU AGAIN",
    title: "Welcome back.",
    description: "Your next opportunity could be one conversation away.",
  },
  signup: {
    label: "YOUR NEXT CHAPTER STARTS HERE",
    title: "Make your next move.",
    description: "A home for your work. A world of possibilities.",
  },
  "forgot-password": {
    label: "LET’S GET YOU BACK IN",
    title: "Forgot your password?",
    description: "It happens. Enter your email and we’ll help you reset it.",
  },
  "reset-password": {
    label: "A FRESH START",
    title: "Set a new password.",
    description: "Make it a strong one. Your next chapter is waiting.",
  },
  "verify-email": {
    label: "ONE MORE THING",
    title: "Check your inbox.",
    description:
      "Verify your email to take the next step toward your DevMatch profile.",
  },
};

function Eye({ visible }: { visible: boolean }) {
  return (
    <svg
      width="19"
      height="19"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="1.5"
      fill="none"
      aria-hidden="true"
    >
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
      <circle cx="12" cy="12" r="3" />
      {visible && <path d="m3 3 18 18" />}
    </svg>
  );
}
function GithubIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.86c-2.78.6-3.37-1.18-3.37-1.18-.45-1.15-1.11-1.46-1.11-1.46-.91-.62.07-.61.07-.61 1 .07 1.53 1.03 1.53 1.03.89 1.53 2.34 1.09 2.91.83.09-.65.35-1.09.64-1.34-2.22-.25-4.55-1.11-4.55-4.94 0-1.09.39-1.98 1.03-2.68-.11-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.03A9.6 9.6 0 0 1 12 6.84c.85 0 1.71.11 2.51.34 1.91-1.3 2.75-1.03 2.75-1.03.55 1.38.21 2.4.1 2.65.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.69-4.57 4.94.36.31.68.92.68 1.85v2.74c0 .27.18.58.69.48A10 10 0 0 0 12 2Z" />
    </svg>
  );
}

export function AuthForm({
  mode,
  initialRole = "developer",
}: {
  mode: AuthMode;
  initialRole?: string;
}) {
  const router = useRouter();
  const hydrated = useSyncExternalStore(
    subscribeToHydration,
    clientSnapshot,
    serverSnapshot,
  );
  const [role, setRole] = useState(
    ["developer", "hiring", "founder"].includes(initialRole)
      ? initialRole
      : "developer",
  );
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [complete, setComplete] = useState(false);
  const copy = content[mode];
  const social = mode === "login" || mode === "signup";
  const hasPassword = social || mode === "reset-password";

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    const data = new FormData(event.currentTarget);
    if (mode === "signup" && !String(data.get("name") ?? "").trim()) {
      setError("Please enter your name.");
      return;
    }
    if (
      mode === "reset-password" &&
      data.get("password") !== data.get("confirm-password")
    ) {
      setError("Your passwords don’t match. Please try again.");
      return;
    }
    if (mode === "signup") {
      router.push("/verify-email");
      return;
    }
    if (mode === "login") {
      setMessage(
        "You’ve reached the end of the sign-in preview. Live sign-in will be available when authentication is connected.",
      );
      return;
    }
    setComplete(true);
  }

  return (
    <div className="auth-form-wrap">
      <Link className="back-link" href={social ? "/" : "/login"}>
        <span>←</span> {social ? "Back to DevMatch" : "Back to log in"}
      </Link>
      <div className="eyebrow">{copy.label}</div>
      <h1>
        {complete
          ? mode === "forgot-password"
            ? "Next, check your email."
            : "A fresh start, ready."
          : copy.title}
      </h1>
      <p className="auth-description">
        {complete
          ? mode === "forgot-password"
            ? "This is the reset email confirmation preview. No email has been sent."
            : "Password reset preview complete. No password has been changed."
          : copy.description}
      </p>
      {complete ? (
        <div className="auth-complete">
          <div className="mail-illustration">
            {mode === "forgot-password" ? "↗" : "✓"}
          </div>
          <Link
            className="button button-red full-width"
            href={mode === "forgot-password" ? "/reset-password" : "/login"}
          >
            {mode === "forgot-password"
              ? "Preview password reset"
              : "Return to log in"}
            <Arrow />
          </Link>
          <button className="subtle-button" onClick={() => setComplete(false)}>
            Try again
          </button>
        </div>
      ) : mode === "verify-email" ? (
        <div className="verify-content">
          <div className="mail-illustration">
            <svg
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.3"
              aria-hidden="true"
            >
              <rect x="2" y="4" width="20" height="16" rx="2" />
              <path d="m2 6 10 7L22 6" />
            </svg>
          </div>
          <div className="verification-note">
            This is a preview of the verification step. Your account has not
            been created and no email has been sent.
          </div>
          <button
            className="button button-red full-width"
            onClick={() =>
              setMessage(
                "Resend preview complete. Email delivery will be available when authentication is connected.",
              )
            }
          >
            Resend verification email <Arrow />
          </button>
          <Link href="/signup" className="auth-bottom-link">
            Used a different email? Go back to sign up
          </Link>
        </div>
      ) : (
        <>
          {mode === "signup" && (
            <fieldset className="role-picker">
              <legend>I’m here to</legend>
              <div>
                {[
                  ["developer", "Get discovered", <CodeIcon key="code" />],
                  ["hiring", "Hire builders", <span key="hire">↗</span>],
                  [
                    "founder",
                    "Find a co-founder",
                    <span key="founder">⌘</span>,
                  ],
                ].map(([value, label, icon]) => (
                  <label
                    className={
                      role === value ? "role-option selected" : "role-option"
                    }
                    key={String(value)}
                  >
                    <input
                      type="radio"
                      name="role"
                      value={String(value)}
                      checked={role === value}
                      onChange={() => setRole(String(value))}
                    />
                    {icon}
                    <span>{label}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          )}
          {social && (
            <>
              <div className="social-buttons">
                <button
                  type="button"
                  onClick={() =>
                    setMessage(
                      "GitHub sign-in is part of this preview. Account connection will be available when authentication is connected.",
                    )
                  }
                >
                  <GithubIcon /> GitHub
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setMessage(
                      "Google sign-in is part of this preview. Account connection will be available when authentication is connected.",
                    )
                  }
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
          <form method="post" onSubmit={handleSubmit}>
            {mode === "signup" && (
              <div className="form-field">
                <label htmlFor="name">Full name</label>
                <input
                  id="name"
                  name="name"
                  placeholder="Alex Morgan"
                  autoComplete="name"
                  required
                  maxLength={100}
                />
              </div>
            )}
            {mode !== "reset-password" && (
              <div className="form-field">
                <label htmlFor="email">Email address</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                />
              </div>
            )}
            {hasPassword && (
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
                    type={showPassword ? "text" : "password"}
                    placeholder={
                      mode === "login"
                        ? "Enter your password"
                        : "Create a strong password"
                    }
                    autoComplete={
                      mode === "login" ? "current-password" : "new-password"
                    }
                    minLength={mode === "login" ? undefined : 8}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    aria-describedby={
                      mode !== "login" ? "password-help" : undefined
                    }
                  />
                  <button
                    type="button"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    aria-pressed={showPassword}
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <Eye visible={showPassword} />
                  </button>
                </div>
                {mode !== "login" && (
                  <span id="password-help" className="input-help">
                    At least 8 characters. Make it uniquely yours.
                  </span>
                )}
              </div>
            )}
            {mode === "reset-password" && (
              <div className="form-field">
                <label htmlFor="confirm-password">Confirm new password</label>
                <input
                  id="confirm-password"
                  name="confirm-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your new password again"
                  autoComplete="new-password"
                  minLength={8}
                  required
                  aria-describedby={error ? "form-error" : undefined}
                />
              </div>
            )}
            {error && (
              <p id="form-error" className="form-error" role="alert">
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={!hydrated}
              className="button button-red full-width"
            >
              {mode === "login"
                ? "Log in to DevMatch"
                : mode === "signup"
                  ? "Create your account"
                  : mode === "forgot-password"
                    ? "Send reset link"
                    : "Reset password"}
              <Arrow />
            </button>
          </form>
          {social && (
            <p className="auth-switch">
              {mode === "login"
                ? "New around here?"
                : "Already part of DevMatch?"}{" "}
              <Link href={mode === "login" ? "/signup" : "/login"}>
                {mode === "login" ? "Create an account" : "Log in"}
                <span> ↗</span>
              </Link>
            </p>
          )}
        </>
      )}
      {message && (
        <div className="form-message" role="status">
          {message}
        </div>
      )}
      <div className="preview-notice">
        <span /> UI preview · Live authentication coming later.
      </div>
    </div>
  );
}
