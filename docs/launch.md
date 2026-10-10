# Launch configuration

## Current state

The correct Supabase project is linked, migrated, and has RLS, storage policies, Realtime, analytics retention, and the notification worker. Email confirmation is enabled. Google was already enabled and its existing credentials/redirects were preserved. GitHub is not configured. No production app domain or Resend sending credentials were supplied.

The database contained a previous application's tables and authentication redirects. They were preserved. Coordinate removal of old `exitboard.vercel.app` redirects only after confirming that application no longer uses this project.

## Application environment

Set the variables shown in `.env.example`. `NEXT_PUBLIC_APP_URL` is the canonical public origin, currently `http://localhost:3000`. Authentication callbacks redirect to that configured origin; use it consistently, since pending contact drafts are browser-origin-local. `ANALYTICS_HASH_SECRET` must be a random server secret, stable across deployments. `SUPABASE_SERVICE_ROLE_KEY` is server-only and is used only for validated analytics writes and test administration.

On deployment set the real HTTPS origin, update Supabase Site URL, and allow `https://YOUR_DOMAIN/auth/callback`. Localhost and `127.0.0.1:3000` callbacks are currently allowed for development. Do not use wildcard production redirects.

Use Supabase CLI **2.119 or later** for partial `config push`: older versions can reset undeclared remote settings. Review `config diff` first. The checked-in config intentionally declares only the confirmation requirement and worker authentication mode.

## Google and GitHub

In Supabase Authentication → Sign In / Providers, configure each provider's client ID and secret. GitHub needs a new OAuth application; Google needs the existing application's branding, consent mode, test-user permissions, and authorized domains reviewed for TalentFound.

Both provider consoles must use this callback:

```
https://zgpqyctyxozsvbjayhaf.supabase.co/auth/v1/callback
```

Supabase redirects back to the app's `/auth/callback`, which exchanges the PKCE code for cookies and resumes onboarding or a protected conversation. Test provider consent, cancel/error handling, first login, and returning login using real test accounts. Provider secrets belong in Supabase, never client environment variables.

## Authentication email through Resend SMTP

Verify a sending domain in Resend. Configure Supabase Authentication → Email → SMTP with `smtp.resend.com`, port `465`, username `resend`, the Resend API key as password, a verified sender address, and the TalentFound sender name. Follow [Resend's Supabase setup](https://resend.com/docs/send-with-supabase-smtp).

The default Supabase mail service is restricted and is not production delivery. Test signup confirmation, resend, email changes, and password recovery in a real mailbox after SMTP is configured. Existing auto-confirmed accounts remain confirmed; new registrations now require confirmation.

Default Supabase confirmation/recovery links work through the PKCE callback in the initiating browser. If customizing templates for cross-browser token verification, `/auth/confirm` accepts `token_hash`, `type`, and a safe `next` path. Never put the message draft in an email URL. Password recovery must return to `/reset-password`.

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
