# DevMatch

The landing page and authentication UI for a developer discovery and co-founder matching platform. Built with Next.js App Router, React, TypeScript, and custom responsive CSS.

## Run locally

```bash
pnpm install
pnpm dev
```

Open [localhost:3000](http://localhost:3000). Use the hostname shown by the development server; Next.js restricts development resources from other origins.

## Pages

- `/` — editorial landing page, original connection artwork, interactive example-profile gallery, developer / hiring / co-founder paths, an interactive profile walkthrough, opportunity panels, a co-founder feature, and an accordion FAQ.
- `/signup` — registration UI with developer, hiring, and co-founder role selection. `?role=hiring` and `?role=founder` preselect the relevant option.
- `/login` — email/password and social sign-in UI.
- `/forgot-password` — email entry and reset confirmation preview.
- `/reset-password` — new password and confirmation validation.
- `/verify-email` — verification and resend preview.

## Current scope

This phase is UI only. Forms validate locally and show explicit preview feedback; registration proceeds to the verification preview. No accounts are created, credentials stored, authentication requests made, or emails sent. GitHub and Google buttons display preview notices. The three gallery profiles and projects are illustrative examples. Native dialogs support keyboard dismissal and restore focus to the originating profile.

Authentication controls and presentation live in `components/auth-form.tsx`; the shared authentication layout is in `app/(auth)/layout.tsx`. The landing page remains a Server Component, with small client components for mobile navigation, sample-profile dialogs, role selection, and progressive scroll reveals. Its visual system is scoped in `app/landing.css` and `app/landing-chapters.css`; additional sections are in `components/landing-chapters.tsx` and the keyboard-accessible profile tabs are in `components/profile-passport.tsx`. The original generated hero artwork lives in `public/images/devmatch-connection.png`. The palette uses `#ff3317`, `#151415`, white, and dark red, inspired by Superteam Talent, with original DevMatch branding and content based on `docs/plan.md` and `docs/plan2.md`.

## Checks

```bash
pnpm lint
pnpm exec tsc --noEmit
pnpm build
```

The existing `next/font/google` setup downloads Geist and Geist Mono during production builds, so the initial build requires internet access.

## Velorah hero

The requested React + Vite + TypeScript + Tailwind + shadcn/ui hero is a standalone app in [`velorah/`](./velorah/README.md). Run `npm run dev:velorah` from this folder, or `npm run build:velorah` for a production build. The existing Next.js app retains its original scripts and source.
