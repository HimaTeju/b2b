-- =============================================================================
-- Migration: 022_fix_admin_escalation_guard.sql
-- Description:
--   021_admin_role.sql's trg_prevent_is_admin_escalation used
--   `auth.role() IS DISTINCT FROM 'service_role'` to decide whether to
--   revert a client-attempted change to profiles.is_admin. IS DISTINCT FROM
--   is NULL-safe, so when auth.role() is NULL — which is exactly the case
--   for a direct Postgres connection with no PostgREST JWT context (the
--   Supabase SQL editor, `supabase db query --linked`, etc.) — the
--   condition evaluated TRUE and the guard reverted the change anyway. That
--   defeated the migration's own stated bootstrap path ("a one-off SQL
--   statement run directly against the target profiles row"), discovered
--   when granting admin to the first two accounts returned is_admin: false
--   despite the UPDATE.
--
--   Fix: only revert when auth.role() is actually a non-service-role
--   PostgREST session (i.e. IS NOT NULL and <> 'service_role'). A NULL
--   auth.role() (direct/superuser connection) and 'service_role' both pass
--   through untouched, matching the original intent.
-- =============================================================================

BEGIN;

CREATE OR REPLACE FUNCTION public.prevent_is_admin_escalation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF NEW.is_admin IS DISTINCT FROM OLD.is_admin
       AND auth.role() IS NOT NULL
       AND auth.role() <> 'service_role' THEN
        NEW.is_admin := OLD.is_admin;
    END IF;

    RETURN NEW;
END;
$$;

COMMIT;
