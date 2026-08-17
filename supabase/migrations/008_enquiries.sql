-- =============================================================================
-- Migration: 008_enquiries.sql
-- Description:
--   Creates enquiries table.
-- =============================================================================

BEGIN;

CREATE TABLE enquiries (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    from_profile_id UUID NOT NULL
        REFERENCES profiles(id)
        ON DELETE CASCADE,

    to_profile_id UUID NOT NULL
        REFERENCES profiles(id)
        ON DELETE CASCADE,

    marketplace_listing_id UUID
        REFERENCES marketplace_listings(id)
        ON DELETE CASCADE,

    service_requirement_id UUID
        REFERENCES service_requirements(id)
        ON DELETE CASCADE,

    jobwork_requirement_id UUID
        REFERENCES jobwork_requirements(id)
        ON DELETE CASCADE,

    job_post_id UUID
        REFERENCES job_posts(id)
        ON DELETE CASCADE,

    message TEXT NOT NULL,

    is_read BOOLEAN NOT NULL DEFAULT FALSE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_exactly_one_reference
    CHECK (
        (
            (marketplace_listing_id IS NOT NULL)::int +
            (service_requirement_id IS NOT NULL)::int +
            (jobwork_requirement_id IS NOT NULL)::int +
            (job_post_id IS NOT NULL)::int
        ) = 1
    )

);

COMMENT ON TABLE enquiries IS
'Stores enquiries across all platform modules.';

CREATE INDEX idx_enquiries_from_profile
ON enquiries(from_profile_id);

CREATE INDEX idx_enquiries_to_profile
ON enquiries(to_profile_id);

CREATE INDEX idx_enquiries_created_at
ON enquiries(created_at DESC);

ALTER TABLE enquiries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own enquiries"
ON enquiries
FOR SELECT
USING (
    from_profile_id = auth.uid()
    OR
    to_profile_id = auth.uid()
);

CREATE POLICY "Users can create enquiries"
ON enquiries
FOR INSERT
WITH CHECK (
    from_profile_id = auth.uid()
);

CREATE POLICY "Recipients can update enquiries"
ON enquiries
FOR UPDATE
USING (
    to_profile_id = auth.uid()
);

COMMIT;