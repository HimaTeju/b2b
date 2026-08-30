-- =============================================================================
-- Migration: 017_listing_images_storage.sql
-- Description:
--   Creates the Supabase Storage bucket that listing_images.storage_path
--   values (added in 006_marketplace.sql) point into, plus storage RLS
--   policies mirroring the ownership rules already enforced on the
--   listing_images table itself.
--
--   Objects are uploaded under `${profile_id}/${listing_id}/${filename}`,
--   so ownership can be checked from the path alone via
--   storage.foldername(name)[1] without a join back to marketplace_listings.
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
ON CONFLICT (id) DO NOTHING;

-- ---------------------------------------------------------------------------
-- Storage objects RLS
-- ---------------------------------------------------------------------------

CREATE POLICY "Anyone can view listing images in storage"
ON storage.objects
FOR SELECT
USING (
    bucket_id = 'listing-images'
);

CREATE POLICY "Owners can upload listing images"
ON storage.objects
FOR INSERT
WITH CHECK (
    bucket_id = 'listing-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
);

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

CREATE POLICY "Owners can delete own listing images from storage"
ON storage.objects
FOR DELETE
USING (
    bucket_id = 'listing-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
);

COMMIT;
