-- =============================================================================
-- Migration: 012_enquiries_capability_references.sql
-- Description:
--   enquiries could previously only reference a requirement/listing/job post,
--   not a capability profile directly — so a seeker browsing a service/job-work
--   provider's profile had no way to message them without first posting a
--   requirement. Adds two nullable reference columns for direct-contact
--   enquiries against a service/jobwork capability profile, and widens
--   chk_exactly_one_reference accordingly.
--
--   These reference the capability table's own profile_id PK (not profiles.id)
--   so a hard-deleted capability profile cascades its enquiries the same way
--   the four existing reference columns already do for their subject rows.
-- =============================================================================

BEGIN;

ALTER TABLE enquiries
    ADD COLUMN service_capability_profile_id UUID
        REFERENCES service_capabilities(profile_id)
        ON DELETE CASCADE;

ALTER TABLE enquiries
    ADD COLUMN jobwork_capability_profile_id UUID
        REFERENCES jobwork_capabilities(profile_id)
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
            (jobwork_capability_profile_id IS NOT NULL)::int
        ) = 1
    );

CREATE INDEX idx_enquiries_service_capability_profile
ON enquiries(service_capability_profile_id);

CREATE INDEX idx_enquiries_jobwork_capability_profile
ON enquiries(jobwork_capability_profile_id);

COMMIT;
