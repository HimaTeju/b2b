-- =============================================================================
-- Migration: 025_packers_movers.sql
-- Description:
--   Packers & Movers (issue #29) — under the hood a Services-shaped feature
--   (capability profile + requirement + direct enquiry), but with its own
--   tables rather than overloading service_capabilities/service_requirements:
--
--   - service_requirements.machine_category_id is NOT NULL, but one of the
--     two Packers & Movers request types (Shop Lifting) has no machine at
--     all — packers_movers_requirements makes the category nullable and
--     conditional on request_type instead.
--   - A move needs a from-location and a to-location, which no existing
--     requirement-shaped table has (they all have a single city/state).
--
--   Capability profiles still tag machine_categories via a join table
--   (packers_movers_capability_categories), same as service/jobwork
--   capabilities — a mover's category tags describe what kinds of machinery
--   they're equipped to lift, used for the same category-filtered browse
--   UX as Services/Job Work.
-- =============================================================================

BEGIN;

-- -----------------------------------------------------------------------------
-- Request type
-- -----------------------------------------------------------------------------

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_type
        WHERE typname = 'packers_movers_request_type'
    ) THEN
        CREATE TYPE packers_movers_request_type AS ENUM (
            'MACHINE_LIFTING',
            'SHOP_LIFTING'
        );
    END IF;
END $$;

COMMENT ON TYPE packers_movers_request_type IS
'Which of the two Packers & Movers request shapes a requirement is: moving a specific machine (linked to machine_categories) or moving an entire shop (no machine category).';

-- -----------------------------------------------------------------------------
-- Packers & Movers Capabilities
-- -----------------------------------------------------------------------------

CREATE TABLE packers_movers_capabilities (

    profile_id UUID PRIMARY KEY
        REFERENCES profiles(id)
        ON DELETE CASCADE,

    title TEXT NOT NULL,

    description TEXT,

    city TEXT,

    state TEXT,

    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()

);

COMMENT ON TABLE packers_movers_capabilities IS
'Business profile for users offering machine/shop lifting and moving services.';

CREATE INDEX idx_packers_movers_capabilities_active
ON packers_movers_capabilities(is_active);

CREATE INDEX idx_packers_movers_capabilities_city
ON packers_movers_capabilities(city);

CREATE INDEX idx_packers_movers_capabilities_state
ON packers_movers_capabilities(state);

CREATE TRIGGER trg_packers_movers_capabilities_updated_at
BEFORE UPDATE
ON packers_movers_capabilities
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE packers_movers_capabilities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active packers movers capabilities"
ON packers_movers_capabilities
FOR SELECT
USING (
    is_active = TRUE
    AND auth.role() = 'authenticated'
);

CREATE POLICY "Users manage own packers movers capability"
ON packers_movers_capabilities
FOR ALL
USING (profile_id = auth.uid())
WITH CHECK (profile_id = auth.uid());

-- -----------------------------------------------------------------------------
-- Packers & Movers Capability Categories
-- -----------------------------------------------------------------------------

CREATE TABLE packers_movers_capability_categories (

    profile_id UUID NOT NULL
        REFERENCES packers_movers_capabilities(profile_id)
        ON DELETE CASCADE,

    machine_category_id UUID NOT NULL
        REFERENCES machine_categories(id)
        ON DELETE RESTRICT,

    PRIMARY KEY (
        profile_id,
        machine_category_id
    )

);

ALTER TABLE packers_movers_capability_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view packers movers capability categories"
ON packers_movers_capability_categories
FOR SELECT
USING (auth.role() = 'authenticated');

CREATE POLICY "Users manage own packers movers capability categories"
ON packers_movers_capability_categories
FOR ALL
USING (profile_id = auth.uid())
WITH CHECK (profile_id = auth.uid());

-- -----------------------------------------------------------------------------
-- Packers & Movers Requirements
-- -----------------------------------------------------------------------------

CREATE TABLE packers_movers_requirements (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    profile_id UUID NOT NULL
        REFERENCES profiles(id)
        ON DELETE CASCADE,

    request_type packers_movers_request_type NOT NULL,

    machine_category_id UUID
        REFERENCES machine_categories(id)
        ON DELETE SET NULL,

    title TEXT NOT NULL,

    description TEXT,

    pickup_city TEXT,

    pickup_state TEXT,

    drop_city TEXT,

    drop_state TEXT,

    status listing_status NOT NULL DEFAULT 'ACTIVE',

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_packers_movers_machine_lifting_requires_category
        CHECK (request_type <> 'MACHINE_LIFTING' OR machine_category_id IS NOT NULL),

    CONSTRAINT chk_packers_movers_shop_lifting_has_no_category
        CHECK (request_type <> 'SHOP_LIFTING' OR machine_category_id IS NULL)

);

COMMENT ON TABLE packers_movers_requirements IS
'Requirements posted by users needing a machine or shop lifted/moved. pickup_*/drop_* are separate from-location/to-location fields, unlike the single city/state pair on other requirement tables.';

CREATE INDEX idx_packers_movers_requirements_profile
ON packers_movers_requirements(profile_id);

CREATE INDEX idx_packers_movers_requirements_category
ON packers_movers_requirements(machine_category_id);

CREATE INDEX idx_packers_movers_requirements_status
ON packers_movers_requirements(status);

CREATE INDEX idx_packers_movers_requirements_request_type
ON packers_movers_requirements(request_type);

CREATE TRIGGER trg_packers_movers_requirements_updated_at
BEFORE UPDATE
ON packers_movers_requirements
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE packers_movers_requirements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active packers movers requirements"
ON packers_movers_requirements
FOR SELECT
USING (
    status = 'ACTIVE'
    AND auth.role() = 'authenticated'
);

CREATE POLICY "Users manage own packers movers requirements"
ON packers_movers_requirements
FOR ALL
USING (profile_id = auth.uid())
WITH CHECK (profile_id = auth.uid());

COMMIT;
