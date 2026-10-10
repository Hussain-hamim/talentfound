# Demo developer profiles

Three explicitly requested, persistent demo developers are seeded in project `zgpqyctyxozsvbjayhaf`: Alex Morgan (`demo-alex-morgan`), Jamie Chen (`demo-jamie-chen`), and Nadia Hassan (`demo-nadia-hassan`). They have complete public details, PNG avatars, and ten published projects with WebP covers in Supabase Storage.

Run `node --env-file=.env.local scripts/seed-demo-developers.mjs` to seed or refresh only these fixtures. The script checks the project, reserved fixture email, and administrator-controlled `talentfound_demo` metadata before updating anything. Passwords are random and not retained, logins are banned, and notifications are off. Existing real member profiles are untouched.

The landing page uses real database records with the richer showcase card layout. Sample testimonials are stored in `scripts/data/demo-developers.json`, clearly labeled, and never inserted into the real reviews table or used for discovery ranking. Demo profile routes are noindex and excluded from the sitemap. Portfolio/social links for demo cards lead to their internal showcase and sample-link explanation; no fictional GitHub or LinkedIn identity is presented as real. Contact pages explain that demo accounts are not available for hire.

Remove these fixtures before launch if you no longer want labeled demo accounts in discovery. This seed is explicit, not an automatic production migration.
