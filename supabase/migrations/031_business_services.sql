-- =============================================================================
-- Migration: 031_business_services.sql
-- Description:
--   Business Services — import-export advice/services and audit & tax
--   services (more professions can be added later). Services-shaped, like
--   Packers & Movers (025/026): a capability profile ("I offer this"), a
--   requirement ("I need this") and direct-contact enquiry references, with
--   their own tables rather than overloading service_capabilities /
--   service_requirements, which are built around machine_categories (a
--   machine repair taxonomy that doesn't apply to these services).
--
--   What a provider offers is a fixed list of service types instead of
--   machine categories. Values are free text validated against the static
--   BUSINESS_SERVICE_TYPES list in src/lib/constants.js so the list can grow
--   without a migration — same pattern as job_posts.job_category and the
--   marketplace Property type. A capability can list several types
--   (service_types TEXT[], at least one); a requirement needs exactly one.
--
--   No verification fields: providers describe themselves in free text only.
-- =============================================================================

BEGIN;

-- -----------------------------------------------------------------------------
-- Business Service Capabilities
-- -----------------------------------------------------------------------------

CREATE TABLE business_service_capabilities (

    profile_id UUID PRIMARY KEY
        REFERENCES profiles(id)
        ON DELETE CASCADE,

    title TEXT NOT NULL,

    description TEXT,

    service_types TEXT[] NOT NULL
        CHECK (cardinality(service_types) >= 1),

    city TEXT,

    state TEXT,

    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()

);

COMMENT ON TABLE business_service_capabilities IS
'Business profile for users offering business services (import-export, audit & tax, ...). service_types is validated against BUSINESS_SERVICE_TYPES in the frontend.';

CREATE INDEX idx_business_service_capabilities_active
ON business_service_capabilities(is_active);

CREATE INDEX idx_business_service_capabilities_city
ON business_service_capabilities(city);

CREATE INDEX idx_business_service_capabilities_state
ON business_service_capabilities(state);

CREATE INDEX idx_business_service_capabilities_service_types
ON business_service_capabilities USING GIN (service_types);

CREATE TRIGGER trg_business_service_capabilities_updated_at
BEFORE UPDATE
ON business_service_capabilities
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE business_service_capabilities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active business service capabilities"
ON business_service_capabilities
FOR SELECT
USING (
    is_active = TRUE
    AND auth.role() = 'authenticated'
);

CREATE POLICY "Users manage own business service capability"
ON business_service_capabilities
FOR ALL
USING (profile_id = auth.uid())
WITH CHECK (profile_id = auth.uid());

-- -----------------------------------------------------------------------------
-- Business Service Requirements
-- -----------------------------------------------------------------------------

CREATE TABLE business_service_requirements (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    profile_id UUID NOT NULL
        REFERENCES profiles(id)
        ON DELETE CASCADE,

    service_type TEXT NOT NULL,

    title TEXT NOT NULL,

    description TEXT,

    city TEXT,

    state TEXT,

    status listing_status NOT NULL DEFAULT 'ACTIVE',

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()

);

COMMENT ON TABLE business_service_requirements IS
'Requirements posted by users needing a business service (import-export advice, an auditor, ...). service_type is validated against BUSINESS_SERVICE_TYPES in the frontend.';

CREATE INDEX idx_business_service_requirements_profile
ON business_service_requirements(profile_id);

CREATE INDEX idx_business_service_requirements_service_type
ON business_service_requirements(service_type);

CREATE INDEX idx_business_service_requirements_status
ON business_service_requirements(status);

CREATE INDEX idx_business_service_requirements_city
ON business_service_requirements(city);

CREATE TRIGGER trg_business_service_requirements_updated_at
BEFORE UPDATE
ON business_service_requirements
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE business_service_requirements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active business service requirements"
ON business_service_requirements
FOR SELECT
USING (
    status = 'ACTIVE'
    AND auth.role() = 'authenticated'
);

CREATE POLICY "Users manage own business service requirements"
ON business_service_requirements
FOR ALL
USING (profile_id = auth.uid())
WITH CHECK (profile_id = auth.uid());

-- -----------------------------------------------------------------------------
-- Enquiry references (mirrors 026_enquiries_packers_movers_references.sql)
-- Widens chk_exactly_one_reference from 9 to 11 mutually-exclusive columns.
-- -----------------------------------------------------------------------------

ALTER TABLE enquiries
    ADD COLUMN business_service_requirement_id UUID
        REFERENCES business_service_requirements(id)
        ON DELETE CASCADE;

ALTER TABLE enquiries
    ADD COLUMN business_service_capability_profile_id UUID
        REFERENCES business_service_capabilities(profile_id)
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
            (business_service_capability_profile_id IS NOT NULL)::int
        ) = 1
    );

CREATE INDEX idx_enquiries_business_service_requirement
ON enquiries(business_service_requirement_id);

CREATE INDEX idx_enquiries_business_service_capability_profile
ON enquiries(business_service_capability_profile_id);

COMMIT;
