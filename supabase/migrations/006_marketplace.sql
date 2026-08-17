-- =============================================================================
-- Migration: 006_marketplace.sql
-- Description:
--   Creates marketplace listings and listing images.
-- =============================================================================

BEGIN;

-- =============================================================================
-- Marketplace Listings
-- =============================================================================

CREATE TABLE marketplace_listings (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    profile_id UUID NOT NULL
        REFERENCES profiles(id)
        ON DELETE CASCADE,

    machine_category_id UUID NOT NULL
        REFERENCES machine_categories(id)
        ON DELETE RESTRICT,

    intent listing_intent NOT NULL,

    title TEXT NOT NULL,

    description TEXT,

    condition condition_type,

    price NUMERIC(12,2)
        CHECK (price IS NULL OR price >= 0),

    quantity INTEGER NOT NULL DEFAULT 1
        CHECK (quantity > 0),

    city TEXT,

    state TEXT,

    status listing_status NOT NULL DEFAULT 'ACTIVE',

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()

);

COMMENT ON TABLE marketplace_listings IS
'Marketplace listings for Buy, Sell and Requirement.';

-- =============================================================================
-- Listing Images
-- =============================================================================

CREATE TABLE listing_images (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    listing_id UUID NOT NULL
        REFERENCES marketplace_listings(id)
        ON DELETE CASCADE,

    storage_path TEXT NOT NULL,

    display_order INTEGER NOT NULL DEFAULT 0
        CHECK (display_order >= 0),

    is_primary BOOLEAN NOT NULL DEFAULT FALSE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()

);

COMMENT ON TABLE listing_images IS
'Images associated with marketplace listings stored in Supabase Storage.';

-- =============================================================================
-- Indexes
-- =============================================================================

CREATE INDEX idx_marketplace_profile
ON marketplace_listings(profile_id);

CREATE INDEX idx_marketplace_category
ON marketplace_listings(machine_category_id);

CREATE INDEX idx_marketplace_intent
ON marketplace_listings(intent);

CREATE INDEX idx_marketplace_status
ON marketplace_listings(status);

CREATE INDEX idx_marketplace_city
ON marketplace_listings(city);

CREATE INDEX idx_marketplace_state
ON marketplace_listings(state);

CREATE INDEX idx_listing_images_listing
ON listing_images(listing_id);

CREATE INDEX idx_listing_images_primary
ON listing_images(is_primary);

-- =============================================================================
-- Triggers
-- =============================================================================

CREATE TRIGGER trg_marketplace_updated_at
BEFORE UPDATE
ON marketplace_listings
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- Row Level Security
-- =============================================================================

ALTER TABLE marketplace_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE listing_images ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------------
-- Marketplace Listings
-- ---------------------------------------------------------------------------

CREATE POLICY "Anyone can view active marketplace listings"
ON marketplace_listings
FOR SELECT
USING (
    status = 'ACTIVE'
);

CREATE POLICY "Users can create marketplace listings"
ON marketplace_listings
FOR INSERT
WITH CHECK (
    profile_id = auth.uid()
);

CREATE POLICY "Users can update own marketplace listings"
ON marketplace_listings
FOR UPDATE
USING (
    profile_id = auth.uid()
)
WITH CHECK (
    profile_id = auth.uid()
);

CREATE POLICY "Users can delete own marketplace listings"
ON marketplace_listings
FOR DELETE
USING (
    profile_id = auth.uid()
);

-- ---------------------------------------------------------------------------
-- Listing Images
-- ---------------------------------------------------------------------------

CREATE POLICY "Anyone can view listing images"
ON listing_images
FOR SELECT
USING (TRUE);

CREATE POLICY "Users can insert images for own listings"
ON listing_images
FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1
        FROM marketplace_listings ml
        WHERE ml.id = listing_id
          AND ml.profile_id = auth.uid()
    )
);

CREATE POLICY "Users can delete images from own listings"
ON listing_images
FOR DELETE
USING (
    EXISTS (
        SELECT 1
        FROM marketplace_listings ml
        WHERE ml.id = listing_id
          AND ml.profile_id = auth.uid()
    )
);

COMMIT;