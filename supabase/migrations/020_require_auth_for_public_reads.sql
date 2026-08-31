-- =============================================================================
-- Migration: 020_require_auth_for_public_reads.sql
-- Description:
--   The "Anyone can view active X" SELECT policies on `profiles`,
--   `marketplace_listings`, `service_capabilities`, `jobwork_capabilities`,
--   and `job_seeker_profiles` had no `auth.role() = 'authenticated'` check,
--   so any holder of the public anon key could read every active row via the
--   raw REST endpoint with no login — bypassing the app's client-side
--   PrivateRoute login wall, which only gates UI navigation, not data access.
--
--   This tightens read access on those 5 tables to require an authenticated
--   session, keeping the existing `status = 'ACTIVE'` / `is_active = TRUE`
--   condition alongside the new `auth.role() = 'authenticated'` check.
--   Policy names are kept as-is (drop + recreate under the same name,
--   mirroring the precedent in 018_recreate_listing_images_storage.sql) since
--   "Anyone" still accurately describes "any authenticated user" here.
--
--   NOTE: `machine_categories` (004), `service_requirements`,
--   `jobwork_requirements`, and `job_posts` (007) follow the same
--   "anyone can view active X" pattern but are intentionally left unchanged
--   here — out of scope for this fix, may need the same follow-up decision.
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

COMMIT;
