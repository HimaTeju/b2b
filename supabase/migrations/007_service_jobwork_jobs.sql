-- =============================================================================
-- Migration: 007_service_jobwork_jobs.sql
-- Description:
--   Creates service requirements, job work requirements and job posts.
-- =============================================================================

BEGIN;

-- =============================================================================
-- Service Requirements
-- =============================================================================

CREATE TABLE service_requirements (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    profile_id UUID NOT NULL
        REFERENCES profiles(id)
        ON DELETE CASCADE,

    machine_category_id UUID NOT NULL
        REFERENCES machine_categories(id)
        ON DELETE RESTRICT,

    title TEXT NOT NULL,

    description TEXT,

    city TEXT,

    state TEXT,

    status listing_status NOT NULL DEFAULT 'ACTIVE',

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()

);

COMMENT ON TABLE service_requirements IS
'Requirements posted by users looking for repair or service.';

CREATE INDEX idx_service_requirements_profile
ON service_requirements(profile_id);

CREATE INDEX idx_service_requirements_category
ON service_requirements(machine_category_id);

CREATE INDEX idx_service_requirements_status
ON service_requirements(status);

CREATE INDEX idx_service_requirements_city
ON service_requirements(city);

CREATE INDEX idx_service_requirements_state
ON service_requirements(state);

CREATE TRIGGER trg_service_requirements_updated_at
BEFORE UPDATE
ON service_requirements
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE service_requirements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active service requirements"
ON service_requirements
FOR SELECT
USING (status = 'ACTIVE');

CREATE POLICY "Users manage own service requirements"
ON service_requirements
FOR ALL
USING (profile_id = auth.uid())
WITH CHECK (profile_id = auth.uid());

-- =============================================================================
-- Job Work Requirements
-- =============================================================================

CREATE TABLE jobwork_requirements (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    profile_id UUID NOT NULL
        REFERENCES profiles(id)
        ON DELETE CASCADE,

    machine_category_id UUID NOT NULL
        REFERENCES machine_categories(id)
        ON DELETE RESTRICT,

    title TEXT NOT NULL,

    description TEXT,

    city TEXT,

    state TEXT,

    status listing_status NOT NULL DEFAULT 'ACTIVE',

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()

);

COMMENT ON TABLE jobwork_requirements IS
'Requirements posted by users looking for job work vendors.';

CREATE INDEX idx_jobwork_requirements_profile
ON jobwork_requirements(profile_id);

CREATE INDEX idx_jobwork_requirements_category
ON jobwork_requirements(machine_category_id);

CREATE INDEX idx_jobwork_requirements_status
ON jobwork_requirements(status);

CREATE INDEX idx_jobwork_requirements_city
ON jobwork_requirements(city);

CREATE INDEX idx_jobwork_requirements_state
ON jobwork_requirements(state);

CREATE TRIGGER trg_jobwork_requirements_updated_at
BEFORE UPDATE
ON jobwork_requirements
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE jobwork_requirements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active jobwork requirements"
ON jobwork_requirements
FOR SELECT
USING (status = 'ACTIVE');

CREATE POLICY "Users manage own jobwork requirements"
ON jobwork_requirements
FOR ALL
USING (profile_id = auth.uid())
WITH CHECK (profile_id = auth.uid());

-- =============================================================================
-- Job Posts
-- =============================================================================

CREATE TABLE job_posts (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    profile_id UUID NOT NULL
        REFERENCES profiles(id)
        ON DELETE CASCADE,

    machine_category_id UUID
        REFERENCES machine_categories(id)
        ON DELETE SET NULL,

    title TEXT NOT NULL,

    description TEXT,

    city TEXT,

    state TEXT,

    status listing_status NOT NULL DEFAULT 'ACTIVE',

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()

);

COMMENT ON TABLE job_posts IS
'Job vacancies posted by employers.';

CREATE INDEX idx_job_posts_profile
ON job_posts(profile_id);

CREATE INDEX idx_job_posts_category
ON job_posts(machine_category_id);

CREATE INDEX idx_job_posts_status
ON job_posts(status);

CREATE INDEX idx_job_posts_city
ON job_posts(city);

CREATE INDEX idx_job_posts_state
ON job_posts(state);

CREATE TRIGGER trg_job_posts_updated_at
BEFORE UPDATE
ON job_posts
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE job_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active job posts"
ON job_posts
FOR SELECT
USING (status = 'ACTIVE');

CREATE POLICY "Users manage own job posts"
ON job_posts
FOR ALL
USING (profile_id = auth.uid())
WITH CHECK (profile_id = auth.uid());

COMMIT;