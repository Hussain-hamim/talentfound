# TalentFound

A Next.js 16 / React 19 developer discovery platform backed by Supabase. The editorial landing page retains its dark palette, typography, and red accents. Real discovery, profiles, dashboards, and conversations use project **zgpqyctyxozsvbjayhaf** exclusively.

## Local development

```sh
pnpm install
cp .env.example .env.local # Only if you don't already have local configuration
pnpm dev
```

Fill the environment values from the named project. `.env.local` is ignored. Never expose the service-role key or analytics secret through `NEXT_PUBLIC_` variables. Use `http://localhost:3000` consistently for authentication redirects and browser drafts.

## Implemented

- Email/password authentication, verification, recovery, cookie sessions, OAuth callback handling, and logout.
- Two-step onboarding; one identity with optional developer and recruiter workspaces.
- Public developer profiles, profile editing, portfolio publishing/reordering, owner-restricted image storage, metadata, and sitemap.
- Search and URL filters, showcase/compact layouts, pagination, saved searches, shortlists, notes, and private candidate stages.
- Opportunity management, immutable invitation briefs and responses, private direct messages, unread counts, Realtime updates, reports, and blocking.
- A guest can compose before login. The same-browser draft lasts 24 hours and returns for explicit review after authentication/onboarding. It never sends automatically.
- Community ratings/reviews and developer replies, with no employment-verification claims.
- Owner-only 7/30-day analytics, rolling 30-minute deduplication, optional visitor identification, and 90-day retention.
- Durable notification jobs, grouped email templates, private scheduled worker, retries, read suppression, and delivery limits.

The remaining **external launch prerequisites and exact configuration steps** are in [docs/launch.md](docs/launch.md). GitHub OAuth and production email delivery are not enabled by code alone. The notification scheduler deliberately remains inactive until the sending service is configured and tested.

## Routes

`/developers` and `/developers/[handle]` are public. `/dashboard` contains role-specific overview, profiles, projects, talent search, shortlists, opportunities, invitations, messages, analytics, and settings. Shared conversations live at `/dashboard/messages/[conversationId]`. Legacy `/messages` and `/shortlist` links redirect into authenticated workspaces.

Illustrative landing artwork and examples remain clearly labeled. Legacy prototype components/tests remain in the repository for reference, but live account, discovery, contact, and dashboard routes do not use their mock stores or simulated replies. The separate `velorah/` project is unchanged.

## Database and security

Versioned migrations under `supabase/migrations/` retain the project's existing migration history. TalentFound additions start at `20261002164253`. Existing unrelated application tables are preserved. Do not reset this shared remote database or reapply old migrations manually.

Public identity/profile data is separate from account preferences, hiring notes, messages, reports, analytics, and the private notification queue. Exposed tables use explicit grants and RLS; transactional RPCs enforce verified onboarding, membership, ownership, immutable invitations, blocking, and configurable contact/message limits. Dashboard snapshots use the requesting member's RLS context. Database types are generated in `lib/supabase/database.types.ts`.

```sh
supabase link --project-ref zgpqyctyxozsvbjayhaf
supabase db push --linked
supabase gen types typescript --linked --schema public > lib/supabase/database.types.ts
```

## Verification

```sh
pnpm lint
pnpm exec tsc --noEmit
pnpm test:platform
pnpm test:hiring
pnpm test:database
pnpm test:auth
pnpm test:storage
pnpm build
npx --yes supabase@2.119.0 db query --linked --project-ref zgpqyctyxozsvbjayhaf --file tests/platform/notifications.sql
```

Live tests require `.env.local`, deliberately create disposable `@example.test` accounts, and remove them afterward. Notification SQL runs inside a rolled-back transaction and never contacts an email provider. Authentication tests generate verification/recovery tokens without sending email; actual mailbox delivery and OAuth consent must also be tested before launch. See [docs/verification.md](docs/verification.md).
