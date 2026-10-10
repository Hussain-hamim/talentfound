# Demo developer profiles

Five explicitly requested, persistent demo developers are seeded in project `zgpqyctyxozsvbjayhaf`: Alex Morgan (`demo-alex-morgan`), Jamie Chen (`demo-jamie-chen`), Nadia Hassan (`demo-nadia-hassan`), Sam Rivera (`demo-sam-rivera`), and Maya Patel (`demo-maya-patel`). They have complete public details, PNG avatars, and seventeen published projects with WebP covers in Supabase Storage.

To seed only the two newest fixtures, append `demo-sam-rivera demo-maya-patel` to the seed command.

Run `node --env-file=.env.local scripts/seed-demo-developers.mjs` to seed or refresh only these fixtures. The script checks the project, reserved fixture email, and administrator-controlled `talentfound_demo` metadata before updating anything. Passwords are random and not retained, logins are banned, and notifications are off. Existing real member profiles are untouched.

The landing page uses real database records with the richer showcase card layout. Sample testimonials are stored in `scripts/data/demo-developers.json`, clearly labeled, and never inserted into the real reviews table or used for discovery ranking. Demo profile routes are noindex and excluded from the sitemap. Portfolio/social links for demo cards lead to their internal showcase and sample-link explanation; no fictional GitHub or LinkedIn identity is presented as real.

Demo profiles accept messages and project invitations through the normal contact forms for testing. Senders still sign in, verify their email, and complete onboarding. Test messages, project briefs, and invitations persist through the normal messaging backend and appear in the sender’s inbox. The seeded accounts cannot log in or reply, and their email notifications remain off. No automatic replies or invitation responses are generated.

Remove these fixtures before launch if you no longer want labeled demo accounts in discovery. This seed is explicit, not an automatic production migration.
