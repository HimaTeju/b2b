# End-to-end tests (Playwright)

Covers the critical flows from issue #17: login/register, post a listing, post a requirement,
send an enquiry, browse/filter.

These tests run against the same Supabase project configured in the app's `.env` — there is
no local/dockerized Supabase stack in this repo. Test-created data (users, listings, enquiries)
is prefixed with `e2e-test-` (see `e2e/helpers/testData.js`) so it's identifiable and safe to
clean up periodically from the Supabase dashboard.

## One-time setup: test accounts

Auth-dependent tests (post listing, post requirement, enquiry, browse/filter) need one or two
**pre-confirmed** user accounts, since this repo has no way to bypass Supabase's email
confirmation setting from the test run itself:

1. In the Supabase dashboard for this project, create two users (Authentication → Users →
   Add user), or sign up via the app's `/register` page and manually confirm them.
2. Copy `.env.e2e.example` to `.env.e2e` and fill in both accounts' credentials.
3. Load `.env.e2e` into your shell before running the suite.

Tests that need auth are automatically **skipped** (not failed) when these env vars aren't set,
so `npm run test:e2e` still runs the auth-independent tests without any setup.

## Running

```
npm run test:e2e       # headless
npm run test:e2e:ui    # interactive UI mode
```

The Playwright config starts `npm run dev` automatically if nothing is already listening on
`http://localhost:3000/b2b/`.

## CI

The suite runs on every pull request via the `e2e` job in `.github/workflows/ci.yml`, against
the same live Supabase project, using `E2E_USER1_EMAIL` / `E2E_USER1_PASSWORD` / `E2E_USER2_EMAIL`
/ `E2E_USER2_PASSWORD` GitHub Actions repo secrets (two `e2e-test-` prefixed accounts, pre-confirmed
in that project). On failure, the Playwright HTML report is uploaded as a build artifact.

## Related suites

- `npm run test:pwa` (`e2e-pwa/`, `playwright.pwa.config.js`) — service worker/manifest/offline
  behavior, run against a production build+preview (service workers don't register under `vite dev`).
- `npm run test:rls` (`rls/`, `vitest.rls.config.js`) — Supabase RLS integration tests against
  the same live project, using `@supabase/supabase-js` directly (no mocking, no browser) to
  assert row-level security actually enforces authorization: cross-user listing/capability
  writes are blocked, enquiry visibility is restricted to sender/recipient, unauthenticated reads
  are blocked (`020_require_auth_for_public_reads.sql`), and admin-only moderation plus the
  is_admin escalation guard behave as `021_admin_role.sql`/`022_fix_admin_escalation_guard.sql`
  intend. In addition to `E2E_USER1_EMAIL`/`E2E_USER1_PASSWORD`/`E2E_USER2_EMAIL`/
  `E2E_USER2_PASSWORD`, this suite needs `SUPABASE_SERVICE_ROLE_KEY` (see `.env.e2e.example`) to
  set up/tear down cross-user fixtures and grant/revoke the test admin role — keep this key out
  of `.env` (the client-bundled file) and only ever load it for this suite. Skips (not fails)
  when any of these env vars are missing.
