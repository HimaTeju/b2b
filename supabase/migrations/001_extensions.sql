-- =============================================================================
-- Migration: 001_extensions.sql
-- Description:
--   - Enable required PostgreSQL extensions
--   - Create reusable trigger functions
-- =============================================================================

BEGIN;

-- -----------------------------------------------------------------------------
-- Extensions
-- -----------------------------------------------------------------------------

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- -----------------------------------------------------------------------------
-- Trigger Function: update_updated_at_column
--
-- Automatically updates the updated_at timestamp whenever a row is modified.
-- -----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.update_updated_at_column IS
'Automatically updates the updated_at column before UPDATE operations.';

COMMIT;