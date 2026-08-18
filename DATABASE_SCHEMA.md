# Database Schema

This document reflects the schema defined by the migrations in [`supabase/migrations/`](supabase/migrations/). It is the source of truth for the database — if the UI or any other documentation disagrees with this file, the migrations win and the UI should be updated to match.

Migrations, in apply order:

| # | File | Purpose |
|---|------|---------|
| 001 | `001_extensions.sql` | Extensions + shared trigger function |
| 002 | `002_enums.sql` | Enum types |
| 003 | `003_profiles.sql` | `profiles` |
| 004 | `004_machine_categories.sql` | `machine_categories` |
| 005 | `005_capabilities.sql` | Capability/profile-role tables + category mappings |
| 006 | `006_marketplace.sql` | `marketplace_listings`, `listing_images` |
| 007 | `007_service_jobwork_jobs.sql` | `service_requirements`, `jobwork_requirements`, `job_posts` |
| 008 | `008_enquiries.sql` | `enquiries` |
| 009 | `009_seed_machine_categories.sql` | Seed data for `machine_categories` |
| 010 | `010_auth_triggers.sql` | Auto-create a profile on signup |
| 011 | `011_capability_category_write_rls.sql` | Owner-write RLS on the 3 capability-category join tables |
| 012 | `012_enquiries_capability_references.sql` | Direct-contact enquiry references to service/jobwork capability profiles |
| 013 | `013_enquiries_job_seeker_reference.sql` | Direct-contact enquiry reference to job seeker profiles |
| 014 | `014_profile_onboarding.sql` | `profiles.interests` + `profiles.onboarded_at` for the onboarding wizard |

---

## Conceptual model

There is **one account type**: an authenticated user has exactly one `profiles` row. A profile can optionally hold any combination of role-specific capability rows (`service_capabilities`, `jobwork_capabilities`, `job_seeker_profiles`) and can create listings/requirements/posts across any marketplace module. There are no separate buyer/seller/service-provider account types — role is expressed through which rows exist for a profile, not through account type.

```
auth.users (Supabase Auth)
      │ 1:1 (id, trigger-created)
      ▼
   profiles ──────────────────────────────────────────────────────────────┐
      │ 1:N                                                                │
      ├── marketplace_listings ──1:N── listing_images                     │
      │        │ N:1                                                      │
      │        └── machine_categories (self-referencing tree)             │
      │                                                                    │
      ├── service_capabilities (1:1, profile_id is PK) ──N:M── machine_categories
      │        (via service_capability_categories)                        │
      ├── jobwork_capabilities (1:1, profile_id is PK) ──N:M── machine_categories
      │        (via jobwork_capability_categories)                        │
      ├── job_seeker_profiles (1:1, profile_id is PK) ──N:M── machine_categories
      │        (via job_seeker_categories)                                │
      │                                                                    │
      ├── service_requirements ──N:1── machine_categories                 │
      ├── jobwork_requirements ──N:1── machine_categories                 │
      ├── job_posts ──N:1(nullable)── machine_categories                  │
      │                                                                    │
      └── enquiries (from_profile_id / to_profile_id) ────────────────────┘
               └── references exactly ONE of:
                   marketplace_listing_id | service_requirement_id |
                   jobwork_requirement_id | job_post_id
```

---

## Extensions & shared infrastructure (`001_extensions.sql`)

- **`pgcrypto`** — provides `gen_random_uuid()` used for all primary keys.
- **`public.update_updated_at_column()`** — trigger function that sets `updated_at = NOW()` on `UPDATE`. Attached via a `BEFORE UPDATE` trigger to every table that has an `updated_at` column.

## Enum types (`002_enums.sql`)

| Type | Values | Used by |
|------|--------|---------|
| `listing_intent` | `BUY`, `SELL`, `REQUIREMENT` | `marketplace_listings.intent` |
| `listing_status` | `ACTIVE`, `INACTIVE` | `marketplace_listings`, `service_requirements`, `jobwork_requirements`, `job_posts` |
| `condition_type` | `NEW`, `USED` | `marketplace_listings.condition` |
| `profile_status` | `ACTIVE`, `SUSPENDED` | `profiles.status` |
| `interest_domain` | `marketplace`, `services`, `jobs`, `jobwork` | `profiles.interests` (added in `014_profile_onboarding.sql`) |

---

## Tables

### `profiles`

One row per authenticated user (`id` = `auth.users.id`, `ON DELETE CASCADE`). Auto-created by the `on_auth_user_created` trigger (see [Triggers & functions](#triggers--functions)) — the app should never need to manually insert a profile.

| Column | Type | Notes |
|---|---|---|
| `id` | `UUID` PK | FK → `auth.users(id)` |
| `company_name` | `TEXT` | nullable; if present, must be non-blank |
| `city` | `TEXT` | nullable, indexed |
| `state` | `TEXT` | nullable, indexed |
| `about` | `TEXT` | nullable |
| `website` | `TEXT` | nullable; if present, must be non-blank |
| `status` | `profile_status` | default `ACTIVE`, indexed |
| `interests` | `interest_domain[]` | default `{}`; soft "what are you here for" signal from the onboarding wizard (`marketplace`/`services`/`jobs`/`jobwork`, mirrors `src/lib/domains.jsx`) — added in `014_profile_onboarding.sql`. Not a capability grant; distinct from `service_capabilities`/`jobwork_capabilities`/`job_seeker_profiles` |
| `onboarded_at` | `TIMESTAMPTZ` | nullable; set when the onboarding wizard is completed *or skipped* — `NULL` means not yet shown, added in `014_profile_onboarding.sql` |
| `created_at` / `updated_at` | `TIMESTAMPTZ` | `updated_at` auto-maintained |

**RLS:** anyone can `SELECT` where `status = 'ACTIVE'`. Only the owning user (`id = auth.uid()`) can `INSERT`/`UPDATE`/`DELETE` their own row — `interests`/`onboarded_at` ride along on the existing owner-write policy, no new RLS needed.

### `machine_categories`

Self-referencing hierarchical category tree (top-level categories have `parent_id IS NULL`). Shared across marketplace listings, service/job-work capabilities & requirements, job seeker skills, and job posts.

| Column | Type | Notes |
|---|---|---|
| `id` | `UUID` PK | |
| `parent_id` | `UUID` | FK → `machine_categories(id)`, `ON DELETE RESTRICT`, nullable |
| `name` | `TEXT` | required |
| `display_order` | `INTEGER` | default `0`, indexed |
| `is_active` | `BOOLEAN` | default `TRUE`, indexed |
| `created_at` / `updated_at` | `TIMESTAMPTZ` | |

Unique constraint: `(parent_id, name)` — sibling categories must have distinct names.

**RLS:** anyone can `SELECT` where `is_active = TRUE`. No public insert/update/delete policy (management is expected to happen outside the app / via migrations or an admin path).

Seeded with a two-level taxonomy in `009_seed_machine_categories.sql` (24 top-level categories, ~140 subcategories — e.g. Metal Working Machines → Lathe, CNC Milling, etc.).

### `marketplace_listings`

Buy / Sell / Requirement listings for machinery, tools & accessories.

| Column | Type | Notes |
|---|---|---|
| `id` | `UUID` PK | |
| `profile_id` | `UUID` | FK → `profiles(id)`, `ON DELETE CASCADE` |
| `machine_category_id` | `UUID` | FK → `machine_categories(id)`, `ON DELETE RESTRICT` |
| `intent` | `listing_intent` | `BUY` / `SELL` / `REQUIREMENT` |
| `title` | `TEXT` | required |
| `description` | `TEXT` | nullable |
| `condition` | `condition_type` | nullable (`NEW` / `USED`) |
| `price` | `NUMERIC(12,2)` | nullable, must be `>= 0` |
| `quantity` | `INTEGER` | default `1`, must be `> 0` |
| `city` / `state` | `TEXT` | nullable, indexed |
| `status` | `listing_status` | default `ACTIVE`, indexed |
| `created_at` / `updated_at` | `TIMESTAMPTZ` | |

Indexed on `profile_id`, `machine_category_id`, `intent`, `status`, `city`, `state`.

**RLS:** anyone can `SELECT` where `status = 'ACTIVE'`. Owner (`profile_id = auth.uid()`) can insert/update/delete their own listings.

### `listing_images`

Images for a `marketplace_listings` row, stored in Supabase Storage (this table holds only the storage path, not binary data).

| Column | Type | Notes |
|---|---|---|
| `id` | `UUID` PK | |
| `listing_id` | `UUID` | FK → `marketplace_listings(id)`, `ON DELETE CASCADE` |
| `storage_path` | `TEXT` | required |
| `display_order` | `INTEGER` | default `0`, must be `>= 0` |
| `is_primary` | `BOOLEAN` | default `FALSE`, indexed |
| `created_at` | `TIMESTAMPTZ` | |

**RLS:** anyone can `SELECT`. Insert/delete only permitted when the caller owns the parent listing (checked via `EXISTS` against `marketplace_listings`). No update policy — images are added/removed, not edited.

### `service_capabilities`

One-to-one "I offer repair/service" business profile. `profile_id` is the primary key (not a surrogate `id`), enforcing at most one capability row per profile.

| Column | Type | Notes |
|---|---|---|
| `profile_id` | `UUID` PK | FK → `profiles(id)`, `ON DELETE CASCADE` |
| `title` | `TEXT` | required |
| `description` | `TEXT` | nullable |
| `city` / `state` | `TEXT` | nullable, indexed |
| `is_active` | `BOOLEAN` | default `TRUE`, indexed |
| `created_at` / `updated_at` | `TIMESTAMPTZ` | |

**RLS:** anyone can `SELECT` where `is_active = TRUE`. Owner has full (`FOR ALL`) access via `profile_id = auth.uid()`.

### `jobwork_capabilities`

Same shape and policies as `service_capabilities`, for "I offer manufacturing/job work" profiles.

### `job_seeker_profiles`

One-to-one professional profile for users seeking employment.

| Column | Type | Notes |
|---|---|---|
| `profile_id` | `UUID` PK | FK → `profiles(id)`, `ON DELETE CASCADE` |
| `headline` | `TEXT` | nullable |
| `about` | `TEXT` | nullable |
| `experience_years` | `INTEGER` | default `0`, must be `>= 0` |
| `resume_url` | `TEXT` | nullable |
| `city` / `state` | `TEXT` | nullable, indexed |
| `is_active` | `BOOLEAN` | default `TRUE`, indexed |
| `created_at` / `updated_at` | `TIMESTAMPTZ` | |

**RLS:** same pattern — public read when active, owner has full access.

### Capability ↔ category mapping tables

Three parallel many-to-many join tables link a capability profile to the `machine_categories` it covers (a service/job-work provider or job seeker can list multiple categories of expertise):

- **`service_capability_categories`** — `(profile_id, machine_category_id)` PK. `profile_id` FK → `service_capabilities(profile_id)`, `ON DELETE CASCADE`.
- **`jobwork_capability_categories`** — same shape, FK → `jobwork_capabilities(profile_id)`.
- **`job_seeker_categories`** — same shape, FK → `job_seeker_profiles(profile_id)`.

All three: `machine_category_id` FK → `machine_categories(id)`, `ON DELETE RESTRICT`. **RLS:** public read (`USING (TRUE)`) plus an owner-scoped `FOR ALL` policy (`profile_id = auth.uid()`, added in `011_capability_category_write_rls.sql`) — users can tag/untag categories on their own capability profile.

### `service_requirements`

"I need a repair/service" requirement posts (the demand side of the services module).

| Column | Type | Notes |
|---|---|---|
| `id` | `UUID` PK | |
| `profile_id` | `UUID` | FK → `profiles(id)`, `ON DELETE CASCADE` |
| `machine_category_id` | `UUID` | FK → `machine_categories(id)`, `ON DELETE RESTRICT` |
| `title` | `TEXT` | required |
| `description` | `TEXT` | nullable |
| `city` / `state` | `TEXT` | nullable, indexed |
| `status` | `listing_status` | default `ACTIVE`, indexed |
| `created_at` / `updated_at` | `TIMESTAMPTZ` | |

**RLS:** public read when `ACTIVE`; owner has full access.

### `jobwork_requirements`

Same shape and policies as `service_requirements`, for "I need a job-work vendor" posts.

### `job_posts`

Job vacancies posted by employers.

| Column | Type | Notes |
|---|---|---|
| `id` | `UUID` PK | |
| `profile_id` | `UUID` | FK → `profiles(id)`, `ON DELETE CASCADE` |
| `machine_category_id` | `UUID` | FK → `machine_categories(id)`, **`ON DELETE SET NULL`**, nullable (a job post doesn't strictly need a category) |
| `title` | `TEXT` | required |
| `description` | `TEXT` | nullable |
| `city` / `state` | `TEXT` | nullable, indexed |
| `status` | `listing_status` | default `ACTIVE`, indexed |
| `created_at` / `updated_at` | `TIMESTAMPTZ` | |

**RLS:** public read when `ACTIVE`; owner has full access.

### `enquiries`

Cross-module enquiry/contact messages. A single table backs enquiries for all marketplace-like modules **and** direct contact with a service/job-work provider or job-seeker profile; exactly one of seven reference columns must be set.

| Column | Type | Notes |
|---|---|---|
| `id` | `UUID` PK | |
| `from_profile_id` | `UUID` | FK → `profiles(id)`, `ON DELETE CASCADE` |
| `to_profile_id` | `UUID` | FK → `profiles(id)`, `ON DELETE CASCADE` |
| `marketplace_listing_id` | `UUID` | FK → `marketplace_listings(id)`, `ON DELETE CASCADE`, nullable |
| `service_requirement_id` | `UUID` | FK → `service_requirements(id)`, `ON DELETE CASCADE`, nullable |
| `jobwork_requirement_id` | `UUID` | FK → `jobwork_requirements(id)`, `ON DELETE CASCADE`, nullable |
| `job_post_id` | `UUID` | FK → `job_posts(id)`, `ON DELETE CASCADE`, nullable |
| `service_capability_profile_id` | `UUID` | FK → `service_capabilities(profile_id)`, `ON DELETE CASCADE`, nullable — direct contact with a service provider's profile, added in `012_enquiries_capability_references.sql` |
| `jobwork_capability_profile_id` | `UUID` | FK → `jobwork_capabilities(profile_id)`, `ON DELETE CASCADE`, nullable — direct contact with a job-work vendor's profile, added in `012_enquiries_capability_references.sql` |
| `job_seeker_profile_id` | `UUID` | FK → `job_seeker_profiles(profile_id)`, `ON DELETE CASCADE`, nullable — direct contact with a job seeker's profile, added in `013_enquiries_job_seeker_reference.sql` |
| `message` | `TEXT` | required |
| `is_read` | `BOOLEAN` | default `FALSE` |
| `created_at` | `TIMESTAMPTZ` | indexed `DESC` |

`CHECK` constraint `chk_exactly_one_reference` enforces that **exactly one** of the seven reference columns is non-null — an enquiry always targets exactly one listing/requirement/post/capability-profile/seeker-profile, never zero or multiple.

**RLS:** participants only. `SELECT` where the caller is sender or recipient. `INSERT` only as sender (`from_profile_id = auth.uid()`). `UPDATE` only by the recipient (`to_profile_id = auth.uid()`) — e.g. for marking `is_read`. No delete policy.

Note: there is no dedicated messages/conversation-thread table — `enquiries` is the only messaging primitive currently in the schema (single message + read flag, not a thread).

---

## Triggers & functions

| Trigger | Table | Fires | Function |
|---|---|---|---|
| `trg_profiles_updated_at` | `profiles` | `BEFORE UPDATE` | `update_updated_at_column()` |
| `trg_machine_categories_updated_at` | `machine_categories` | `BEFORE UPDATE` | `update_updated_at_column()` |
| `trg_service_capabilities_updated_at` | `service_capabilities` | `BEFORE UPDATE` | `update_updated_at_column()` |
| `trg_jobwork_capabilities_updated_at` | `jobwork_capabilities` | `BEFORE UPDATE` | `update_updated_at_column()` |
| `trg_job_seeker_profiles_updated_at` | `job_seeker_profiles` | `BEFORE UPDATE` | `update_updated_at_column()` |
| `trg_marketplace_updated_at` | `marketplace_listings` | `BEFORE UPDATE` | `update_updated_at_column()` |
| `trg_service_requirements_updated_at` | `service_requirements` | `BEFORE UPDATE` | `update_updated_at_column()` |
| `trg_jobwork_requirements_updated_at` | `jobwork_requirements` | `BEFORE UPDATE` | `update_updated_at_column()` |
| `trg_job_posts_updated_at` | `job_posts` | `BEFORE UPDATE` | `update_updated_at_column()` |
| `on_auth_user_created` | `auth.users` | `AFTER INSERT` | `public.handle_new_user()` — inserts a matching `profiles` row (`SECURITY DEFINER`) |

`listing_images` and `enquiries` have no `updated_at` column and no update trigger (rows are effectively append-only / delete-only).

---

## Row Level Security summary

RLS is enabled on every table. General pattern:

- **Public read** is scoped to "active" rows only (`status = 'ACTIVE'` or `is_active = TRUE`), never to all rows — inactive/suspended data is invisible to other users.
- **Writes are owner-scoped** via `profile_id = auth.uid()` (or `id = auth.uid()` for `profiles` itself). There are no admin/service-role bypass policies defined in these migrations.
- **`enquiries`** is the exception to "owner-scoped": visibility and mutation are scoped to *participant* (`from_profile_id` or `to_profile_id`), not a single owner.
- **Category tables** (`machine_categories` and all three capability-category join tables) are public-read-only with no self-service write policy — inserts/updates currently require elevated privileges (service role) rather than a logged-in user's own RLS grant.

---

## Notes for UI implementation

- Do not surface raw identifiers/enum values (`listing_intent`, `profile_id`, `machine_category_id`, etc.) in user-facing copy — see `CLAUDE.md` UX guidelines. Map them to plain-language labels (e.g. `intent = 'SELL'` → "For Sale").
- A single `profiles` row can simultaneously have `marketplace_listings`, a `service_capabilities` row, a `jobwork_capabilities` row, and a `job_seeker_profiles` row — the UI should present these as activities/roles a user has enabled, not as separate account types.
- The "Messages" UI concept (conversation list, threads) does not have a matching table today — the schema only has flat `enquiries` rows (one message + `is_read`, tied to exactly one listing/requirement/post). Any conversation-thread UI needs to be derived by grouping `enquiries` by `(from_profile_id, to_profile_id)` and/or the referenced item, or the schema needs a new migration to support real threads — confirm which before building it.
