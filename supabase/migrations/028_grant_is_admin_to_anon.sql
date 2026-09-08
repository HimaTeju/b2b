-- =============================================================================
-- Migration: 028_grant_is_admin_to_anon.sql
-- Description:
--   021_admin_role.sql revoked EXECUTE on is_admin() from PUBLIC and anon,
--   intending to keep the admin check out of reach of unauthenticated
--   clients. But several tables (profiles, marketplace_listings,
--   service_capabilities, jobwork_capabilities, job_seeker_profiles,
--   service_requirements, jobwork_requirements, job_posts) carry both an
--   authenticated-only "Anyone can view active X" policy and an
--   is_admin()-gated "Admins can view all X" policy. Postgres evaluates
--   every permissive RLS policy on a query (combined with OR), so the anon
--   role's total lack of EXECUTE on is_admin() turned that combination into
--   a hard `permission denied for function is_admin` (42501) error for any
--   anon SELECT on these tables, instead of the intended silent empty
--   result — discovered by the RLS integration suite added in #33.
--
--   is_admin() only reads auth.uid() (NULL for anon, via SECURITY DEFINER),
--   so it always returns FALSE for the anon role regardless of whether it
--   can execute the function — granting EXECUTE doesn't change who can
--   actually become admin (still gated by trg_prevent_is_admin_escalation
--   on the is_admin column itself, service_role-only). This only lets the
--   anon role finish evaluating the OR'd policy set and correctly get back
--   an empty result, matching 020_require_auth_for_public_reads.sql's
--   intent for unauthenticated requests.
-- =============================================================================

BEGIN;

GRANT EXECUTE ON FUNCTION public.is_admin() TO anon;

COMMIT;
