-- =============================================================================
-- Migration: 032_investors.sql
-- Description:
--   Investors — project owners post "seeking funding" requirements and
--   investors set up an optional profile of the sectors they invest in.
--   Services-shaped, like Business Services (031) and Packers & Movers
--   (025/026): a capability profile, a requirement and direct-contact enquiry
--   references, with their own tables.
--
--   Sectors and project stages are free text validated against the static
--   INVESTMENT_SECTORS / PROJECT_STAGES lists in src/lib/constants.js so the
--   lists can grow without a migration (same pattern as 031's service types).
--   An investor can list several sectors (sectors TEXT[], at least one); a
--   funding requirement has one sector and one stage.
--
--   No verification fields: this only connects people, it doesn't vet
--   projects or investors, and the UI says so.
-- =============================================================================

BEGIN;

-- -----------------------------------------------------------------------------
-- Investor Capabilities
-- -----------------------------------------------------------------------------

CREATE TABLE investor_capabilities (

    profile_id UUID PRIMARY KEY
        REFERENCES profiles(id)
        ON DELETE CASCADE,

    title TEXT NOT NULL,

    description TEXT,

    sectors TEXT[] NOT NULL
        CHECK (cardinality(sectors) >= 1),

    city TEXT,

    state TEXT,

    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()

);

COMMENT ON TABLE investor_capabilities IS
'Profile for users who invest in new projects. sectors is validated against INVESTMENT_SECTORS in the frontend.';

CREATE INDEX idx_investor_capabilities_active
ON investor_capabilities(is_active);

CREATE INDEX idx_investor_capabilities_city
ON investor_capabilities(city);

CREATE INDEX idx_investor_capabilities_state
ON investor_capabilities(state);

CREATE INDEX idx_investor_capabilities_sectors
ON investor_capabilities USING GIN (sectors);

CREATE TRIGGER trg_investor_capabilities_updated_at
BEFORE UPDATE
ON investor_capabilities
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE investor_capabilities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active investor capabilities"
ON investor_capabilities
FOR SELECT
USING (
    is_active = TRUE
    AND auth.role() = 'authenticated'
);

CREATE POLICY "Users manage own investor capability"
ON investor_capabilities
FOR ALL
USING (profile_id = auth.uid())
WITH CHECK (profile_id = auth.uid());

-- -----------------------------------------------------------------------------
-- Funding Requirements
-- -----------------------------------------------------------------------------

CREATE TABLE funding_requirements (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    profile_id UUID NOT NULL
        REFERENCES profiles(id)
        ON DELETE CASCADE,

    sector TEXT NOT NULL,

    stage TEXT NOT NULL,

    amount_sought NUMERIC(14,2)
        CHECK (amount_sought IS NULL OR amount_sought >= 0),

    title TEXT NOT NULL,

    description TEXT,

    city TEXT,

    state TEXT,

    status listing_status NOT NULL DEFAULT 'ACTIVE',

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()

);

COMMENT ON TABLE funding_requirements IS
'Projects seeking funding. sector and stage are validated against INVESTMENT_SECTORS / PROJECT_STAGES in the frontend; amount_sought is optional (NULL = open to discuss), in INR.';

CREATE INDEX idx_funding_requirements_profile
ON funding_requirements(profile_id);

CREATE INDEX idx_funding_requirements_sector
ON funding_requirements(sector);

CREATE INDEX idx_funding_requirements_stage
ON funding_requirements(stage);

CREATE INDEX idx_funding_requirements_status
ON funding_requirements(status);

CREATE TRIGGER trg_funding_requirements_updated_at
BEFORE UPDATE
ON funding_requirements
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE funding_requirements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active funding requirements"
ON funding_requirements
FOR SELECT
USING (
    status = 'ACTIVE'
    AND auth.role() = 'authenticated'
);

CREATE POLICY "Users manage own funding requirements"
ON funding_requirements
FOR ALL
USING (profile_id = auth.uid())
WITH CHECK (profile_id = auth.uid());

-- -----------------------------------------------------------------------------
-- Enquiry references (mirrors 031_business_services.sql)
-- Widens chk_exactly_one_reference from 11 to 13 mutually-exclusive columns.
-- -----------------------------------------------------------------------------

ALTER TABLE enquiries
    ADD COLUMN funding_requirement_id UUID
        REFERENCES funding_requirements(id)
        ON DELETE CASCADE;

ALTER TABLE enquiries
    ADD COLUMN investor_capability_profile_id UUID
        REFERENCES investor_capabilities(profile_id)
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
            (packers_movers_capability_profile_id IS NOT NULL)::int +
            (business_service_requirement_id IS NOT NULL)::int +
            (business_service_capability_profile_id IS NOT NULL)::int +
            (funding_requirement_id IS NOT NULL)::int +
            (investor_capability_profile_id IS NOT NULL)::int
        ) = 1
    );

CREATE INDEX idx_enquiries_funding_requirement
ON enquiries(funding_requirement_id);

CREATE INDEX idx_enquiries_investor_capability_profile
ON enquiries(investor_capability_profile_id);

COMMIT;
