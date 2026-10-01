# TalentFound

The landing page and authentication UI for a developer discovery and co-founder matching platform. Built with Next.js App Router, React, TypeScript, and custom responsive CSS.

## Run locally

```bash
pnpm install
pnpm dev
```

Open [localhost:3000](http://localhost:3000). Use the hostname shown by the development server; Next.js restricts development resources from other origins.

## Pages

- `/` — editorial landing page, original connection artwork, interactive example-profile gallery, developer / hiring / co-founder paths, an interactive profile walkthrough, opportunity panels, a co-founder feature, and an accordion FAQ.
- `/developers` — compact or showcase discovery, combined fit filters, category/review filters, and transparent sorting. `?engagement=Co-founder` opens that path.
- `/developers/[id]` — six shareable sample profiles with project case studies, work preferences, and contextual client feedback.
- `/developers/[id]/invite` — engagement-specific brief, review, and browser-saved draft; no messages are sent.
- `/shortlist` — named browser-saved lists, private notes, comparison of up to three people, shareable profile selections, and invitation drafts. Shared links contain profile IDs and a list name only.
- `/signup` — registration UI with developer, hiring, and co-founder role selection. `?role=hiring` and `?role=founder` preselect the relevant option.
- `/login` — email/password and social sign-in UI.
- `/forgot-password` — email entry and reset confirmation preview.
- `/reset-password` — new password and confirmation validation.
- `/verify-email` — verification and resend preview.

## Current scope

This phase is UI only. Forms validate locally and show explicit preview feedback; registration proceeds to the verification preview. No accounts are created, credentials stored, authentication requests made, or emails sent. GitHub and Google buttons display preview notices. All developer profiles, projects, reviews, availability, and compensation expectations are illustrative examples. There are no verified identities, client engagements, or technical assessments. Shortlists, private notes, and invitation drafts use versioned localStorage (`talentfound:hiring:v1`), persist on this browser only, and are removed when browser data is cleared. This is not account-level storage or messaging. Public links to selections do not include notes or drafts. Native dialogs support keyboard dismissal and restore focus to the originating profile.

Authentication controls and presentation live in `components/auth-form.tsx`; the shared authentication layout is in `app/(auth)/layout.tsx`. The landing page remains a Server Component, with small client components for mobile navigation, sample-profile dialogs, role selection, and progressive scroll reveals. Its visual system is scoped in `app/landing.css` and `app/landing-chapters.css`; additional sections are in `components/landing-chapters.tsx` and the keyboard-accessible profile tabs are in `components/profile-passport.tsx`. The original generated hero artwork lives in `public/images/devmatch-connection.png`. The palette uses `#ff3317`, `#151415`, white, and dark red, inspired by Superteam Talent, with original TalentFound branding and content based on `docs/plan.md` and `docs/plan2.md`.

## Checks

```bash
pnpm lint
pnpm exec tsc --noEmit
pnpm test:hiring
pnpm build
```

The existing `next/font/google` setup downloads Geist and Geist Mono during production builds, so the initial build requires internet access.

## Velorah hero

The requested React + Vite + TypeScript + Tailwind + shadcn/ui hero is a standalone app in [`velorah/`](./velorah/README.md). Run `npm run dev:velorah` from this folder, or `npm run build:velorah` for a production build. The existing Next.js app retains its original scripts and source.

## Hiring prototype structure

`components/developer-hiring-data.ts` contains illustrative fit preferences, project context, and pure filtering helpers. Search applies all selected requirements before the existing rating sort; online status and saves do not affect fit or reputation. The three engagement types have separate expectations and invitation fields. `components/hiring-store.ts` owns browser persistence and validates the stored schema. `tests/developer-hiring.test.mjs` covers fit combinations and storage validation; the existing ranking tests cover averages, small samples, ties, and newcomer handling. Sample directory and profile routes are marked noindex.
