import Skeleton from './Skeleton'
import './SkeletonCard.css'

/**
 * Card-shaped loading placeholder for BrowseGrid, matching either the
 * image-led layout (ListingCard) or the text-only layout (RequirementCard /
 * ProviderCard / SeekerCard) depending on `hasImage`.
 */
function SkeletonCard({ hasImage = false }) {
  return (
    <div className="skeleton-card">
      {hasImage && <Skeleton className="skeleton-card__image" />}
      <div className="skeleton-card__content">
        <Skeleton className="skeleton-card__line skeleton-card__line--label" />
        <Skeleton className="skeleton-card__line skeleton-card__line--title" />
        <Skeleton className="skeleton-card__line skeleton-card__line--title-2" />
        <Skeleton className="skeleton-card__line skeleton-card__line--sub" />
      </div>
    </div>
  )
}

export default SkeletonCard
