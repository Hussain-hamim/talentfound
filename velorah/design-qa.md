# Velorah visual QA

final result: passed

## Evidence

- Source: `/var/folders/sp/33j8nyh535jb846k8yn2zh9h0000gn/T/codex-clipboard-43e6407a-2a7d-44b2-a541-e76611228bec.png`
- Desktop implementation: `qa/desktop.png`
- Mobile implementation: `qa/mobile.png`
- Preview: http://127.0.0.1:4173/
- Reference and desktop capture: 800 × 589 pixels, 800 × 589 CSS viewport, 1× density. No normalization required. Both images were displayed together in the same comparison tool result.
- Mobile: 390 × 844 CSS pixels, 1× density.
- State: home, navigation and dialogs closed, video playing, entrance animation complete.
- Full-view comparison covers typography, navigation, buttons, copy, video subject and crop. Focused crop was unnecessary: all text and glass contours were readable in the 800px images.

## Findings and comparison history

Initial render had a headline approximately 33px narrower than the reference, with its top 12px too low. The paragraph and CTA also sat too low (P2). Increased desktop display size from 6.92vw to 7.25vw and adjusted tablet hero padding and paragraph/button spacing. Recaptured and compared both source and implementation together. The revised heading matches the single-line span and vertical placement; the paragraph and CTA align closely with the reference. No remaining P0/P1/P2 findings.

## Required fidelity surfaces

- Fonts: Instrument Serif display, Inter body/UI; regular upright muted emphasis. Desktop line stays intact; mobile wraps cleanly into two lines.
- Spacing: centered headline and supporting copy, restrained header, generous space for the video. Responsive 390px layout has no clipped controls or horizontal overflow.
- Color: supplied HSL variables and the exact glass border gradient, inset shadow, and 4px backdrop blur. No hero overlay or decorative imagery.
- Images: exact supplied video URL, fullscreen object-cover, autoplay, muted, inline and looping. Browser showed decoded frames and advancing playback; the depicted people, desks and flowers match the source. Differences in position/sharpness and blue tone reflect the moving video rather than a substituted asset.
- Copy: requested logo, headline, navigation, paragraph, and CTAs are present. A typographic apostrophe is used in “We’re”.

## Interactions

- Hero journey CTA opens the accessible Radix dialog with input focus.
- Blank intention cannot submit; entering text enables the action.
- Saving displays the entered intention and an explicit browser-local success state.
- Closing restores the hero; mobile navigation opens and Studio displays its panel.
- Video pause/resume, Escape dismissal and console checked in final verification.
- Journal/contact panel content is a transparent prototype placeholder, not a connected service.
- A discreet pause control and mobile menu are deliberate accessibility additions.

## Follow-up polish

- P3: small header spacing/font differences at 800px; no effect on composition or use.
- Video frames differ over time, so pixel-identical background comparisons are not expected.

## Implementation checklist

- [x] Match supplied visual and typography.
- [x] Verify exact video source in the browser.
- [x] Verify desktop and mobile layout.
- [x] Exercise the primary CTA and mobile navigation.
- [x] Run production build and TypeScript checks.
