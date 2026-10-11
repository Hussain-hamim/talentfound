# Enable Resend email for TalentFound

Use **only** Supabase project `zgpqyctyxozsvbjayhaf` ([open project](https://supabase.com/dashboard/project/zgpqyctyxozsvbjayhaf)). In-app notifications already work independently of email.

The existing `talentfound-notifications` Edge Function is deployed. Its database cron runs once per minute, but delivery is disabled until the Vault enable flag is set. A matching private scheduler secret was installed previously; preserve it. Do not paste API keys in chat, commit them, or put them in `NEXT_PUBLIC_` variables.

## 1. Verify your sending domain

In [Resend Domains](https://resend.com/domains), add a domain or subdomain you own, such as `updates.yourdomain.com`. Add the exact DNS records Resend provides at your DNS provider, then wait for **Verified**. Use a sender on that verified domain, such as `TalentFound <messages@updates.yourdomain.com>`.

A Vercel application URL can be used as the email link destination, but you cannot verify the shared `vercel.app` domain as your sending domain. See [Resend domain verification](https://resend.com/docs/dashboard/domains/introduction).

## 2. Configure message and invitation delivery

Create a sending API key in [Resend API Keys](https://resend.com/api-keys). In Supabase → Edge Functions → Secrets, save:

| Secret | Value |
| --- | --- |
| `RESEND_API_KEY` | Your Resend API key |
| `NOTIFICATION_FROM` | `TalentFound <messages@YOUR_VERIFIED_DOMAIN>` |
| `APP_URL` | Your public HTTPS application origin; currently `https://talent-found-os.vercel.app` is documented for this project |

Keep `NOTIFICATIONS_CRON_SECRET` unchanged. It must match the Vault secret `talentfound_notifications_cron_secret`; do not expose either value. The worker intentionally rejects missing configuration and non-HTTPS app origins. Localhost links must not be used in recipient emails.

The deployed worker is already installed; redeploy only if its source changes:

```sh
supabase functions deploy talentfound-notifications --project-ref zgpqyctyxozsvbjayhaf --use-api
```

In Supabase Vault, create `talentfound_notifications_enabled` with value `true`, or update that secret if it already exists. This activates the existing cron. Set it to `false` to pause delivery. Do not create a second cron job.

## 3. Configure authentication SMTP separately

For password recovery and other authentication emails, open Supabase → Authentication → Email → SMTP Settings and enable custom SMTP:

| Field | Value |
| --- | --- |
| Sender email | An address on your verified Resend domain |
| Sender name | `TalentFound` |
| Host | `smtp.resend.com` |
| Port | `465` |
| Username | `resend` |
| Password | Your Resend API key |

Save and test password recovery using a real mailbox. Follow [Resend’s official Supabase SMTP instructions](https://resend.com/docs/send-with-supabase-smtp). SMTP does not configure chat notifications; Step 2 handles those.

The project currently uses immediate email/password signup without email confirmation, as documented in `launch.md`. Do not change that policy just to configure SMTP. If verification is enabled later, test signup confirmation too.

## 4. Send a controlled test

1. Use two real test accounts with accessible mailboxes. The recipient must have email notifications enabled in Settings. Demo accounts are not suitable.
2. Send one message or project invitation. Confirm the in-app bell changes immediately.
3. Leave the recipient's conversation unopened for at least five minutes, then allow the next cron run. The worker groups unread messages and limits emails to one per conversation/recipient per fifteen minutes.
4. Open the email and verify the sender, message text, and conversation link. When signed out, the link should return to that conversation after login/onboarding.
5. Repeat with the conversation already read and then with email notifications turned off. Those cases should not send email. Blocking either direction must also suppress delivery.
6. Test password recovery separately; it uses SMTP, not the notification worker.

Only new messages and project invitations currently produce email. Invitation responses and community feedback produce in-app notifications. Portfolio edits and private hiring updates refresh the UI without sending unsolicited emails.

## Troubleshooting

- Check Edge Function logs for configuration/queue/provider failures and the Resend email log for rejected or delivered messages.
- Use the Supabase SQL editor to inspect `talentfound_private.notification_jobs` and `talentfound_private.notification_batches`. Never expose these tables through the application API; they contain private delivery information.
- `skipped` is expected for read, muted, blocked, or unavailable recipients. Eligible jobs wait five minutes; recent conversation deliveries impose a fifteen-minute cooldown.
- Failed transient sends retry using the same idempotency key. Ambiguous failures beyond the safe retry window are held for operator review rather than blindly resent.
- The `x-cron-secret` header authenticates the worker; missing/wrong credentials produce 401. Missing sender/API key/HTTPS origin produces 503.
- Email delivery is complete only after a real mailbox receives a test successfully. No Resend mailbox test was claimed during implementation without your domain and credentials.
