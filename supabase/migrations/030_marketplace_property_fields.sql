-- =============================================================================
-- Migration: 030_marketplace_property_fields.sql
-- Description:
--   Property-section attributes on marketplace_listings (industrial sheds,
--   warehouses, godowns, shops, etc.). Same approach as Scrap's fields in
--   019_marketplace_sections.sql: nullable columns, scoped to one section by a
--   CHECK constraint. No new tables and no RLS changes — the existing
--   marketplace_listings policies already cover the new columns.
--
--   Rent vs. sale is a separate axis from `intent` (SELL = "I'm offering this",
--   REQUIREMENT = "I'm looking for this"), so it gets its own column:
--     SELL        + RENT -> property available for rent
--     SELL        + SALE -> property for sale
--     REQUIREMENT + RENT -> looking to rent
--     REQUIREMENT + SALE -> looking to buy
--   For RENT, `price` is the monthly rent (for a requirement: monthly budget).
-- =============================================================================

BEGIN;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_type
        WHERE typname = 'property_deal_type'
    ) THEN
        CREATE TYPE property_deal_type AS ENUM (
            'RENT',
            'SALE'
        );
    END IF;
END $$;

COMMENT ON TYPE property_deal_type IS
'Whether a Property listing is for rent (price = monthly rent) or for sale.';

ALTER TABLE marketplace_listings
ADD COLUMN deal_type property_deal_type,
-- Free text validated against a static frontend list (PROPERTY_TYPES in
-- src/lib/constants.js) so it can grow without a migration — same pattern as
-- scrap material_type/shape and job_posts.job_category.
ADD COLUMN property_type TEXT,
ADD COLUMN area_sqft NUMERIC(12,2)
    CHECK (area_sqft IS NULL OR area_sqft > 0);

-- Property-only fields stay empty outside the Property section, and a
-- Property listing must say whether it's for rent or sale.
ALTER TABLE marketplace_listings
ADD CONSTRAINT chk_marketplace_property_fields_scoped
CHECK (
    (section = 'PROPERTY' AND deal_type IS NOT NULL)
    OR (
        section <> 'PROPERTY'
        AND deal_type IS NULL
        AND property_type IS NULL
        AND area_sqft IS NULL
    )
);

CREATE INDEX idx_marketplace_deal_type
ON marketplace_listings(deal_type)
WHERE deal_type IS NOT NULL;

COMMIT;
