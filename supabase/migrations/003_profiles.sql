-- =============================================================================
-- Migration: 003_profiles.sql
-- Description:
--   Creates the profiles table.
--   One profile exists for every authenticated user.
-- =============================================================================

BEGIN;

-- =============================================================================
-- Profiles
-- =============================================================================

CREATE TABLE profiles (

    id UUID PRIMARY KEY
        REFERENCES auth.users(id)
        ON DELETE CASCADE,

    company_name TEXT,

    city TEXT,

    state TEXT,

    about TEXT,

    website TEXT,

    status profile_status NOT NULL DEFAULT 'ACTIVE',

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_company_name
        CHECK (
            company_name IS NULL
            OR LENGTH(TRIM(company_name)) > 0
        ),

    CONSTRAINT chk_website
        CHECK (
            website IS NULL
            OR LENGTH(TRIM(website)) > 0
        )

);

COMMENT ON TABLE profiles IS
'Stores additional business information for authenticated users.';

-- =============================================================================
-- Indexes
-- =============================================================================

CREATE INDEX idx_profiles_city
ON profiles(city);

CREATE INDEX idx_profiles_state
ON profiles(state);

CREATE INDEX idx_profiles_status
ON profiles(status);

-- =============================================================================
-- Trigger
-- =============================================================================

CREATE TRIGGER trg_profiles_updated_at
BEFORE UPDATE
ON profiles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- Row Level Security
-- =============================================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Read active profiles

CREATE POLICY "Anyone can view active profiles"
ON profiles
FOR SELECT
USING (
    status = 'ACTIVE'
);

-- Insert own profile

CREATE POLICY "Users can create own profile"
ON profiles
FOR INSERT
WITH CHECK (
    id = auth.uid()
);

-- Update own profile

CREATE POLICY "Users can update own profile"
ON profiles
FOR UPDATE
USING (
    id = auth.uid()
);

-- Delete own profile

CREATE POLICY "Users can delete own profile"
ON profiles
FOR DELETE
USING (
    id = auth.uid()
);

COMMIT;