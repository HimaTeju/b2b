-- =============================================================================
-- Migration: 011_capability_category_write_rls.sql
-- Description:
--   The three capability-category join tables (service_capability_categories,
--   jobwork_capability_categories, job_seeker_categories) were created in
--   005_capabilities.sql with RLS enabled but only a public SELECT policy.
--   No INSERT/UPDATE/DELETE policy exists, so a user cannot currently tag
--   their own capability profile with categories. This adds an owner-scoped
--   write policy mirroring the pattern already used on the parent capability
--   tables themselves.
-- =============================================================================

BEGIN;

CREATE POLICY "Users manage own service capability categories"
ON service_capability_categories
FOR ALL
USING (profile_id = auth.uid())
WITH CHECK (profile_id = auth.uid());

CREATE POLICY "Users manage own jobwork capability categories"
ON jobwork_capability_categories
FOR ALL
USING (profile_id = auth.uid())
WITH CHECK (profile_id = auth.uid());

CREATE POLICY "Users manage own job seeker categories"
ON job_seeker_categories
FOR ALL
USING (profile_id = auth.uid())
WITH CHECK (profile_id = auth.uid());

COMMIT;
