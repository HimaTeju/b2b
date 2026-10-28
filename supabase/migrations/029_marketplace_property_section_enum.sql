-- =============================================================================
-- Migration: 029_marketplace_property_section_enum.sql
-- Description:
--   Adds the PROPERTY value to marketplace_section (industrial sheds,
--   warehouses, godowns, shops, etc. — for rent or sale).
--
--   Kept in its own migration file on purpose: a newly added enum value cannot
--   be referenced (e.g. in CHECK constraints) until the transaction that added
--   it has committed, so the columns/constraints that use 'PROPERTY' live in
--   030_marketplace_property_fields.sql.
-- =============================================================================

ALTER TYPE marketplace_section ADD VALUE IF NOT EXISTS 'PROPERTY';
