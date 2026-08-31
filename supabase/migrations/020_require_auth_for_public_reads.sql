-- =============================================================================
-- Migration: 020_require_auth_for_public_reads.sql
-- Description:
--   A repo-wide audit of every RLS policy in supabase/migrations found a
--   consistent "anyone can view active X" pattern with no
--   `auth.role() = 'authenticated'` check, so any holder of the public
--   (non-secret, frontend-bundled) anon key could read this data via the raw
--   REST endpoint with no login — bypassing the app's client-side
--   PrivateRoute login wall, which only gates UI navigation, not data access.
--
--   This makes every such table/policy require an authenticated session,
--   keeping each policy's existing active/is_active condition (or, for the
--   category join tables, `TRUE`) ANDed with `auth.role() = 'authenticated'`.
--   Policy names are kept as-is (drop + recreate under the same name,
--   mirroring the precedent in 018_recreate_listing_images_storage.sql) since
--   "Anyone" still accurately describes "any authenticated user" here.
--
--   Tables covered:
--     - profiles
--     - marketplace_listings
--     - listing_images
--     - service_capabilities
--     - jobwork_capabilities
--     - job_seeker_profiles
--     - service_capability_categories
--     - jobwork_capability_categories
--     - job_seeker_categories
--     - machine_categories
--     - service_requirements
--     - jobwork_requirements
--     - job_posts
--
--   NOTE: the `listing-images` Storage bucket (017/018) is a separate
--   concern from table RLS — it's provisioned with `public = TRUE`, which
--   makes Supabase serve objects via unsigned public URLs regardless of the
--   `storage.objects` SELECT policy, so it stays reachable without a
--   session even after this migration. The frontend deliberately relies on
--   this today (`listingImages.js`: "The bucket is public, so this is a
--   plain public URL, no signing needed"). Locking that down would mean
--   switching every listing image to signed URLs, a frontend-visible
--   architecture change with its own tradeoffs (expiring URLs, an async
--   signing call per image) — left as a follow-up decision rather than
--   folded into this migration.
-- =============================================================================

BEGIN;

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------

DROP POLICY IF EXISTS "Anyone can view active profiles" ON profiles;

CREATE POLICY "Anyone can view active profiles"
ON profiles
FOR SELECT
USING (
    status = 'ACTIVE'
    AND auth.role() = 'authenticated'
);

-- ---------------------------------------------------------------------------
-- marketplace_listings
-- ---------------------------------------------------------------------------

DROP POLICY IF EXISTS "Anyone can view active marketplace listings" ON marketplace_listings;

CREATE POLICY "Anyone can view active marketplace listings"
ON marketplace_listings
FOR SELECT
USING (
    status = 'ACTIVE'
    AND auth.role() = 'authenticated'
);

-- ---------------------------------------------------------------------------
-- listing_images
-- ---------------------------------------------------------------------------

DROP POLICY IF EXISTS "Anyone can view listing images" ON listing_images;

CREATE POLICY "Anyone can view listing images"
ON listing_images
FOR SELECT
USING (
    auth.role() = 'authenticated'
);

-- ---------------------------------------------------------------------------
-- service_capabilities
-- ---------------------------------------------------------------------------

DROP POLICY IF EXISTS "Anyone can view active service capabilities" ON service_capabilities;

CREATE POLICY "Anyone can view active service capabilities"
ON service_capabilities
FOR SELECT
USING (
    is_active = TRUE
    AND auth.role() = 'authenticated'
);

-- ---------------------------------------------------------------------------
-- jobwork_capabilities
-- ---------------------------------------------------------------------------

DROP POLICY IF EXISTS "Anyone can view active jobwork capabilities" ON jobwork_capabilities;

CREATE POLICY "Anyone can view active jobwork capabilities"
ON jobwork_capabilities
FOR SELECT
USING (
    is_active = TRUE
    AND auth.role() = 'authenticated'
);

-- ---------------------------------------------------------------------------
-- job_seeker_profiles
-- ---------------------------------------------------------------------------

DROP POLICY IF EXISTS "Anyone can view active job seeker profiles" ON job_seeker_profiles;

CREATE POLICY "Anyone can view active job seeker profiles"
ON job_seeker_profiles
FOR SELECT
USING (
    is_active = TRUE
    AND auth.role() = 'authenticated'
);

-- ---------------------------------------------------------------------------
-- Capability category join tables
-- ---------------------------------------------------------------------------

DROP POLICY IF EXISTS "Anyone can view service capability categories" ON service_capability_categories;

CREATE POLICY "Anyone can view service capability categories"
ON service_capability_categories
FOR SELECT
USING (
    auth.role() = 'authenticated'
);

DROP POLICY IF EXISTS "Anyone can view jobwork capability categories" ON jobwork_capability_categories;

CREATE POLICY "Anyone can view jobwork capability categories"
ON jobwork_capability_categories
FOR SELECT
USING (
    auth.role() = 'authenticated'
);

DROP POLICY IF EXISTS "Anyone can view job seeker categories" ON job_seeker_categories;

CREATE POLICY "Anyone can view job seeker categories"
ON job_seeker_categories
FOR SELECT
USING (
    auth.role() = 'authenticated'
);

-- ---------------------------------------------------------------------------
-- machine_categories
-- ---------------------------------------------------------------------------

DROP POLICY IF EXISTS "Anyone can view active machine categories" ON machine_categories;

CREATE POLICY "Anyone can view active machine categories"
ON machine_categories
FOR SELECT
USING (
    is_active = TRUE
    AND auth.role() = 'authenticated'
);

-- ---------------------------------------------------------------------------
-- service_requirements
-- ---------------------------------------------------------------------------

DROP POLICY IF EXISTS "Anyone can view active service requirements" ON service_requirements;

CREATE POLICY "Anyone can view active service requirements"
ON service_requirements
FOR SELECT
USING (
    status = 'ACTIVE'
    AND auth.role() = 'authenticated'
);

-- ---------------------------------------------------------------------------
-- jobwork_requirements
-- ---------------------------------------------------------------------------

DROP POLICY IF EXISTS "Anyone can view active jobwork requirements" ON jobwork_requirements;

CREATE POLICY "Anyone can view active jobwork requirements"
ON jobwork_requirements
FOR SELECT
USING (
    status = 'ACTIVE'
    AND auth.role() = 'authenticated'
);

-- ---------------------------------------------------------------------------
-- job_posts
-- ---------------------------------------------------------------------------

DROP POLICY IF EXISTS "Anyone can view active job posts" ON job_posts;

CREATE POLICY "Anyone can view active job posts"
ON job_posts
FOR SELECT
USING (
    status = 'ACTIVE'
    AND auth.role() = 'authenticated'
);

COMMIT;
