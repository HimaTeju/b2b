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
