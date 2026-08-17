-- =============================================================================
-- Migration: 002_enums.sql
-- Description:
--   Creates all PostgreSQL ENUM types used by the application.
-- =============================================================================

BEGIN;

-- -----------------------------------------------------------------------------
-- Marketplace Listing Intent
-- -----------------------------------------------------------------------------

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_type
        WHERE typname = 'listing_intent'
    ) THEN
        CREATE TYPE listing_intent AS ENUM (
            'BUY',
            'SELL',
            'REQUIREMENT'
        );
    END IF;
END $$;

COMMENT ON TYPE listing_intent IS
'Defines the intent of a marketplace listing.';

-- -----------------------------------------------------------------------------
-- Listing Status
-- -----------------------------------------------------------------------------

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_type
        WHERE typname = 'listing_status'
    ) THEN
        CREATE TYPE listing_status AS ENUM (
            'ACTIVE',
            'INACTIVE'
        );
    END IF;
END $$;

COMMENT ON TYPE listing_status IS
'Defines whether a listing is currently visible.';

-- -----------------------------------------------------------------------------
-- Item Condition
-- -----------------------------------------------------------------------------

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_type
        WHERE typname = 'condition_type'
    ) THEN
        CREATE TYPE condition_type AS ENUM (
            'NEW',
            'USED'
        );
    END IF;
END $$;

COMMENT ON TYPE condition_type IS
'Physical condition of an item in the marketplace.';

-- -----------------------------------------------------------------------------
-- Profile Status
-- -----------------------------------------------------------------------------

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_type
        WHERE typname = 'profile_status'
    ) THEN
        CREATE TYPE profile_status AS ENUM (
            'ACTIVE',
            'SUSPENDED'
        );
    END IF;
END $$;

COMMENT ON TYPE profile_status IS
'Administrative status of a user profile.';

COMMIT;