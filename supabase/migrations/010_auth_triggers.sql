-- =============================================================================
-- Migration: 010_auth_triggers.sql
-- Description:
--   Automatically creates a profile when a new auth user signs up.
-- =============================================================================

BEGIN;

-- =============================================================================
-- Function
-- =============================================================================

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

-- =============================================================================
-- Trigger
-- =============================================================================

CREATE TRIGGER on_auth_user_created
AFTER INSERT
ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();

COMMIT;