-- =============================================================================
-- Migration: 024_job_posts_category.sql
-- Description:
--   Adds a role-type classification to job_posts (issue #30) — Technician,
--   Mechanic, Designer, Programmer, etc. Plain free-text column backed by a
--   static frontend list (src/lib/constants.js JOB_CATEGORIES), not a
--   Postgres enum: this list is expected to grow/change over time and a DB
--   enum would need a migration for every addition. Mirrors the existing
--   free-text pattern already used for marketplace_listings' Scrap-only
--   material_type/shape columns.
-- =============================================================================

BEGIN;

ALTER TABLE job_posts
ADD COLUMN job_category TEXT;

COMMENT ON COLUMN job_posts.job_category IS
'Role type (Technician, Mechanic, Designer, Programmer, …) — free text validated against a static frontend list, not a DB enum, since this list is expected to grow. Nullable: existing posts are unclassified.';

CREATE INDEX idx_job_posts_category_type
ON job_posts(job_category);

COMMIT;
