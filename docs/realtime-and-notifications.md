# Live updates and in-app notifications

Implemented on 11 October 2026 for Supabase project `zgpqyctyxozsvbjayhaf`.

## What updates live

- Published developer profiles, avatars, portfolio projects/images, community reviews, replies, and search results refresh without reloading the browser. Saving a draft stays private; publishing/unpublishing or deleting a project refreshes public discovery.
- Dashboard data refreshes for profiles, projects, workspaces/settings, shortlists, candidate notes/stages, saved searches, opportunities, invitations, messages, read state, and blocks.
- Profile owners' analytics refresh for new recorded views/clicks. Anonymous visitor identities are never exposed.
- Chat keeps its existing recipient-scoped message subscription, missed-message reconciliation and send retry identifiers.
- The header bell and `/dashboard/notifications` update for messages, invitations, invitation responses, community reviews, and review replies. The latest 300 notifications can be browsed, 30 at a time. Notification records remain durable beyond that display window.
- Opening a notification marks it read; individual/all-read controls are available. Reading an active conversation clears corresponding message/invitation alerts. Notification-read alone does **not** pretend the conversation was read or suppress unread-message emails.

Live refresh preserves unsaved form state, filters, scroll, and open profile dialogs. An editor already open in another tab keeps its draft; it is not overwritten with remote changes. Uploaded media appears after its profile/project record is saved. Private candidate labels, saves, and notes never notify candidates.

## Data and privacy

`public.realtime_signals` has one public discovery revision and one private revision per member. Internal triggers invalidate these records in the same transaction as writes. They contain no source-row payload. This also covers deletes and unpublishing, where subscribing to source rows alone can miss removal after permissions change.

`public.notifications` is recipient-only under RLS, with both-direction block checks and no client INSERT/DELETE permission. Clients can update only `read_at`. Notification creation uses internal database triggers and stable source keys, so retries cannot forge or duplicate alerts. Demo/banned recipients do not get new notifications. Notifications start with new activity after migration; historical conversations are not backfilled.

Realtime subscriptions are cleaned up when auth changes/unmounts. Updates are coalesced; reconnect, focus, online, and a 60-second reconciliation interval recover missed events. Public data always reloads through normal server queries and private data through authenticated operations. The bell shares one root subscription with the rest of the app.

## Verification

- `pnpm test:realtime`: creates temporary, email-muted QA accounts, tests public insert/delete signals, recipient-only WebSocket delivery, duplicate prevention, read propagation and disconnected-client recovery; removes only its own fixtures afterward.
- `tests/platform/realtime.sql`: rollback-only database checks for draft privacy, publish/delete invalidation, message/invitation/review/reply triggers, recipient/outsider/guest permissions, restricted updates, and blocks.
- `tests/platform/notifications.sql`: existing rollback-only email queue checks for five-minute batching, mute/read/block suppression, retry identity and cooldown. It never calls an email provider.

## Email setup

In-app notifications work without Resend. Email sending remains gated by configuration. Follow [the Resend setup guide](./resend-setup.md) to enable message/invitation emails and authentication SMTP separately.
