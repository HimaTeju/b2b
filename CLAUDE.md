# B2B

## Project

Mobile-first B2B marketplace PWA built with React + Vite + Supabase.

The marketplace supports:

- Machinery
- Tools & accessories
- Repair & services
- Jobs/Careers 
- Job work

A single user account can participate in multiple activities. Do not introduce separate buyer/seller/service-provider account types unless explicitly requested.

## Important Aspects

- All users are buyers & sellers
- Any user who wish to be job work vendor, service provider or job seeker has to enable the capability for their account
- Listing intent has 3 DB enum values (buy, sell, requirement), but the UI only ever creates sell and requirement listings — buy is unused/retired from the frontend by design.

## Product Principles

- Optimize for mobile-first UX.
- Prefer a dedicated form per user intent (e.g. separate sell vs. requirement forms) over one generic form with a mode/intent picker inside it — let navigation context decide which form loads, not the user inside the form.
- Minimize user decisions and form fields.
- Prefer progressive disclosure over large forms.
- Prefer `Browse → Understand → Enquire`.
- Prefer `Intent → Relevant details → Publish` for posting.
- Do not add features outside the requested scope.

## Architecture

- Follow existing React/Vite patterns before introducing new abstractions or libraries.
- Use the existing authentication/context and routing patterns.
- Keep authorization centralized; UI visibility is not authorization.
- Do not introduce Redux, Zustand, React Query, new UI frameworks, or other major dependencies without a clear need.
- Keep marketplace concepts represented through listing intent/type rather than separate user accounts.
- Only Marketplace is implemented (browse/post/detail/enquire). Services, Jobs/Career, and Job Work are placeholder "coming soon" screens (`ComingSoonSection`) reachable from the Home hub — build them out the same way Marketplace was built, not from scratch patterns.
- `src/lib/api/` is one module per domain/table (`categories.js`, `profiles.js`, `listings.js`, `enquiries.js`), not a single `api.js`. Follow this pattern when adding Services/Jobs/Job Work data access.
- Visual design tokens (palette, fonts, the `.stamp` badge motif) live in `src/index.css`. Reuse these rather than introducing new colors/fonts for new screens.

## Supabase

- PostgreSQL/Supabase is the source of truth for persistent marketplace data.
- Existing migration files are authoritative for the database schema.
- All schema changes must be represented as migrations.
- Inspect existing migrations, foreign keys, indexes, and RLS policies before changing database behavior.
- Never disable RLS as a shortcut for fixing authorization/query errors.
- Never expose the Supabase service-role key or other secrets to the frontend.
- Client configuration uses `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.

## Database

Prefer normalized relationships and existing foreign keys.

Important relationships include:

    auth.users → profiles → marketplace_listings
    marketplace_listings → listing_images
    marketplace_listings → machine_categories
    marketplace_listings → enquiries

Do not duplicate relational data in listings when an existing relationship should be used.

README.md is stale (describes an old mock/demo version of the app) — treat DATABASE_SCHEMA.md as the authoritative reference for current schema and app structure.

## UX

- Listing cards should expose only information useful for deciding whether to open the listing.
- Listing detail pages should prioritize the listing information and one clear primary enquiry/contact action.
- Only show filters relevant to the current marketplace context.
- Avoid exposing database terminology such as `listing_intent`, `profile_id`, or `listing_type_id` in user-facing UI.
- Every asynchronous user action should have appropriate loading, error, and empty states.

## PWA / Deployment

- The application is deployed under the GitHub Pages base path `/b2b/`.
- Changes to routing, Vite configuration, PWA configuration, or deployment workflows must preserve GitHub Pages deployment.

## Security

Never:

- Commit secrets.
- Trust client-side authorization.
- Bypass authentication.
- Disable security controls to make a feature work.
- Expose privileged Supabase credentials to the client.

## Development Workflow

Try to write modularized code

Before making non-trivial changes:

1. Inspect the relevant existing implementation.
2. Inspect migrations if the change touches data.
3. Make the smallest change that satisfies the request.
4. Run the relevant existing tests/lint/build commands. (No lint script is configured — `npm run build` (vite build) is the correctness check. Dev server is `npm run dev`.)
5. Review the final diff for unintended changes.

Never discard existing user changes or use destructive Git commands unless explicitly instructed.

Do not claim something was tested, migrated, or deployed unless it was actually verified.

### Commit messages

Do not add a Claude session link or a "Co-Authored-By: Claude" line to commit messages, PR descriptions, or GitHub comments.

## Scope

Do not silently expand the task.

If a change requires a significant product or database decision that is not specified, ask before implementing it.

For minor implementation decisions, follow existing repository conventions.