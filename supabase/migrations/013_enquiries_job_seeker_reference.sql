-- =============================================================================
-- Migration: 013_enquiries_job_seeker_reference.sql
-- Description:
--   enquiries could reference a job_post (an employer's vacancy) but not a
--   job_seeker_profiles row directly, so an employer browsing a job seeker's
--   profile had no way to contact them without the seeker first applying to
--   a job post. Adds a nullable job_seeker_profile_id reference column for
--   direct-contact enquiries against a job seeker profile, mirroring
--   012_enquiries_capability_references.sql's pattern for service/jobwork
--   capability profiles, and widens chk_exactly_one_reference accordingly.
--
--   References job_seeker_profiles' own profile_id PK (not profiles.id) so a
--   hard-deleted job seeker profile cascades its enquiries the same way the
--   other reference columns already do for their subject rows.
-- =============================================================================

BEGIN;

ALTER TABLE enquiries
    ADD COLUMN job_seeker_profile_id UUID
        REFERENCES job_seeker_profiles(profile_id)
        ON DELETE CASCADE;

ALTER TABLE enquiries
    DROP CONSTRAINT chk_exactly_one_reference;

ALTER TABLE enquiries
    ADD CONSTRAINT chk_exactly_one_reference
    CHECK (
        (
            (marketplace_listing_id IS NOT NULL)::int +
            (service_requirement_id IS NOT NULL)::int +
            (jobwork_requirement_id IS NOT NULL)::int +
            (job_post_id IS NOT NULL)::int +
            (service_capability_profile_id IS NOT NULL)::int +
            (jobwork_capability_profile_id IS NOT NULL)::int +
            (job_seeker_profile_id IS NOT NULL)::int
        ) = 1
    );

CREATE INDEX idx_enquiries_job_seeker_profile
ON enquiries(job_seeker_profile_id);

COMMIT;
