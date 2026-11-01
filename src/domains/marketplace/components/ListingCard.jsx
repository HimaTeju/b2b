import { CONDITION_LABELS, SECTION_LABELS } from '../../../lib/constants'
import { formatListingPrice, formatLocation } from '../../../lib/format'
import { getPrimaryImage, getListingImageUrl } from '../api/listingImages'
import './ListingCard.css'

/**
 * Inner card content for a marketplace listing (image + condition stamp +
 * category/title/location/price). The wrapping clickable card container is
 * rendered by BrowseGrid.
 */
function ListingCard({ listing }) {
  const primaryImage = getPrimaryImage(listing.listing_images)

  return (
    <>
      <div className="listing-card__image">
        {primaryImage ? (
          <img src={getListingImageUrl(primaryImage.storage_path)} alt="" />
        ) : (
          <span className="listing-card__placeholder">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
              <rect x="3" y="4" width="18" height="16" rx="1.5" />
              <circle cx="8.5" cy="9.5" r="1.5" />
              <path d="M21 16l-5.5-5.5a1.5 1.5 0 0 0-2.12 0L5 19" />
            </svg>
          </span>
        )}
        {listing.condition && (
          <span className="stamp stamp--muted listing-card__condition">
            {CONDITION_LABELS[listing.condition]}
          </span>
        )}
      </div>

      <div className="listing-card__content">
        <span className="listing-card__category mono">{listing.machine_categories?.name || SECTION_LABELS[listing.section]}</span>
        <h3 className="listing-card__title">{listing.title}</h3>
        <p className="listing-card__location">{formatLocation(listing)}</p>
        <div className="listing-card__price mono">{formatListingPrice(listing)}</div>
      </div>
    </>
  )
}

export default ListingCard
