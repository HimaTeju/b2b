-- =============================================================================
-- Migration: 023_marketplace_advertising.sql
-- Description:
--   Adds a one-click "boost/advertise" flag for marketplace listings (issue
--   #28). No payment integration yet — is_advertised is a plain owner-toggled
--   flag, and advertised_at exists purely to order the Home page's Sponsored
--   section by most-recently-boosted first. Deliberately scoped to
--   marketplace_listings only, not a shared ads/campaign table.
-- =============================================================================

BEGIN;

ALTER TABLE marketplace_listings
ADD COLUMN is_advertised BOOLEAN NOT NULL DEFAULT FALSE,
ADD COLUMN advertised_at TIMESTAMPTZ;

COMMENT ON COLUMN marketplace_listings.is_advertised IS
'Owner-toggled "boost this post" flag — shows the listing in the Home page Sponsored section. No payment/expiry logic yet.';

COMMENT ON COLUMN marketplace_listings.advertised_at IS
'When the listing was last boosted. Used to order the Sponsored section by most-recent boost; NULL when never boosted.';

-- Partial index: only advertised rows are ever queried by this flag, and the
-- Sponsored query filters + orders on exactly these two columns together.
CREATE INDEX idx_marketplace_advertised
ON marketplace_listings(advertised_at DESC)
WHERE is_advertised = TRUE;

COMMIT;
