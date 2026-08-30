import { supabase } from '../supabase'

const BUCKET = 'listing-images'

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024 // 5 MB, matches the bucket's file_size_limit
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']

/**
 * Resolve a listing_images.storage_path into a URL an <img> can load.
 * The bucket is public, so this is a plain public URL (no signing needed).
 */
export function getListingImageUrl(storagePath) {
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(storagePath)
  return data.publicUrl
}

/** All of a listing's images, primary first then by display order. */
export function getOrderedImages(listingImages) {
  if (!listingImages || listingImages.length === 0) return []

  return listingImages
    .slice()
    .sort((a, b) => (b.is_primary ? 1 : 0) - (a.is_primary ? 1 : 0) || a.display_order - b.display_order)
}

/** Pick the image to show as the card/detail thumbnail for a listing. */
export function getPrimaryImage(listingImages) {
  return getOrderedImages(listingImages)[0] || null
}

function assertValidImageFile(file) {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    throw new Error('Only JPEG, PNG, or WEBP images are allowed')
  }
  if (file.size > MAX_IMAGE_BYTES) {
    throw new Error('Each image must be smaller than 5MB')
  }
}

/**
 * Upload one image file to Storage and record it in listing_images.
 * Rolls back the storage upload if the DB insert fails.
 */
export async function uploadListingImage({ file, profileId, listingId, isPrimary = false, displayOrder = 0 }) {
  assertValidImageFile(file)

  const extension = file.name.includes('.') ? file.name.split('.').pop() : 'jpg'
  const path = `${profileId}/${listingId}/${crypto.randomUUID()}.${extension}`

  const { error: uploadError } = await supabase.storage.from(BUCKET).upload(path, file, {
    cacheControl: '3600',
    upsert: false
  })

  if (uploadError) throw uploadError

  const { data, error } = await supabase
    .from('listing_images')
    .insert([{ listing_id: listingId, storage_path: path, is_primary: isPrimary, display_order: displayOrder }])
    .select()
    .single()

  if (error) {
    await supabase.storage.from(BUCKET).remove([path])
    throw error
  }

  return data
}

/**
 * Upload several new images for a listing in order. `startOrder` lets callers
 * append after images that already exist (edit flow). `makeFirstPrimary`
 * marks the first uploaded file as primary — pass true only when the listing
 * has no other images left, otherwise an existing primary stays put.
 */
export async function uploadListingImages(files, { profileId, listingId, startOrder = 0, makeFirstPrimary = false }) {
  const uploaded = []

  for (let i = 0; i < files.length; i++) {
    // Sequential, not Promise.all: keeps display_order deterministic and
    // avoids racing multiple uploads against the same listing_id.
    const image = await uploadListingImage({
      file: files[i],
      profileId,
      listingId,
      isPrimary: makeFirstPrimary && i === 0,
      displayOrder: startOrder + i
    })
    uploaded.push(image)
  }

  return uploaded
}

/** Delete listing images from both Storage and the DB. Accepts listing_images rows. */
export async function deleteListingImages(images) {
  if (!images || images.length === 0) return

  const { error: dbError } = await supabase
    .from('listing_images')
    .delete()
    .in('id', images.map(image => image.id))

  if (dbError) throw dbError

  const { error: storageError } = await supabase.storage
    .from(BUCKET)
    .remove(images.map(image => image.storage_path))

  if (storageError) throw storageError
}

/**
 * Remove only the Storage files for a set of listing_images rows, skipping
 * the listing_images DB delete. Use this right before deleting the parent
 * listing itself — listing_images.listing_id cascades on delete, so an
 * explicit row delete here would just be a redundant write.
 */
export async function deleteListingImageFiles(images) {
  if (!images || images.length === 0) return

  const { error } = await supabase.storage
    .from(BUCKET)
    .remove(images.map(image => image.storage_path))

  if (error) throw error
}
