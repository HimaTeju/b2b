-- =============================================================================
-- Migration: 015_fix_handle_new_user_full_name.sql
-- Description:
--   The live handle_new_user() trigger function had drifted from
--   010_auth_triggers.sql: it was inserting a `full_name` column into
--   profiles that has never existed in any migration, breaking every signup
--   (INSERT on auth.users fails because the AFTER INSERT trigger errors with
--   "column full_name of relation profiles does not exist", rolling back the
--   whole signup). No frontend code reads profiles.full_name — display name
--   is read from auth user_metadata directly (see src/pages/Profile.jsx,
--   src/components/TopBar.jsx) — so this restores the function to match
--   010_auth_triggers.sql rather than adding the column.
-- =============================================================================

BEGIN;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN

    INSERT INTO public.profiles (
        id
    )
    VALUES (
        NEW.id
    );

    RETURN NEW;

END;
$$;

COMMIT;
