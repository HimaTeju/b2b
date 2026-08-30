-- =============================================================================
-- Migration: 018_recreate_listing_images_storage.sql
-- Description:
--   The `listing-images` Storage bucket and its RLS policies from
--   017_listing_images_storage.sql were recorded as applied in this project's
--   migration history, but the bucket was not actually present on the live
--   database (likely removed manually after being created). This migration
--   is an idempotent re-application of 017 so it's safe to run regardless of
--   which pieces already exist.
-- =============================================================================

BEGIN;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'listing-images',
    'listing-images',
    TRUE,
    5242880, -- 5 MB
    ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
    public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

-- ---------------------------------------------------------------------------
-- Storage objects RLS (drop + recreate so this is safe to re-run)
-- ---------------------------------------------------------------------------

DROP POLICY IF EXISTS "Anyone can view listing images in storage" ON storage.objects;
CREATE POLICY "Anyone can view listing images in storage"
ON storage.objects
FOR SELECT
USING (
    bucket_id = 'listing-images'
);

DROP POLICY IF EXISTS "Owners can upload listing images" ON storage.objects;
CREATE POLICY "Owners can upload listing images"
ON storage.objects
FOR INSERT
WITH CHECK (
    bucket_id = 'listing-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
);

DROP POLICY IF EXISTS "Owners can update own listing images in storage" ON storage.objects;
CREATE POLICY "Owners can update own listing images in storage"
ON storage.objects
FOR UPDATE
USING (
    bucket_id = 'listing-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
    bucket_id = 'listing-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
);

DROP POLICY IF EXISTS "Owners can delete own listing images from storage" ON storage.objects;
CREATE POLICY "Owners can delete own listing images from storage"
ON storage.objects
FOR DELETE
USING (
    bucket_id = 'listing-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
);

COMMIT;
