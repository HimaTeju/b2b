import { CONDITION_LABELS, SECTION_LABELS, PROPERTY_DEAL_LABELS } from '../../../lib/constants'
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
          <span className="listing-card__placeholder">⚙</span>
        )}
        {listing.deal_type && (
          <span className="stamp stamp--muted listing-card__condition">
            {PROPERTY_DEAL_LABELS[listing.deal_type]}
          </span>
        )}
        {listing.condition && (
          <span className="stamp stamp--muted listing-card__condition">
            {CONDITION_LABELS[listing.condition]}
          </span>
        )}
      </div>

      <div className="listing-card__content">
        <span className="listing-card__category mono">{listing.property_type || listing.machine_categories?.name || SECTION_LABELS[listing.section]}</span>
        <h3 className="listing-card__title">{listing.title}</h3>
        <p className="listing-card__location">
          {formatLocation(listing)}{listing.area_sqft ? ` · ${Number(listing.area_sqft).toLocaleString('en-IN')} sq ft` : ''}
        </p>
        <div className="listing-card__price mono">{formatListingPrice(listing)}</div>
      </div>
    </>
  )
}

export default ListingCard
