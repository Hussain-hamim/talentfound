# TalentFound color system

The shared palette lives in `app/globals.css`. Landing and authentication UI use the same dark foundation.

| Token              | Color     | Use                                              |
| ------------------ | --------- | ------------------------------------------------ |
| `--brand-black`    | `#151415` | Page background                                  |
| `--brand-red`      | `#ff3317` | Primary actions, brand marks, expressive accents |
| `--brand-brown`    | `#732214` | Warm accents and decorative shapes               |
| `--brand-white`    | `#ffffff` | Primary text and high contrast details           |
| `--surface`        | `#1e1c1e` | Alternate sections                               |
| `--surface-raised` | `#292629` | Cards and raised controls                        |
| `--surface-warm`   | `#30201e` | Warm card variation                              |
| `--muted`          | `#aaa5a7` | Secondary text                                   |

Use dark surfaces throughout; reserve white for type and small graphic details. Borders use the shared translucent white `--line` and `--line-strong` tokens. Use red sparingly so actions and the wordmark stay distinctive. Brown is an accent surface, not small text on black.

Portfolio examples can retain their own artwork palettes: they represent the members’ work, rather than TalentFound interface colors. Brand sculptures use dark studio backgrounds that blend into the page.

Keep the established typography, editorial spacing, understated motion, and reduced-motion support when adding new sections.

## Logo

The approved identity is the lowercase `talentfound` wordmark enclosed by red square brackets. The compact icon is `[tf]`. Do not use the former code-angle symbol or trailing period.

The outlined geometry is shared in `components/brand-artwork.ts`; `Brand` renders the responsive wordmark, and `MatchMark` renders the compact icon. The footer keeps its dot animation using the same outlined artwork. There is no runtime font dependency for the logo.

Ready-to-use SVG exports live in `public/brand/`: `talentfound-wordmark-dark.svg` (white lettering / red brackets), `talentfound-wordmark-light.svg` (black lettering / red brackets), `talentfound-wordmark-white.svg` (monochrome for red backgrounds), and `talentfound-icon.svg`. Keep the brackets square, preserve proportions, and use clean solid fills without glow or shadows.
