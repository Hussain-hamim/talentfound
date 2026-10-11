# Search and social sharing

## Shipped foundations

- Homepage, developer directory, and published profiles have distinct titles, descriptions, canonical URLs, Open Graph, and large-image Twitter/X cards.
- `/share-image` renders the branded 1200×630 PNG. Each `/developers/[handle]/opengraph-image` renders a profile-specific card; fictional profiles are labelled Demo.
- Homepage JSON-LD describes the website and organization. Real profiles expose ProfilePage/Person and breadcrumb markup using only public fields, with script-safe serialization. Sample ratings are not presented as structured-data reviews.
- `/sitemap.xml` uses anonymous access, includes only published non-demo profiles, paginates database reads, and refreshes hourly. No invented modification dates are emitted.
- Demo profiles, filtered directory URLs, authentication, onboarding, workspaces, messages, and the design exploration are excluded from indexing. Canonicals strip directory query parameters. Robots allows crawlers to read page-level noindex, while blocking API/auth handlers. Preview deployments and localhost are noindex.
- Profile fetches are deduplicated per request for metadata and page rendering.

## Before and after buying a domain

Set `NEXT_PUBLIC_APP_URL` to the canonical HTTPS origin and redeploy. It controls SEO URLs and social links as well as the existing auth configuration. The current fallback is `https://talent-found-os.vercel.app`. Keep localhost for local development. Vercel Preview deployments receive noindex even when configured with the production origin.

When the domain is available:

1. Connect it in Vercel and redirect alternate domains (including the old production address) to the chosen canonical domain with permanent redirects. Choose one www/non-www version.
2. Update `NEXT_PUBLIC_APP_URL`, Supabase Site URL, and allowed auth callback URLs together; deploy and test sign-in.
3. Verify ownership in Google Search Console and Bing Webmaster Tools, then submit `/sitemap.xml`. Search Console is separate from Google Analytics; neither is required to emit metadata.
4. Check the homepage and a real profile using Google's Rich Results Test and Search Console URL Inspection. Search appearance and rich results are determined by search engines, not guaranteed by markup.
5. Test link previews on the platforms you use. Platforms cache previews; request a refresh when the image or domain changes.
6. Add analytics with your chosen consent/privacy setup. No tracking scripts or fabricated verification IDs were added.

## Checks

Run `node --experimental-strip-types --test tests/seo.test.mjs`, TypeScript, ESLint, and `next build`. Inspect page source with a crawler user agent (e.g. Twitterbot) because Next.js streams metadata for ordinary browser requests. Verify both image endpoints return PNG and profile-not-found requests return 404.

Editorial SEO remains ongoing: encourage detailed, original profiles, descriptive project names, meaningful project image alt text, and current availability. Avoid publishing duplicate demo content or adding keyword-stuffed pages.
