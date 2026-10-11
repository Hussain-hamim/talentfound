# Verification record

Verified against project `zgpqyctyxozsvbjayhaf`, using disposable QA accounts; no fictional conversations, reviews, invitations, or profiles were imported into live member accounts.

## Automated checks

- TypeScript: passes.
- Production Next.js build: passes.
- ESLint: no errors; two pre-existing warnings in the separate `velorah/` app.
- Platform unit tests: 6 pass (redirect safety, draft expiry/validation, onboarding, message/review validation, safe email rendering, and reconnect recovery spanning multiple pages).
- Existing prototype/ranking regression tests: 23 pass.
- Live database suite: 10 pass, covering public/private boundaries, profile ownership, candidate notes, unpublished portfolios, media path ownership, sender impersonation, conversation isolation, duplicate messages, read positions, invitations, review ownership, blocks, analytics privacy, and dual workspaces.
- Live auth suite now checks immediate signup/session creation and onboarding, followed by password recovery, refresh, and logout. Run after disabling Confirm email in Supabase; the test checks that setting before creating an account.
- Live storage suite: passes. Draft images cannot be signed by guests; owner uploads and deletion work; uploads to another owner's prefix fail; published images can be read publicly.
- Notification SQL suite: passes. Five-minute delay, grouped messages, stable retry identifiers, read-before-send suppression, mute/block suppression, and fifteen-minute cooldown. All changes roll back; no provider is called.
- Authenticated Supabase Realtime: live message event received by a separate authenticated client; missed-message recovery reads persisted messages after reconnect. Messages also appeared in the browser conversation.
- Worker endpoint rejects unauthenticated calls with HTTP 401.
- Supabase security advisor: no new database findings. Remaining existing warning: leaked-password protection is disabled.

## Browser checks

The real UI was exercised on localhost/isolated loopback test sessions, with desktop and mobile viewport checks:

- Email/password login and logout; developer onboarding and dashboard.
- Portfolio creation/publication and public profile rendering.
- Developer/recruiter workspace switching and role-specific navigation.
- Real discovery, search controls, saving candidates (confirmed in the private workspace snapshot), conversation history, and live messages.
- Guest message composition and authentication return paths: the exact draft returned after login; a database check found zero messages before explicit Send and exactly one afterward.
- Mobile dashboard and messaging navigation without document-level horizontal overflow.

## Launch checks still required

These depend on services/credentials outside the repository:

- Google OAuth consent and returning-user flow with the intended TalentFound application configuration.
- GitHub OAuth after configuring client credentials in Supabase.
- Email change and password-reset mailbox delivery after verified SMTP setup.
- Actual Resend delivery, links on the production HTTPS domain, and provider-level transient-error/idempotency behavior. Queue behavior and template escaping are tested separately.
- Cross-browser/mobile provider flows on the deployed HTTPS origin and application-specific accessibility review with assistive technology.

See `docs/launch.md` for configuration. These external checks are not represented as completed by passing local tests.
