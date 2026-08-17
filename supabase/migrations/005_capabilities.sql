-- =============================================================================
-- Migration: 005_capabilities.sql
-- Description:
--   Creates capability profile tables and category mapping tables.
-- =============================================================================

BEGIN;

-- =============================================================================
-- Service Capabilities
-- =============================================================================

CREATE TABLE service_capabilities (

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

COMMENT ON TABLE service_capabilities IS
'Business profile for users offering repair and service.';

CREATE INDEX idx_service_capabilities_active
ON service_capabilities(is_active);

CREATE INDEX idx_service_capabilities_city
ON service_capabilities(city);

CREATE INDEX idx_service_capabilities_state
ON service_capabilities(state);

CREATE TRIGGER trg_service_capabilities_updated_at
BEFORE UPDATE
ON service_capabilities
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE service_capabilities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active service capabilities"
ON service_capabilities
FOR SELECT
USING (is_active = TRUE);

CREATE POLICY "Users manage own service capability"
ON service_capabilities
FOR ALL
USING (profile_id = auth.uid())
WITH CHECK (profile_id = auth.uid());

-- =============================================================================
-- Job Work Capabilities
-- =============================================================================

CREATE TABLE jobwork_capabilities (

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

COMMENT ON TABLE jobwork_capabilities IS
'Business profile for users offering manufacturing/job work.';

CREATE INDEX idx_jobwork_capabilities_active
ON jobwork_capabilities(is_active);

CREATE INDEX idx_jobwork_capabilities_city
ON jobwork_capabilities(city);

CREATE INDEX idx_jobwork_capabilities_state
ON jobwork_capabilities(state);

CREATE TRIGGER trg_jobwork_capabilities_updated_at
BEFORE UPDATE
ON jobwork_capabilities
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE jobwork_capabilities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active jobwork capabilities"
ON jobwork_capabilities
FOR SELECT
USING (is_active = TRUE);

CREATE POLICY "Users manage own jobwork capability"
ON jobwork_capabilities
FOR ALL
USING (profile_id = auth.uid())
WITH CHECK (profile_id = auth.uid());

-- =============================================================================
-- Job Seeker Profiles
-- =============================================================================

CREATE TABLE job_seeker_profiles (

    profile_id UUID PRIMARY KEY
        REFERENCES profiles(id)
        ON DELETE CASCADE,

    headline TEXT,

    about TEXT,

    experience_years INTEGER NOT NULL DEFAULT 0,

    resume_url TEXT,

    city TEXT,

    state TEXT,

    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_job_seeker_experience
        CHECK (experience_years >= 0)

);

COMMENT ON TABLE job_seeker_profiles IS
'Professional profile for users seeking employment.';

CREATE INDEX idx_job_seeker_profiles_active
ON job_seeker_profiles(is_active);

CREATE INDEX idx_job_seeker_profiles_city
ON job_seeker_profiles(city);

CREATE INDEX idx_job_seeker_profiles_state
ON job_seeker_profiles(state);

CREATE TRIGGER trg_job_seeker_profiles_updated_at
BEFORE UPDATE
ON job_seeker_profiles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE job_seeker_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active job seeker profiles"
ON job_seeker_profiles
FOR SELECT
USING (is_active = TRUE);

CREATE POLICY "Users manage own job seeker profile"
ON job_seeker_profiles
FOR ALL
USING (profile_id = auth.uid())
WITH CHECK (profile_id = auth.uid());

-- =============================================================================
-- Service Capability Categories
-- =============================================================================

CREATE TABLE service_capability_categories (

    profile_id UUID NOT NULL
        REFERENCES service_capabilities(profile_id)
        ON DELETE CASCADE,

    machine_category_id UUID NOT NULL
        REFERENCES machine_categories(id)
        ON DELETE RESTRICT,

    PRIMARY KEY (
        profile_id,
        machine_category_id
    )

);

-- =============================================================================
-- Job Work Capability Categories
-- =============================================================================

CREATE TABLE jobwork_capability_categories (

    profile_id UUID NOT NULL
        REFERENCES jobwork_capabilities(profile_id)
        ON DELETE CASCADE,

    machine_category_id UUID NOT NULL
        REFERENCES machine_categories(id)
        ON DELETE RESTRICT,

    PRIMARY KEY (
        profile_id,
        machine_category_id
    )

);

-- =============================================================================
-- Job Seeker Categories
-- =============================================================================

CREATE TABLE job_seeker_categories (

    profile_id UUID NOT NULL
        REFERENCES job_seeker_profiles(profile_id)
        ON DELETE CASCADE,

    machine_category_id UUID NOT NULL
        REFERENCES machine_categories(id)
        ON DELETE RESTRICT,

    PRIMARY KEY (
        profile_id,
        machine_category_id
    )

);

ALTER TABLE service_capability_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobwork_capability_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_seeker_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view service capability categories"
ON service_capability_categories
FOR SELECT
USING (TRUE);

CREATE POLICY "Anyone can view jobwork capability categories"
ON jobwork_capability_categories
FOR SELECT
USING (TRUE);

CREATE POLICY "Anyone can view job seeker categories"
ON job_seeker_categories
FOR SELECT
USING (TRUE);

COMMIT;