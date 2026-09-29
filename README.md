# DevMatch

The landing page and authentication UI for a developer discovery and co-founder matching platform. Built with Next.js App Router, React, TypeScript, and custom responsive CSS.

## Run locally

```bash
pnpm install
pnpm dev
```

Open [localhost:3000](http://localhost:3000). Use the hostname shown by the development server; Next.js restricts development resources from other origins.

## Pages

- `/` — landing page, example profile, product features, co-founder introduction, and FAQ.
- `/signup` — registration UI with developer, hiring, and co-founder role selection. `?role=hiring` and `?role=founder` preselect the relevant option.
- `/login` — email/password and social sign-in UI.
- `/forgot-password` — email entry and reset confirmation preview.
- `/reset-password` — new password and confirmation validation.
- `/verify-email` — verification and resend preview.

## Current scope

This phase is UI only. Forms validate locally and show explicit preview feedback; registration proceeds to the verification preview. No accounts are created, credentials stored, authentication requests made, or emails sent. GitHub and Google buttons display preview notices. The profile and opportunity cards are illustrative examples.

Authentication controls and presentation live in `components/auth-form.tsx`; the shared authentication layout is in `app/(auth)/layout.tsx`. The landing page remains a Server Component, with a small client component for mobile navigation. The palette uses `#ff3317`, `#151415`, white, and dark red, inspired by Superteam Talent, with original DevMatch branding and content based on `docs/plan.md` and `docs/plan2.md`.

## Checks

```bash
pnpm lint
pnpm exec tsc --noEmit
pnpm build
```

The existing `next/font/google` setup downloads Geist and Geist Mono during production builds, so the initial build requires internet access.
