-- =============================================================================
-- Migration: 021_admin_role.sql
-- Description:
--   Adds real DB support for the admin role so /admin (App.jsx's AdminRoute)
--   can be gated on actual data instead of the non-functional
--   `user?.role === 'admin'` stub (`user` is the raw Supabase auth session,
--   which never carries an app-level role). See issue #5 and #23.
--
--   - profiles gains an `is_admin` boolean flag.
--   - `is_admin()` is a SECURITY DEFINER helper (same convention as
--     `handle_new_user()` in 010/015: public schema, SET search_path) so
--     admin-check policies avoid recursive RLS evaluation on profiles.
--   - A BEFORE UPDATE trigger on profiles blocks any change to `is_admin`
--     that isn't made with the service_role key, so neither a regular user
--     (via their own-row update policy) nor an admin (via the new
--     admin-update-all policy added below) can grant admin through the app
--     or a raw REST call — per #23, the only way to grant admin is a
--     one-off statement run directly in the Supabase SQL editor (which runs
--     as the `postgres` role with no `request.jwt.claim.role` set, so
--     auth.role() is NULL and the guard condition is skipped).
--   - Every table the admin panel needs to moderate gets an admin
--     SELECT-all + UPDATE-all policy, additive to the existing owner-scoped
--     policies (multiple permissive policies combine with OR).
-- =============================================================================

BEGIN;

-- =============================================================================
-- profiles.is_admin
-- =============================================================================

ALTER TABLE profiles
ADD COLUMN is_admin BOOLEAN NOT NULL DEFAULT FALSE;

COMMENT ON COLUMN profiles.is_admin IS
'Grants access to the /admin moderation panel. Cannot be set via the app or the anon/authenticated roles — see trg_prevent_is_admin_escalation.';

-- =============================================================================
-- is_admin() helper
-- =============================================================================

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
    SELECT COALESCE(
        (SELECT p.is_admin FROM profiles p WHERE p.id = (SELECT auth.uid())),
        FALSE
    );
$$;

COMMENT ON FUNCTION public.is_admin() IS
'Whether the calling user is an admin. SECURITY DEFINER so it can read profiles without recursing through RLS policies that themselves call is_admin().';

REVOKE EXECUTE ON FUNCTION public.is_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

-- =============================================================================
-- Prevent client-triggered admin escalation
-- =============================================================================

CREATE OR REPLACE FUNCTION public.prevent_is_admin_escalation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF NEW.is_admin IS DISTINCT FROM OLD.is_admin
       AND auth.role() IS DISTINCT FROM 'service_role' THEN
        NEW.is_admin := OLD.is_admin;
    END IF;

    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_prevent_is_admin_escalation
BEFORE UPDATE ON profiles
FOR EACH ROW
EXECUTE FUNCTION public.prevent_is_admin_escalation();

-- =============================================================================
-- Admin moderation policies
-- =============================================================================

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------

CREATE POLICY "Admins can view all profiles"
ON profiles
FOR SELECT
USING ((SELECT is_admin()));

CREATE POLICY "Admins can update all profiles"
ON profiles
FOR UPDATE
USING ((SELECT is_admin()))
WITH CHECK ((SELECT is_admin()));

-- ---------------------------------------------------------------------------
-- marketplace_listings
-- ---------------------------------------------------------------------------

CREATE POLICY "Admins can view all marketplace listings"
ON marketplace_listings
FOR SELECT
USING ((SELECT is_admin()));

CREATE POLICY "Admins can update all marketplace listings"
ON marketplace_listings
FOR UPDATE
USING ((SELECT is_admin()))
WITH CHECK ((SELECT is_admin()));

-- ---------------------------------------------------------------------------
-- service_capabilities
-- ---------------------------------------------------------------------------

CREATE POLICY "Admins can view all service capabilities"
ON service_capabilities
FOR SELECT
USING ((SELECT is_admin()));

CREATE POLICY "Admins can update all service capabilities"
ON service_capabilities
FOR UPDATE
USING ((SELECT is_admin()))
WITH CHECK ((SELECT is_admin()));

-- ---------------------------------------------------------------------------
-- jobwork_capabilities
-- ---------------------------------------------------------------------------

CREATE POLICY "Admins can view all jobwork capabilities"
ON jobwork_capabilities
FOR SELECT
USING ((SELECT is_admin()));

CREATE POLICY "Admins can update all jobwork capabilities"
ON jobwork_capabilities
FOR UPDATE
USING ((SELECT is_admin()))
WITH CHECK ((SELECT is_admin()));

-- ---------------------------------------------------------------------------
-- job_seeker_profiles
-- ---------------------------------------------------------------------------

CREATE POLICY "Admins can view all job seeker profiles"
ON job_seeker_profiles
FOR SELECT
USING ((SELECT is_admin()));

CREATE POLICY "Admins can update all job seeker profiles"
ON job_seeker_profiles
FOR UPDATE
USING ((SELECT is_admin()))
WITH CHECK ((SELECT is_admin()));

-- ---------------------------------------------------------------------------
-- service_requirements
-- ---------------------------------------------------------------------------

CREATE POLICY "Admins can view all service requirements"
ON service_requirements
FOR SELECT
USING ((SELECT is_admin()));

CREATE POLICY "Admins can update all service requirements"
ON service_requirements
FOR UPDATE
USING ((SELECT is_admin()))
WITH CHECK ((SELECT is_admin()));

-- ---------------------------------------------------------------------------
-- jobwork_requirements
-- ---------------------------------------------------------------------------

CREATE POLICY "Admins can view all jobwork requirements"
ON jobwork_requirements
FOR SELECT
USING ((SELECT is_admin()));

CREATE POLICY "Admins can update all jobwork requirements"
ON jobwork_requirements
FOR UPDATE
USING ((SELECT is_admin()))
WITH CHECK ((SELECT is_admin()));

-- ---------------------------------------------------------------------------
-- job_posts
-- ---------------------------------------------------------------------------

CREATE POLICY "Admins can view all job posts"
ON job_posts
FOR SELECT
USING ((SELECT is_admin()));

CREATE POLICY "Admins can update all job posts"
ON job_posts
FOR UPDATE
USING ((SELECT is_admin()))
WITH CHECK ((SELECT is_admin()));

COMMIT;
