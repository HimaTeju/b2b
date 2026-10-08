# Load testing (k6)

Load-tests the marketplace's highest-traffic Supabase-backed flows: browse/filter,
search, listing detail, sign-in, and enquiry submission (write path). There's no app
server here — the client talks to Supabase (PostgREST/GoTrue) directly — so this
exercises the real query patterns and RLS policy cost, the same way `rls/` and `e2e/`
do, rather than load-testing anything of our own.

## Safety: this runs against the live project, deliberately, with guardrails

Issue #39 originally called for a dedicated test Supabase project so load testing
could never affect production. That was reconsidered: for `rls/`'s integration tests
(#33), a second project was already rejected as unnecessary overhead in favor of the
same live project the app's `.env` points at — a few assertion queries are low-risk.
**Load testing is explicitly not low-risk in the same way** — it generates real
concurrent traffic on purpose — so this decision was revisited deliberately (not
inherited from the RLS precedent) and the tradeoff was accepted: run against the
live project, but only at conservative concurrency, off-peak, with explicit
opt-in and easy cleanup. If usage grows enough that this stops being an acceptable
risk, revisit provisioning a dedicated project before raising concurrency further.

Guardrails baked into `load/marketplace.js`:

- **Explicit opt-in required.** The script refuses to run unless
  `LOAD_TEST_CONFIRM=live` is set — you have to consciously acknowledge you're
  about to generate traffic on the live project every time.
- **Low default concurrency.** 2-3 VUs per read scenario, single-digit iteration
  counts for sign-in and the enquiry write path (see `options.scenarios` in
  `marketplace.js`). Override with `-e BROWSE_VUS=10` etc. only once a lower run
  has shown headroom — see "Raising concurrency" below.
- **Sign-in is iteration-capped, not duration-based**, because GoTrue rate-limits
  the password grant endpoint aggressively — a sustained-VU sign-in scenario would
  just generate 429s, not useful latency data.
- **The write path is tiny and cleans up after itself.** `enquiryWrite` creates at
  most a handful of enquiries per run, all prefixed `load-test-` (see
  `helpers/config.js`). Run `npm run test:load:cleanup` after every run against the
  live project.

Run it off-peak (whatever that means for your actual traffic pattern), and watch
the Supabase dashboard's usage graphs during and after a run, not just k6's own
output — the whole point is to see real database/connection-pool behavior.

## One-time setup

1. **Install k6.** It's a standalone Go binary, not an npm package — there's
   nothing to add to `package.json`'s dependencies (and installing an unofficial
   "k6" npm wrapper would be exactly the kind of extra dependency the issue asked
   to avoid). Install via your platform's package manager:
   - Windows: `choco install k6` (or `winget install k6`)
   - macOS: `brew install k6`
   - Linux / manual: see https://k6.io/docs/get-started/installation/
2. **Load the same env vars `rls/` uses** — `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
   (from `.env`), `E2E_USER1_EMAIL`/`E2E_USER1_PASSWORD`/`E2E_USER2_EMAIL`/
   `E2E_USER2_PASSWORD` (from `.env.e2e` — see `e2e/README.md` for creating these
   accounts if you don't have them), and `SUPABASE_SERVICE_ROLE_KEY` (only needed
   for `test:load:cleanup`).
3. **Seed representative data.** The `browse`/`search`/`listingDetail` scenarios
   need enough real ACTIVE `SELL` listings to be realistic — a handful of rows
   won't surface index/query-plan problems that show up at real scale. If the
   project doesn't already have enough seeded listings, add more via the app or
   a seed migration before running.

## Running

```
export $(cat .env | xargs) $(cat .env.e2e | xargs)   # or your shell's env-file equivalent
export LOAD_TEST_CONFIRM=live
npm run test:load
npm run test:load:cleanup
```

k6 prints per-scenario `http_req_duration` percentiles (p95/p99), request rate,
and error rate at the end of the run — that's the baseline to record (see
"Recording results" below). Requests are tagged by scenario
(`scenario:browse`, `scenario:search`, `scenario:listingDetail`, `scenario:signin`,
`scenario:enquiryWrite`) so you can filter k6's summary or an output backend
(e.g. `k6 run --out json=result.json`) per flow.

### Raising concurrency

Only raise `BROWSE_VUS` / `SEARCH_VUS` / `DETAIL_VUS` (via `-e NAME=value`) after a
lower run's error rate and dashboard usage graphs show headroom. Increase one
scenario at a time and re-check the dashboard — don't jump straight to a high
combined number. Never raise `SIGNIN_ITERATIONS` casually; check GoTrue's rate
limit settings for the project first.

## Investigating slow queries

If a scenario's p95/p99 is high or errors appear, don't guess — get the actual
query plan:

1. Note the failing/slow scenario's tag and find the matching query in
   `marketplace.js` (or the equivalent client code in `src/domains/marketplace/api/listings.js`
   / `src/lib/api/createRequirementApi.js`, `src/lib/api/enquiries.js` for the
   real app flow).
2. Run `EXPLAIN ANALYZE` on that exact query shape against the project (Supabase
   SQL Editor, or the Supabase MCP `execute_sql` tool) — e.g. for browse:
   ```sql
   EXPLAIN ANALYZE
   SELECT * FROM marketplace_listings
   WHERE status = 'ACTIVE' AND intent = 'SELL'
   ORDER BY created_at DESC LIMIT 20;
   ```
3. Watch for sequential scans on `marketplace_listings`/`enquiries` where an index
   would help, and note that `search`'s `ilike '%term%'` filters can't use a plain
   B-tree index (leading wildcard) — a `pg_trgm` GIN index is the usual fix if
   search latency shows up as a real bottleneck, not before.
4. For RLS cost specifically, compare `EXPLAIN ANALYZE` as the `anon` role vs. an
   authenticated role (`SET ROLE` in the SQL editor, or run the same request with
   vs. without an `Authorization` bearer token) — a big gap points at expensive
   policy evaluation rather than the base query.

Any index/policy change that comes out of this must be a normal migration (see
root `CLAUDE.md`) — don't apply one-off `CREATE INDEX` statements directly to the
live project outside a migration file.

## Recording results

Keep baseline numbers (requests/sec, p95/p99, error rate, concurrency level, date)
somewhere durable — a comment on issue #39 is the simplest option so it stays
attached to the decision record, matching how other testing-infra decisions in
this repo are tracked. Note anything Supabase-side that capped throughput
(connection pool exhaustion, PostgREST/GoTrue rate limits) rather than just the
client-side timing number.

## Related suites

- `npm run test:rls` (`rls/`) — same live project, functional RLS assertions
  rather than load.
- `npm run test:e2e` / `npm run test:pwa` (`e2e/`, `e2e-pwa/`) — browser-driven
  functional/PWA tests, also against the same live project.

## CI

Not wired into CI. Per the issue's own scope, this is manual/on-demand —
automating concurrent load generation on every PR against a live project isn't
something CI should ever do by default.
