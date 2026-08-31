-- =============================================================================
-- Migration: 026_enquiries_packers_movers_references.sql
-- Description:
--   Adds the two Packers & Movers enquiry reference columns, mirroring
--   012_enquiries_capability_references.sql / 013_enquiries_job_seeker_reference.sql:
--   one for contacting a posted requirement directly, one for direct-contact
--   with a vendor's capability profile without going through a requirement.
--   Widens chk_exactly_one_reference from 7 to 9 mutually-exclusive columns.
-- =============================================================================

BEGIN;

ALTER TABLE enquiries
    ADD COLUMN packers_movers_requirement_id UUID
        REFERENCES packers_movers_requirements(id)
        ON DELETE CASCADE;

ALTER TABLE enquiries
    ADD COLUMN packers_movers_capability_profile_id UUID
        REFERENCES packers_movers_capabilities(profile_id)
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
            (job_seeker_profile_id IS NOT NULL)::int +
            (packers_movers_requirement_id IS NOT NULL)::int +
            (packers_movers_capability_profile_id IS NOT NULL)::int
        ) = 1
    );

CREATE INDEX idx_enquiries_packers_movers_requirement
ON enquiries(packers_movers_requirement_id);

CREATE INDEX idx_enquiries_packers_movers_capability_profile
ON enquiries(packers_movers_capability_profile_id);

COMMIT;
