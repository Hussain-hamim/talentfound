# Launch configuration

## Current state

The correct Supabase project is linked, migrated, and has RLS, storage policies, Realtime, analytics retention, and the notification worker. Signup expects email confirmation to be disabled in Supabase (Authentication → Sign In / Providers → Email → Confirm email). The checked-in config disables it; apply the same setting to the hosted project. Google was already enabled and its existing credentials/redirects were preserved. GitHub is not configured. The production app is https://talent-found-os.vercel.app. Resend sending credentials were not supplied during setup.

The database contained a previous application's tables and authentication redirects. They were preserved. Coordinate removal of old `exitboard.vercel.app` redirects only after confirming that application no longer uses this project.

## Application environment

Set the variables shown in `.env.example`. `NEXT_PUBLIC_APP_URL` is the canonical public origin: `https://talent-found-os.vercel.app` in the Vercel project's Production and Preview environments. Keep `http://localhost:3000` in `.env.local` for local development. Authentication callbacks redirect to that configured origin; use it consistently, since pending contact drafts are browser-origin-local. Changes to this public environment variable require a new deployment. `ANALYTICS_HASH_SECRET` must be a random server secret, stable across deployments. `SUPABASE_SERVICE_ROLE_KEY` is server-only and is used only for validated analytics writes and test administration.

Supabase Site URL is `https://talent-found-os.vercel.app`, with `https://talent-found-os.vercel.app/auth/callback` explicitly allowed. Localhost and `127.0.0.1:3000` callbacks remain allowed for development, and the existing Exitboard redirects are preserved. These settings are recorded in `supabase/config.toml`. Do not use wildcard production redirects.

Use Supabase CLI **2.119 or later** for partial `config push`: older versions can reset undeclared remote settings. Review `config diff` first. The checked-in config intentionally declares the auth URLs, disabled signup confirmation, and worker authentication mode.

## Google and GitHub

In Supabase Authentication → Sign In / Providers, configure each provider's client ID and secret. GitHub needs a new OAuth application; Google needs the existing application's branding, consent mode, test-user permissions, and authorized domains reviewed for TalentFound.

For GitHub, open https://github.com/settings/applications/new and register an **OAuth App** with these values:

| Field | Value |
| --- | --- |
| Application name | TalentFound |
| Homepage URL | `https://talent-found-os.vercel.app` |
| Authorization callback URL | `https://zgpqyctyxozsvbjayhaf.supabase.co/auth/v1/callback` |
| Enable Device Flow | Leave unchecked |

After registering, copy the Client ID and generate a client secret. Enter both directly in the GitHub provider at https://supabase.com/dashboard/project/zgpqyctyxozsvbjayhaf/auth/providers, enable GitHub, and save. Keep the client secret in Supabase; the Next.js app and Vercel do not need it. Provider credentials are intentionally omitted from the repository's partial Supabase config.

The existing login and signup buttons call `signInWithOAuth({ provider: "github" })` using the Supabase SSR client. The app checks the provider's public enabled status before redirecting and shows an email fallback if it is not configured. Successful callbacks exchange the PKCE code for session cookies and resume the requested page or onboarding role. Failed/cancelled callbacks keep the return path so retrying does not lose a pending invitation or message.

After saving the provider settings, test a new developer signup, a recruiter signup, returning-user login, a private-email GitHub account, cancelled consent, and login started from a message/invitation. Finish sign-in in the browser that started it. Localhost uses the same hosted Supabase provider, with its app callback already on the redirect allowlist. Full OAuth verification requires the credentials and a real GitHub consent flow; the app-side checks alone do not confirm it.

Setup reference: https://supabase.com/docs/guides/auth/social-login/auth-github

Both provider consoles must use this callback:

```
https://zgpqyctyxozsvbjayhaf.supabase.co/auth/v1/callback
```

Supabase redirects back to the app's `/auth/callback`, which exchanges the PKCE code for cookies and resumes onboarding or a protected conversation. Test provider consent, cancel/error handling, first login, and returning login using real test accounts. Provider secrets belong in Supabase, never client environment variables.

## Authentication email through Resend SMTP

Verify a sending domain in Resend. Configure Supabase Authentication → Email → SMTP with `smtp.resend.com`, port `465`, username `resend`, the Resend API key as password, a verified sender address, and the TalentFound sender name. Follow [Resend's Supabase setup](https://resend.com/docs/send-with-supabase-smtp).

The default Supabase mail service is restricted and is not production delivery. Test email changes and password recovery in a real mailbox after SMTP is configured. New registrations receive a session immediately and proceed to onboarding without an email link. Supabase automatically marks these new accounts confirmed, so existing database policies continue to work without changes. Previously unconfirmed accounts may need confirmation through Supabase administration; changing the signup setting does not migrate existing accounts.

Default Supabase email-change/recovery links work through the PKCE callback in the initiating browser. If customizing templates for cross-browser token verification, `/auth/confirm` accepts `token_hash`, `type`, and a safe `next` path. Never put the message draft in an email URL. Password recovery must return to `/reset-password`.

## Message and invitation email

The deployed `talentfound-notifications` Edge Function enforces a private `x-cron-secret` header. JWT verification is intentionally disabled for this one worker because the database scheduler is not a signed-in user. A random matching secret has been installed in Edge Function secrets and Vault; it is not in source control. Calls without it return 401.

Add these Supabase Edge Function secrets through the dashboard or a private, ignored env file:

```
RESEND_API_KEY=<Resend API key>
NOTIFICATION_FROM=TalentFound <messages@YOUR_VERIFIED_DOMAIN>
APP_URL=https://YOUR_APP_DOMAIN
```

For a private HTTPS test deployment, use that origin until production exists. Do not enable delivery with localhost links. The worker returns 503 while email configuration is missing and chat continues functioning.

Deploy updates with:

```sh
supabase functions deploy talentfound-notifications --project-ref zgpqyctyxozsvbjayhaf --use-api
```

After configuration and an actual mailbox smoke test, enable the scheduler by adding Vault secret `talentfound_notifications_enabled` with value `true`. The installed cron runs once per minute. To pause delivery, change that value to `false`.

If rotating `NOTIFICATIONS_CRON_SECRET`, update both the Edge Function secret and Vault `talentfound_notifications_cron_secret` together. Use an adequately long random value; never copy it into a migration.

Jobs become eligible after five minutes. They group unread messages, cap delivery at one email per conversation/recipient per fifteen minutes, recheck current account email/preferences/blocks/read state, and retry with a stable Resend idempotency key. Ambiguous deliveries stop retrying before Resend's deduplication window expires and require operator review. Inspect `talentfound_private.notification_jobs` and `notification_batches` in the Supabase SQL editor; these are not exposed to members. Delivery status `skipped` is expected for read, muted, blocked, or unavailable recipients.

## Operations

- Reports are in `public.reports`, readable only by the service/operator through Supabase.
- Raw analytics expire after 90 days. Names are shown only for members currently opting into visitor identification; emails and raw IPs are never included.
- Contact limits default to 10 new conversations/day and 30 messages/minute. Database settings `app.contacts_per_day` and `app.messages_per_minute` can override them; set positive values and review abuse before increasing.
- The existing Supabase leaked-password protection setting is disabled. Enable it if supported by the project's plan; do not upgrade the plan without approval.
- Run the verification checklist before public launch. AI, maps, payments, contracts, company-shared workspaces, and job boards are outside this release.
