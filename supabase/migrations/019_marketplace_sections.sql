-- =============================================================================
-- Migration: 019_marketplace_sections.sql
-- Description:
--   Splits the Marketplace domain into Machinery / Tools & Accessories / Scrap
--   sections. Machinery keeps a required machine_category_id; Tools &
--   Accessories gets an optional related-category link; Scrap gets its own
--   material/shape/weight attributes and no category at all.
-- =============================================================================

BEGIN;

-- -----------------------------------------------------------------------------
-- Marketplace Section
-- -----------------------------------------------------------------------------

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_type
        WHERE typname = 'marketplace_section'
    ) THEN
        CREATE TYPE marketplace_section AS ENUM (
            'MACHINERY',
            'TOOLS_ACCESSORIES',
            'SCRAP'
        );
    END IF;
END $$;

COMMENT ON TYPE marketplace_section IS
'Which of the 3 marketplace browse verticals a listing belongs to.';

-- -----------------------------------------------------------------------------
-- Weight Unit (Scrap listings)
-- -----------------------------------------------------------------------------

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_type
        WHERE typname = 'weight_unit_type'
    ) THEN
        CREATE TYPE weight_unit_type AS ENUM (
            'GM',
            'KG'
        );
    END IF;
END $$;

COMMENT ON TYPE weight_unit_type IS
'Unit for marketplace_listings.weight, used by Scrap listings.';

-- =============================================================================
-- marketplace_listings changes
-- =============================================================================

-- Defaulted so this is safe to backfill on existing rows, which are all
-- today's Machinery listings.
ALTER TABLE marketplace_listings
ADD COLUMN section marketplace_section NOT NULL DEFAULT 'MACHINERY';

-- Category is only mandatory for Machinery: Tools & Accessories gets an
-- optional related-category link, Scrap doesn't use it at all.
ALTER TABLE marketplace_listings
ALTER COLUMN machine_category_id DROP NOT NULL;

ALTER TABLE marketplace_listings
ADD CONSTRAINT chk_marketplace_machinery_requires_category
CHECK (section <> 'MACHINERY' OR machine_category_id IS NOT NULL);

ALTER TABLE marketplace_listings
ADD COLUMN material_type TEXT,
ADD COLUMN shape TEXT,
ADD COLUMN weight NUMERIC(12,2)
    CHECK (weight IS NULL OR weight >= 0),
ADD COLUMN weight_unit weight_unit_type;

-- Scrap-only fields stay empty outside the Scrap section.
ALTER TABLE marketplace_listings
ADD CONSTRAINT chk_marketplace_scrap_fields_scoped
CHECK (
    section = 'SCRAP'
    OR (
        material_type IS NULL
        AND shape IS NULL
        AND weight IS NULL
        AND weight_unit IS NULL
    )
);

-- =============================================================================
-- Indexes
-- =============================================================================

CREATE INDEX idx_marketplace_section
ON marketplace_listings(section);

COMMIT;
