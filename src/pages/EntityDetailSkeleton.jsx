import Skeleton from '../components/Skeleton'

/**
 * Shared loading placeholder for the entity-detail pages (service/job-work
 * providers & requirements, job posts, job seekers, packers & movers) — they
 * all use the same entity-detail__* layout classes.
 */
function EntityDetailSkeleton() {
  return (
    <div className="entity-detail" aria-hidden="true">
      <div className="entity-detail__content">
        <div className="entity-detail__header">
          <Skeleton style={{ width: 90, height: 20 }} />
          <Skeleton style={{ width: '80%', height: 26, marginTop: 8 }} />
          <Skeleton style={{ width: '45%', height: 14, marginTop: 8 }} />
        </div>

        <div className="entity-detail__section">
          <Skeleton style={{ width: 120, height: 16, marginBottom: 'var(--spacing-md)' }} />
          <Skeleton style={{ width: '100%', height: 12, marginBottom: 6 }} />
          <Skeleton style={{ width: '90%', height: 12, marginBottom: 6 }} />
          <Skeleton style={{ width: '60%', height: 12 }} />
        </div>
      </div>
    </div>
  )
}

export default EntityDetailSkeleton
