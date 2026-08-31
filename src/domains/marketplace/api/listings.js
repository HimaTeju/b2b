import { createRequirementApi } from '../../../lib/api/createRequirementApi'
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
 * Marketplace listings — same shape/filter pattern as serviceRequirements.js/
 * jobworkRequirements.js/jobPosts.js, plus intent/section/price/city filters
 * and Storage cleanup on delete, which those tables have no equivalent of.
 */
const api = createRequirementApi({
  table: 'marketplace_listings',
  summarySelect: LISTING_SUMMARY_SELECT,
  detailSelect: LISTING_DETAIL_SELECT,
  applyFilters(query, { intent, section, city, minPrice, maxPrice }) {
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

    return query
  },
  // `images` should be the listing's already-loaded listing_images rows
  // (e.g. from getListing) — passing them in avoids an extra SELECT just to
  // find what to remove from Storage. The listing_images DB rows themselves
  // aren't deleted explicitly: listing_images.listing_id cascades on
  // delete, so removing the listing row clears them for free.
  beforeDelete: (id, images) => deleteListingImageFiles(images)
})

/**
 * Get active marketplace listings with optional filters.
 * `categoryIds` matches against a set of category ids (a top-level category plus its children).
 */
export const getListings = api.getMany
export const getListing = api.getOne
export const getMyListings = api.getMine
export const createListing = api.create
export const updateListing = api.update
export const deleteListing = api.remove
