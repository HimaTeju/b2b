-- =============================================================================
-- Migration: 004_machine_categories.sql
-- Description:
--   Creates the hierarchical machine categories master table.
-- =============================================================================

BEGIN;

-- =============================================================================
-- Machine Categories
-- =============================================================================

CREATE TABLE machine_categories (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    parent_id UUID
        REFERENCES machine_categories(id)
        ON DELETE RESTRICT,

    name TEXT NOT NULL,

    display_order INTEGER NOT NULL DEFAULT 0,

    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_machine_category_parent_name
        UNIQUE(parent_id, name)

);

COMMENT ON TABLE machine_categories IS
'Hierarchical machine category master used across marketplace, services, job work and careers.';

-- =============================================================================
-- Indexes
-- =============================================================================

CREATE INDEX idx_machine_categories_parent
ON machine_categories(parent_id);

CREATE INDEX idx_machine_categories_active
ON machine_categories(is_active);

CREATE INDEX idx_machine_categories_display_order
ON machine_categories(display_order);

-- =============================================================================
-- Trigger
-- =============================================================================

CREATE TRIGGER trg_machine_categories_updated_at
BEFORE UPDATE
ON machine_categories
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- Row Level Security
-- =============================================================================

ALTER TABLE machine_categories ENABLE ROW LEVEL SECURITY;

-- Everyone can read active categories

CREATE POLICY "Anyone can view active machine categories"
ON machine_categories
FOR SELECT
USING (
    is_active = TRUE
);

COMMIT;