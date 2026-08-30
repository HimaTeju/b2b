import { supabase } from '../supabase'
import { deleteListingImageFiles } from './listingImages'

const LISTING_SUMMARY_SELECT = `
  id,
  profile_id,
  machine_category_id,
  intent,
  section,
  title,
  description,
  condition,
  price,
  quantity,
  city,
  state,
  status,
  material_type,
  shape,
  weight,
  weight_unit,
  created_at,
  updated_at,
  machine_categories:machine_category_id ( id, name ),
  listing_images ( id, storage_path, is_primary, display_order )
`

const LISTING_DETAIL_SELECT = `
  ${LISTING_SUMMARY_SELECT},
  profiles:profile_id ( id, company_name, city, state, about, website )
`

/**
 * Get active marketplace listings with optional filters.
 * `categoryIds` matches against a set of category ids (a top-level category plus its children).
 */
export async function getListings({
  categoryIds,
  intent,
  section,
  city,
  search,
  minPrice,
  maxPrice,
  excludeProfileId,
  limit = 50,
  offset = 0
} = {}) {
  let query = supabase
    .from('marketplace_listings')
    .select(LISTING_SUMMARY_SELECT)
    .eq('status', 'ACTIVE')
    .order('created_at', { ascending: false })

  if (categoryIds && categoryIds.length > 0) {
    query = query.in('machine_category_id', categoryIds)
  }

  if (intent) {
    query = query.eq('intent', intent)
  }

  if (section) {
    query = query.eq('section', section)
  }

  if (city) {
    query = query.ilike('city', `%${city}%`)
  }

  if (minPrice !== undefined && minPrice !== null && minPrice !== '') {
    query = query.gte('price', minPrice)
  }

  if (maxPrice !== undefined && maxPrice !== null && maxPrice !== '') {
    query = query.lte('price', maxPrice)
  }

  if (excludeProfileId) {
    query = query.neq('profile_id', excludeProfileId)
  }

  if (search) {
    query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`)
  }

  query = query.range(offset, offset + limit - 1)

  const { data, error } = await query

  if (error) throw error

  return data
}

export async function getListing(id) {
  const { data, error } = await supabase
    .from('marketplace_listings')
    .select(LISTING_DETAIL_SELECT)
    .eq('id', id)
    .single()

  if (error) throw error

  return data
}

export async function getMyListings(profileId) {
  const { data, error } = await supabase
    .from('marketplace_listings')
    .select(LISTING_SUMMARY_SELECT)
    .eq('profile_id', profileId)
    .order('created_at', { ascending: false })

  if (error) throw error

  return data
}

export async function createListing(listingData) {
  const { data, error } = await supabase
    .from('marketplace_listings')
    .insert([listingData])
    .select()
    .single()

  if (error) throw error

  return data
}

export async function updateListing(id, updates) {
  const { data, error } = await supabase
    .from('marketplace_listings')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error

  return data
}

/**
 * Delete a listing. `images` should be the listing's already-loaded
 * listing_images rows (e.g. from getListing) — passing them in avoids an
 * extra SELECT just to find what to remove from Storage. The listing_images
 * DB rows themselves aren't deleted explicitly: listing_images.listing_id
 * cascades on delete, so removing the listing row clears them for free.
 */
export async function deleteListing(id, images) {
  await deleteListingImageFiles(images)

  const { error } = await supabase
    .from('marketplace_listings')
    .delete()
    .eq('id', id)

  if (error) throw error

  return true
}
