-- =============================================================================
-- Migration: 014_profile_onboarding.sql
-- Description:
--   Adds a skippable, one-time "what are you here for" onboarding signal to
--   profiles. `interests` is a soft declaration of which domains a user
--   cares about — distinct from service_capabilities/jobwork_capabilities/
--   job_seeker_profiles, which mean "I have a real, filled-out capability
--   profile." Onboarding never creates rows in those tables; it only records
--   a lightweight preference used to personalize Home's domain ordering.
--
--   `onboarded_at` tracks whether the one-time wizard has been shown,
--   independent of whether the user picked anything — skipping still sets
--   it (to a non-null timestamp) so the wizard never reappears. NULL means
--   "not yet shown," which is also the correct default for every existing
--   profile prior to this migration.
-- =============================================================================

BEGIN;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_type
        WHERE typname = 'interest_domain'
    ) THEN
        CREATE TYPE interest_domain AS ENUM (
            'marketplace',
            'services',
            'jobs',
            'jobwork'
        );
    END IF;
END $$;

COMMENT ON TYPE interest_domain IS
'Domain keys a user can declare interest in during onboarding — mirrors src/lib/domains.jsx.';

ALTER TABLE profiles
    ADD COLUMN interests interest_domain[] NOT NULL DEFAULT '{}';

ALTER TABLE profiles
    ADD COLUMN onboarded_at TIMESTAMPTZ;

COMMENT ON COLUMN profiles.interests IS
'Domains the user declared interest in during the onboarding wizard. Empty array is valid (skipped, or picked nothing) and does not imply anything about actual capability rows.';

COMMENT ON COLUMN profiles.onboarded_at IS
'When the onboarding wizard was completed or skipped. NULL means it has not been shown yet.';

COMMIT;
