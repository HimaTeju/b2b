import { CONDITION_LABELS } from '../lib/constants'
import { formatListingPrice, formatLocation } from '../lib/format'
import { getPrimaryImage, getListingImageUrl } from '../lib/api/listingImages'
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
        {listing.condition && (
          <span className="stamp stamp--muted listing-card__condition">
            {CONDITION_LABELS[listing.condition]}
          </span>
        )}
      </div>

      <div className="listing-card__content">
        <span className="listing-card__category mono">{listing.machine_categories?.name}</span>
        <h3 className="listing-card__title">{listing.title}</h3>
        <p className="listing-card__location">{formatLocation(listing)}</p>
        <div className="listing-card__price mono">{formatListingPrice(listing)}</div>
      </div>
    </>
  )
}

export default ListingCard
