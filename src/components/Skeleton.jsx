import './Skeleton.css'

/**
 * Base shimmer placeholder block. Composed into layout-shaped skeletons
 * (SkeletonCard, entity-detail/dashboard/enquiry skeletons) by pairing it
 * with each real component's existing CSS classes for sizing.
 */
function Skeleton({ className = '', style }) {
  return <div className={`skeleton ${className}`} style={style} aria-hidden="true" />
}

export default Skeleton
