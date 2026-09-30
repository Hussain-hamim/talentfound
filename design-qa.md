# TalentFound cinematic hero QA

final result: passed

## Scope and source

The user clarified that the reference treatment belongs on the existing TalentFound homepage. This is an adaptation: TalentFound's headline, logo, navigation destinations, signup flow, and subsequent sections are intentionally retained.

Source visual: `/var/folders/sp/33j8nyh535jb846k8yn2zh9h0000gn/T/codex-clipboard-43e6407a-2a7d-44b2-a541-e76611228bec.png`.
Implementation: `docs/hero-qa/desktop.png` and `docs/hero-qa/mobile.png`.
Production preview: http://127.0.0.1:3001/

## Comparison evidence

The reference and final desktop screenshot were opened together in the same tool result at 800 × 589 pixels, matching 800 × 589 CSS pixels at 1× density. No resampling was needed. Mobile was captured at 390 × 844 CSS pixels at 1× density. Screenshots show the top of the page, menu closed, video playing, entrance animations complete. Full-view screenshots clearly show the type and controls, so additional detail crops were unnecessary.

## Findings and fixes

- P2, initial tablet layout: original header height and hero spacing placed the CTA over the foreground character. Reduced tablet header padding, hero top spacing, paragraph size and CTA spacing. Final screenshot places the CTA in the open sky.
- P2, initial mobile copy: hiding the desktop break joined two sentences. Added an explicit space. Kept the emphasized phrase together for a deliberate two-line mobile headline. Final mobile screenshot confirms both fixes.
- No remaining actionable P0/P1/P2 findings.

## Fidelity surfaces

- Typography: Instrument Serif regular display; Inter 400/500 for hero text; muted upright emphasis. TalentFound headline is intentionally different from the Velorah copy.
- Layout: fullscreen video, centered content, generous negative space, rounded glass CTA. Existing TalentFound header switches to mobile navigation at 900px; this deliberate breakpoint differs from the reference. The remaining page follows immediately below the fullscreen hero.
- Colors: deep navy fallback, white primary type, supplied gray emphasis and glass-border gradient. Red TalentFound symbol retained. No decorative background overlay.
- Imagery: exact supplied CloudFront film, object-cover, autoplay/loop/muted/playsInline. Browser confirms decoded video. Frame-by-frame subject movement is expected.
- Content: original TalentFound headline and signup action retained; descriptive supporting sentence added. Existing navigation targets and lower homepage sections retained.

## Verification

- Next.js production build and TypeScript passed.
- Targeted ESLint passed.
- Production mobile menu opens/closes.
- Video pause and resume controls work.
- Hero signup CTA opens the existing account page.
- No browser console warnings/errors in production verification.
- No horizontal overflow at mobile and reference sizes.
- Reduced-motion preference pauses the film and disables entrance motion in code.

The existing port-3000 development session showed stale client behavior during verification. Final interactive checks use the clean production preview on port 3001.
